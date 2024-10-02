import { Request, Response, NextFunction } from "express";
import gameRoomFacade from "../facade/GameRoomFacade";
import eventBus from "../utils/eventBus";

export const createGameRoom = async (req: Request, res: Response, next: NextFunction) => {
  const { roomName } = req.body;
  const user = req.user;

  if (!roomName) {
    return res.status(400).json({ message: "Room name must not be blank" });
  }

  if (!user) {
    return res.status(401).json({ message: "Invalid user" });
  }

  const username = user.username;
  const roomId = await gameRoomFacade.createRoom(username, roomName);

  eventBus.emit("gameRoomCreated", { roomId, roomName });

  return res.status(200).json({ roomId });
};
