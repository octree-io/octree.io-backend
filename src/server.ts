import http from "http";
import express, { Express } from "express";
import morgan from "morgan";
import echoRoutes from "./routes/echo.routes";
import authRoutes from "./routes/auth.routes";
import executorRoutes from "./routes/executor.routes";
import imagesRoutes from "./routes/images.routes";
import gameRoomRoutes from "./routes/gameroom.routes";
import triviaRoutes from "./routes/trivia.routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { LobbyNamespace } from "./socket_events/lobby/LobbyNamespace";
import lobbyFacade from "./facade/LobbyFacade";
import gameRoomFacade from "./facade/GameRoomFacade";
import { GameRoomNamespace } from "./socket_events/game_room/GameRoomNamespace";
import triviaFacade from "./facade/TriviaFacade";
import { compilationRequestsQueueListener } from "./mq/CompilationResponsesQueueListener";

export interface DecodedToken {
  userId: number;
  username: string;
  profilePic: string;
  expiredAt: Date;
}

const router: Express = express();

router.use(morgan("dev")); // Logging
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
router.use(cors({
  origin: true,
  credentials: true,
}));
router.use(cookieParser());

router.use((req, res, next) => {
    const origin = req.headers.origin;

    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "origin, X-Requested-With,Content-Type,Accept, Authorization");

    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
        return res.status(200).json({});
    }

    next();
});

router.use("/echo", echoRoutes);
router.use("/auth", authRoutes);
router.use("/execute", executorRoutes);
router.use("/images", imagesRoutes);
router.use("/game-room", gameRoomRoutes);
router.use("/trivia", triviaRoutes);

router.use((req, res, next) => {
    const error = new Error("not found");
    return res.status(404).json({
        message: error.message
    });
});

const httpServer = http.createServer(router);

const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  }
});

const loadExistingRoomsFromDb = async () => {
  await gameRoomFacade.loadExistingRooms();
  await triviaFacade.loadTriviaRoomsFromDb();
};

loadExistingRoomsFromDb();
new LobbyNamespace(io);
new GameRoomNamespace(io);
compilationRequestsQueueListener();

const handleExit = async (type: string, error: Error | null) => {
  console.log(`Got ${type}, shutting down`);

  if (error) {
    console.log("Error:", error.stack || error);
  }

  console.log("Wiping out Lobby users");
  await lobbyFacade.removeAllUsers();
  console.log("Wiping out Game Room users");
  await gameRoomFacade.removeAllUsersFromAllRooms();
  process.exit();
};

process.on("uncaughtException", async (error) => await handleExit("uncaughtException", error));
process.on("unhandledRejection", async (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  await handleExit("unhandledRejection", error);
});
process.on("SIGINT", async () => await handleExit("SIGINT", null));
process.on("SIGTERM", async () => await handleExit("SIGTERM", null));

const PORT: any = process.env.SERVER_PORT ?? 8000;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));

export default router;
