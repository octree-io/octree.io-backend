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

  async getUserInstancesByUsername(username: string) {
    const users = await knex("lobby_users").where({ username });
    return users;
  }

  async removeUserFromLobby(username: string, socketId: string) {
    await knex("lobby_users").where({ username, socket_id: socketId }).del();
  }

  async removeAllUsers() {
    await knex("lobby_users").del();
  }

  async storeChatMessage(messageId: string, username: string, profilePic: string, message: string) {
    await knex("lobby_messages")
      .insert({
        message_id: messageId,
        channel_id: "ac07cc31-6b93-47f1-843e-276556bf69e0", // #general
        username,
        profile_pic: profilePic,
        message,
      })
  }

  async loadChatHistory(messageLimit: number = 25) {
    const messages = await knex("lobby_messages")
      .select()
      .orderBy("sent_at", "asc")
      .limit(messageLimit);

    return messages.map((message) => ({
      messageId: message.message_id,
      username: message.username,
      profilePic: message.profile_pic,
      message: message.message,
      timestamp: new Date(message.sent_at).getTime(),
    }));
  }
}

const lobbyFacade = new LobbyFacade();
export default lobbyFacade;
