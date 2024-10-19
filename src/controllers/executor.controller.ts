import { Request, Response, NextFunction } from "express";
import gameRoomFacade from "../facade/GameRoomFacade";
import { sendMessageToQueue } from "../mq/rabbitmq.mq";

export const runCode = async (req: Request, res: Response, next: NextFunction) => {
  const { roomId, language, code, socketId } = req.body;

  if (!roomId || !language || !code || !socketId) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  try {
    const problemId = await gameRoomFacade.getCurrentProblemForRoom(roomId);
    const submissionId = await gameRoomFacade.storeSubmission(roomId, req.user?.username, problemId, "run", language, code, "");

    sendMessageToQueue("compilation_requests", {
      submissionId,
      socketId,
    });

    return res.status(200).json({ message: "Code request enqueued" });
  } catch (error: any) {
    return res.status(500).json({ message: "Error" });
  }
};

export const submitCode = async (req: Request, res: Response, next: NextFunction) => {
  const { roomId, language, code, socketId } = req.body;

  if (!roomId || !language || !code || !socketId) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const problemId = await gameRoomFacade.getCurrentProblemForRoom(roomId);
  const submissionId = await gameRoomFacade.storeSubmission(roomId, req.user?.username, problemId, "submit", language, code, "");

  sendMessageToQueue("compilation_requests", {
    submissionId,
    socketId,
  });

  return res.status(200).json({ message: "Code request enqueued" });
};
