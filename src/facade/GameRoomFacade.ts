import knex from "../db/knex.db";
import { getRandomString } from "../utils/stringUtil";

class GameRoomFacade {
  constructor() {}

  async createRoom(username: string) {
    const roomId = getRandomString(8);

    await knex("game_rooms")
      .insert({
        room_id: roomId,
        created_by: username,
        current_problem_id: 1,
      });

    return roomId;
  }

  async retrieveRooms() {
    const rooms = await knex("game_rooms").select();
    return rooms;
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

  async removeUserFromRoom(roomId: string, username: string, socketId: string) {
    await knex("game_room_users").where({ room_id: roomId, username, socket_id: socketId }).del();
  }

  async deleteRoom(roomId: string) {
    await knex("game_rooms").where({ room_id: roomId }).del();
  }
}

const gameRoomFacade = new GameRoomFacade();
export default gameRoomFacade;
