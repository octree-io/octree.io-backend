import { jwtDecode } from "jwt-decode";
import { Server, Socket } from "socket.io";
import { DecodedToken } from "../../server";
import { isTokenValid } from "../../utils/tokenValidator";

export class LobbyNamespace {
  private io: Server;
  private namespace;
  private users: { [key: string]: object };

  constructor(io: Server) {
    this.io = io;
    this.namespace = this.io.of("/lobby");
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

    console.log(`User ${username} has connected to Lobby`);

    socket.emit("welcome", { message: `Welcome to octree.io, ${username}!` });
    socket.emit("currentUsers", Object.values(this.users));
    this.namespace.emit("userJoined", { socketId: socket.id, username, profilePic });

    this.users[socket.id] = { username, profilePic };

    this.handleEvents(socket, decodedToken);
  }

  private handleEvents(socket: Socket, decodedToken: DecodedToken) {
    socket.on("message", (message) => this.handleMessage(socket, decodedToken, message));
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

  private handleDisconnect(socket: Socket) {
    const user: any = this.users[socket.id];
    console.log(`User ${user.username} has disconnected from Lobby`);
    this.namespace.emit("userLeft", { socketId: socket.id, ...user });
    delete this.users[socket.id];
  }
}
