import knex from "../db/knex.db";
import mongoDbClient from "../db/mongodb.db";
import eventBus from "../utils/eventBus";
import { getRandomNumber } from "../utils/numberUtil";
import { getRandomString } from "../utils/stringUtil";
import problemsFacade from "./ProblemsFacade";
import { v4 as uuidv4 } from "uuid";

class GameRoomFacade {
  constructor() {}

  async createRoom(username: string, roomName: string) {
    const roomId = getRandomString(8);

    await knex("game_rooms")
      .insert({
        room_id: roomId,
        room_name: roomName,
        created_by: username,
        current_problem_id: 1,
      });

    return roomId;
  }

  async retrieveRooms() {
    const rooms = await knex("game_rooms").select();
    return rooms.map((room: any) => ({
      roomId: room.room_id,
      roomName: room.room_name,
      roundDuration: room.round_duration,
      roundEndCooldownDuration: room.round_end_cooldown_duration,
      currentRoundStartTime: room.current_round_start_time,
    }));
  }

  async doesRoomExist(roomId: string) {
    const result = await knex("game_rooms").where({ room_id: roomId }).first();
    return !!result;
  }

  async addUserToRoom(roomId: string, username: string, profilePic: string, socketId: string) {
    await knex("game_room_users")
      .insert({
        room_id: roomId,
        username,
        profile_pic: profilePic,
        socket_id: socketId,
      });
  }

  async getUserBySocketId(socketId: string) {
    const user = await knex("game_room_users").where({ socket_id: socketId }).first();
    if (!user) {
      return null;
    }
    return {
      roomId: user.room_id,
      username: user.username,
      profilePic: user.profile_pic,
      socketId: user.socket_id,
    };
  }

  async getUsersInRoom(roomId: string) {
    const users = await knex("game_room_users").where({ room_id: roomId });
    return users.map((user: any) => ({
      roomId: user.room_id,
      username: user.username,
      profilePic: user.profile_pic,
      socketId: user.socket_id,
    }));
  }

  async getRoomById(roomId: string) {
    const room = await knex("game_rooms").where({ room_id: roomId }).first();
    if (!room) {
      console.log(`[getRoomById] Room ${roomId} not found`);
      return;
    }
    return {
      roomId: room.room_id,
      roomName: room.room_name,
      roundDuration: room.round_duration,
      roundEndCooldownDuration: room.round_end_cooldown_duration,
      currentRoundStartTime: room.current_round_start_time,
    };
  }

  async getCurrentProblemForRoom(roomId: string) {
    const room = await knex("game_rooms").where({ room_id: roomId }).first();
    if (!room) {
      console.log(`[getCurrentProblemForRoom] Room ${roomId} not found`);
      return;
    }
    return room.current_problem_id;
  }

  async removeUserFromRoom(roomId: string, username: string, socketId: string) {
    await knex("game_room_users").where({ room_id: roomId, username, socket_id: socketId }).del();
  }

  async deleteRoom(roomId: string) {
    await knex("game_rooms").where({ room_id: roomId }).del();
  }

  async removeAllUsersFromAllRooms() {
    await knex("game_room_users").del();
  }

  async updateCurrentRoundStartTime(roomId: string) {
    const currentDate = new Date();

    await knex("game_rooms")
      .where({ room_id: roomId })
      .update({ current_round_start_time: currentDate });

    return currentDate;
  }

  async updateCurrentProblemId(roomId: string, problemId: number) {
    await knex("game_rooms")
      .where({ room_id: roomId })
      .update({ current_problem_id: problemId });
  }

  async storeSubmission(
    roomId: string,
    username: string | undefined,
    problemId: number,
    type: "run" | "submit",
    language: string,
    code: string,
    outputJson: string,
  ) {
    const submissionId = uuidv4();

    await knex("submissions")
      .insert({
        submission_id: submissionId,
        room_id: roomId,
        username,
        problem_id: problemId,
        type,
        language,
        code,
        output: outputJson
      });

    return submissionId;
  }

  async loadExistingRooms() {
    try {
      const rooms = await this.retrieveRooms();

      rooms.map(async (room) => {
        const currentRoundStartTime = room.currentRoundStartTime;
        const roundDuration = room.roundDuration;

        const currentTime = new Date().getTime();
        const roundEndTime = new Date(currentRoundStartTime).getTime() + (roundDuration * 1000);
        const timeRemaining = roundEndTime - currentTime;
        const roomId = room.roomId;
        const roomName = room.roomName;

        if (timeRemaining <= 0) {
          console.log(`[loadExistingRooms] Deleting room ${roomName} with roomId=[${roomId}] due to inactivity or expiration`);
          eventBus.emit("gameRoomDeleted", { roomId });
          await this.deleteRoom(roomId);
        } else {
          await this.scheduleNextRound(roomId, timeRemaining);
        }
      });
    } catch (error) {
      console.log("[loadExistingRooms] Error while loading existing rooms:", error);
    }
  }

  async scheduleNextRound(roomId: string, roundDuration: number, isFirstRound: boolean = false) {
    console.log(`[scheduleNextRound] Scheduling next round for room ${roomId} for duration ${roundDuration / 1000}s`);

    setTimeout(async () => {
      await this.startNextRound(roomId, isFirstRound);
    }, roundDuration);
  }

  async startNextRound(roomId: string, isFirstRound: boolean) {
    const room = await this.getRoomById(roomId);
    const users = await this.getUsersInRoom(roomId);

    if (!room) {
      console.log(`[startNextRound] Room ${roomId} does not exist`);
      return;
    }

    if (users.length === 0 && !isFirstRound) {
      console.log(`[startNextRound] Deleting room ${roomId} due to inactivity`);
      eventBus.emit("gameRoomDeleted", { roomId });
      await this.deleteRoom(roomId);
      return;
    }

    console.log(`[startNextRound] Starting next round for room ${room.roomName} with roomId ${roomId} ${isFirstRound ? "for the first round" : ""}`);

    const mongoDbInstance = mongoDbClient.getDb();
    let currentProblem = {};
    if (mongoDbInstance) {
      const problemsCollection = mongoDbInstance?.collection("problems");
      const numProblems = await problemsCollection?.countDocuments();

      const previousProblemId = await this.getCurrentProblemForRoom(roomId);
      let problemId = getRandomNumber(1, numProblems);

      if (numProblems > 1) {
        while (problemId === previousProblemId) {
          problemId = getRandomNumber(1, numProblems);
        }
      }

      problemId = 1;

      console.log(`[startNextRound] (Room ID ${roomId}) Choosing problemId=[${problemId}] for the next round's problem`);

      const randomProblem = await problemsFacade.getProblemById(problemId);

      if (randomProblem) {
        currentProblem = {
          name: randomProblem.name,
          slug: randomProblem.slug,
          description: randomProblem.description,
          difficulty: randomProblem.difficulty,
          starterCode: randomProblem.starterCode,
          sampleTestCases: randomProblem.sampleTestCases,
          constraints: randomProblem.constraints,
          topics: randomProblem.topics,
          companies: randomProblem.companies,
        };

        await this.updateCurrentProblemId(roomId, problemId);
      }
    }

    const currentRoundStartTime = (await this.updateCurrentRoundStartTime(roomId)).getTime();
    const roundDuration = room.roundDuration * 1000;
    this.scheduleNextRound(roomId, roundDuration);

    eventBus.emit("nextRoundStarted", { roomId, currentRoundStartTime, roundDuration, currentProblem });
  }
}

const gameRoomFacade = new GameRoomFacade();
export default gameRoomFacade;
