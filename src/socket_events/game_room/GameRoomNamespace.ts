import { jwtDecode } from "jwt-decode";
import { Server, Socket } from "socket.io";
import { DecodedToken } from "../../server";
import { isTokenValid } from "../../utils/tokenValidator";
import gameRoomFacade from "../../facade/GameRoomFacade";

export class GameRoomNamespace {
  private io: Server;
  private namespace;
  private roomId: string;

  constructor(io: Server) {
    this.io = io;
    this.namespace = this.io.of("/gameRoom");
    this.roomId = "default";

    this.namespace.on("connection", this.handleConnection.bind(this));
  }

  private handleConnection(socket: Socket) {
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

    console.log(`User ${username} has connected to Game Room`);

    socket.emit("welcome");

    this.handleEvents(socket, decodedToken);
  }

  private handleEvents(socket: Socket, decodedToken: DecodedToken) {
    socket.on("joinRoom", (roomId) => this.handleJoinRoom(socket, roomId, decodedToken));
    socket.on("message", (message) => this.handleMessage(socket, decodedToken, message));
    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  private async handleJoinRoom(socket: Socket, roomId: string, decodedToken: DecodedToken) {
    if (!await gameRoomFacade.doesRoomExist(roomId)) {
      socket.emit("noSuchRoom");
      return;
    }

    this.roomId = roomId;
    socket.join(this.roomId);
    const username = decodedToken.username;
    const profilePic = decodedToken.profilePic;

    socket.emit("currentUsers", await gameRoomFacade.getUsersInRoom(this.roomId));

    this.namespace.to(this.roomId).emit("userJoined", {
      roomId: this.roomId,
      username,
      profilePic,
      timestamp: Date.now()
    });

    await gameRoomFacade.addUserToRoom(roomId, username, profilePic, socket.id);
  }

  private handleMessage(socket: Socket, decodedToken: DecodedToken, message: string) {
    this.namespace.to(this.roomId).emit("chatMessage", {
      socketId: socket.id,
      username: decodedToken.username,
      profilePic: decodedToken.profilePic,
      message,
      timestamp: Date.now(),
      type: "user",
    });
  }

  private async handleDisconnect(socket: Socket) {
    const user: any = await gameRoomFacade.getUserBySocketId(socket.id);
    if (!user) {
      return;
    }
    console.log(`User ${user.username} has disconnected from Game Room`);
    socket.leave(user.roomId);
    this.namespace.emit("userLeft", { ...user });
    await gameRoomFacade.removeUserFromRoom(user.roomId, user.username, user.socketId);
  }
}
