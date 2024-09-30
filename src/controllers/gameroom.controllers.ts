import { Request, Response, NextFunction } from "express";
import gameRoomFacade from "../facade/GameRoomFacade";

export const createGameRoom = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Invalid user" });
  }

  const username = user.username;
  const roomId = await gameRoomFacade.createRoom(username);

  return res.status(200).json({ roomId });
};
