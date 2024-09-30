import { jwtDecode } from "jwt-decode";
import { Server, Socket } from "socket.io";
import { DecodedToken } from "../../server";
import { isTokenValid } from "../../utils/tokenValidator";
import gameRoomFacade from "../../facade/GameRoomFacade";

export class GameRoomNamespace {
  private io: Server;
  private namespace;
  private users: { [key: string]: object };

  constructor(io: Server) {
    this.io = io;
    this.namespace = this.io.of("/gameRoom");
    this.users = {};

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
    const profilePic = decodedToken.profilePic;

    console.log(`User ${username} has connected to Game Room`);

    socket.emit("currentUsers", Object.values(this.users));
    this.namespace.emit("userJoined", { socketId: socket.id, username, profilePic });

    this.users[socket.id] = { username, profilePic };

    this.handleEvents(socket, decodedToken);
  }

  private handleEvents(socket: Socket, decodedToken: DecodedToken) {
    socket.on("joinRoom", (roomId) => this.handleJoinRoom(socket, roomId));
    socket.on("message", (message) => this.handleMessage(socket, decodedToken, message));
    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  private async handleJoinRoom(socket: Socket, roomId: string) {
    if (!await gameRoomFacade.doesRoomExist(roomId)) {
      socket.emit("noSuchRoom");
      return;
    }

    socket.join(roomId);
    this.users[socket.id] = { ...this.users[socket.id], roomId };
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

  private handleDisconnect(socket: Socket) {
    const user: any = this.users[socket.id];
    if (!user) {
      return;
    }
    console.log(`User ${user.username} has disconnected from Game Room`);
    socket.leave(user.roomId);
    this.namespace.emit("userLeft", { socketId: socket.id, ...user });
    delete this.users[socket.id];
  }
}
