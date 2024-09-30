import knex from "../db/knex.db";

class LobbyFacade {
  async addUserToLobby(username: string, profilePic: string, socketId: string) {
    await knex("lobby_users")
      .insert({
        username,
        profile_pic: profilePic,
        socket_id: socketId,
      });
  }

  async getUser(socketId: string) {
    const user = await knex("lobby_users").where({ socket_id: socketId }).first();
    if (!user) {
      return null;
    }
    return {
      username: user.username,
      profilePic: user.profile_pic,
      socketId: user.socket_id,
    };
  }

  async getUsers() {
    const users = await knex("lobby_users").select();
    return users.map(item => ({
      username: item.username,
      profilePic: item.profile_pic,
      socketId: item.socket_id
    }));
  }

  async removeUserFromLobby(username: string, socketId: string) {
    await knex("lobby_users").where({ username, socket_id: socketId }).del();
  }

  async removeAllUsers() {
    await knex("lobby_users").del();
  }
}

const lobbyFacade = new LobbyFacade();
export default lobbyFacade;
