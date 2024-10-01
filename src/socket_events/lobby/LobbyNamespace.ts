import { jwtDecode } from "jwt-decode";
import { Server, Socket } from "socket.io";
import { DecodedToken } from "../../server";
import { isTokenValid } from "../../utils/tokenValidator";
import gameRoomFacade from "../../facade/GameRoomFacade";
import lobbyFacade from "../../facade/LobbyFacade";

export class LobbyNamespace {
  private io: Server;
  private namespace;

  constructor(io: Server) {
    this.io = io;
    this.namespace = this.io.of("/lobby");

    this.namespace.on("connection", this.handleConnection.bind(this));
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
    this.namespace.emit("userJoined", { socketId: socket.id, username, profilePic });

    await lobbyFacade.addUserToLobby(username, profilePic, socket.id);

    this.handleEvents(socket, decodedToken);
  }

  private handleEvents(socket: Socket, decodedToken: DecodedToken) {
    socket.on("message", (message) => this.handleMessage(socket, decodedToken, message));
    socket.on("retrieveRooms", () => this.handleRetrieveRooms(socket));
    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  private handleMessage(socket: Socket, decodedToken: DecodedToken, message: string) {
    this.namespace.emit("chatMessage", {
      socketId: socket.id,
      username: decodedToken.username,
      profilePic: decodedToken.profilePic,
      message,
      timestamp: Date.now()
    });
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
}
