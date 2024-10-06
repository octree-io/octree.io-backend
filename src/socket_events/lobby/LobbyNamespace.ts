import { jwtDecode } from "jwt-decode";
import { Server, Socket } from "socket.io";
import { DecodedToken } from "../../server";
import { isTokenValid } from "../../utils/tokenValidator";
import gameRoomFacade from "../../facade/GameRoomFacade";
import lobbyFacade from "../../facade/LobbyFacade";
import eventBus from "../../utils/eventBus";
import { v4 as uuidv4 } from "uuid";

export class LobbyNamespace {
  private io: Server;
  private namespace;

  constructor(io: Server) {
    this.io = io;
    this.namespace = this.io.of("/lobby");

    this.namespace.on("connection", this.handleConnection.bind(this));

    eventBus.on("gameRoomCreated", this.handleGameRoomCreated.bind(this));
    eventBus.on("gameRoomDeleted", this.handleGameRoomDeleted.bind(this));
  }

  private async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token;

    if (!token) {
      socket.emit("error", { message: "Invalid token" });
      socket.disconnect();
      return;
    }

    if (!isTokenValid(token)) {
      socket.emit("tokenExpired", { message: "Expired token" });
      socket.disconnect();
      return;
    }

    const decodedToken: DecodedToken = jwtDecode(token);
    const username = decodedToken.username;
    const profilePic = decodedToken.profilePic;

    console.log(`User ${username} has connected to Lobby`);

    socket.emit("activeRooms", await gameRoomFacade.retrieveRooms());
    socket.emit("currentUsers", await lobbyFacade.getUsers());
    socket.emit("chatHistory", await lobbyFacade.loadChatHistory());
    this.namespace.emit("userJoined", { socketId: socket.id, username, profilePic });

    await lobbyFacade.addUserToLobby(username, profilePic, socket.id);

    this.handleEvents(socket, decodedToken);
  }

  private handleEvents(socket: Socket, decodedToken: DecodedToken) {
    socket.on("message", (message) => this.handleMessage(socket, decodedToken, message));
    socket.on("retrieveRooms", () => this.handleRetrieveRooms(socket));
    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  private async handleMessage(socket: Socket, decodedToken: DecodedToken, message: string) {
    const messageId = uuidv4();
    const username = decodedToken.username;

    this.namespace.emit("chatMessage", {
      messageId,
      socketId: socket.id,
      username,
      profilePic: decodedToken.profilePic,
      message,
      timestamp: Date.now()
    });

    await lobbyFacade.storeChatMessage(messageId, username, message);
  }

  private async handleRetrieveRooms(socket: Socket) {
    const rooms = await gameRoomFacade.retrieveRooms();
    socket.emit("activeRooms", rooms);
  }

  private async handleDisconnect(socket: Socket) {
    const user: any = await lobbyFacade.getUser(socket.id);
    if (!user) {
      return;
    }
    const username = user.username;
    console.log(`User ${username} has disconnected from Lobby`);
    await lobbyFacade.removeUserFromLobby(username, socket.id);

    const userInstances = await lobbyFacade.getUserInstancesByUsername(username);
    if (userInstances.length == 0) {
      this.namespace.emit("userLeft", { ...user });
    }
  }

  private async handleGameRoomCreated(data: { roomId: string, roomName: string }) {
    console.log(`Game room created`);
    console.log(data);

    this.namespace.emit("gameRoomCreated", data);
  }

  private async handleGameRoomDeleted(data: { roomId: string }) {
    console.log("Game room deleted");
    console.log(data);
    this.namespace.emit("gameRoomDeleted", data);
  }
}
