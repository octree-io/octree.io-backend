import http from "http";
import express, { Express } from "express";
import morgan from "morgan";
import echoRoutes from "./routes/echo.routes";
import authRoutes from "./routes/auth.routes";
import executorRoutes from "./routes/executor.routes";
import cors from "cors";

const router: Express = express();

router.use(morgan("dev")); // Logging
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
router.use(cors());

router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
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

router.use((req, res, next) => {
    const error = new Error("not found");
    return res.status(404).json({
        message: error.message
    });
});

const httpServer = http.createServer(router);
const PORT: any = process.env.SERVER_PORT ?? 8000;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));

export default router;
