import knex from "../db/knex.db";
import { getRandomString } from "../utils/stringUtil";

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
    }));
  }

  async doesRoomExist(roomId: string) {
    const result = await knex("game_rooms").where({ room_id: roomId }).first();
    return result !== null;
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

  async removeUserFromRoom(roomId: string, username: string, socketId: string) {
    await knex("game_room_users").where({ room_id: roomId, username, socket_id: socketId }).del();
  }

  async deleteRoom(roomId: string) {
    await knex("game_rooms").where({ room_id: roomId }).del();
  }

  async removeAllUsersFromAllRooms() {
    await knex("game_room_users").del();
  }
}

const gameRoomFacade = new GameRoomFacade();
export default gameRoomFacade;
