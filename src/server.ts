import http from "http";
import express, { Express } from "express";
import morgan from "morgan";
import echoRoutes from "./routes/echo.routes";
import authRoutes from "./routes/auth.routes";
import executorRoutes from "./routes/executor.routes";
import imagesRoutes from "./routes/images.routes";
import gameRoomRoutes from "./routes/gameroom.routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { LobbyNamespace } from "./socket_events/lobby/LobbyNamespace";
import lobbyFacade from "./facade/LobbyFacade";

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

new LobbyNamespace(io);

process.on("SIGINT", async () => {
  console.log("Got SIGINT, shutting down and wiping out lobby users");
  await lobbyFacade.removeAllUsers();
  process.exit();
});

const PORT: any = process.env.SERVER_PORT ?? 8000;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));

export default router;
