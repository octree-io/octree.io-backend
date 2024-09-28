import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from "dotenv";

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "123456";

interface JwtPayload {
  userId: number,
  username: string,
  profilePic: string,
  expiredAt: Date,
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (typeof authHeader !== 'string') {
    return res.status(401).json({ message: 'Access token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1]; // Split the "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  jwt.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Access token expired' });
      }
      console.log(err);
      return res.status(403).json({ message: 'Invalid access token' });
    }

    req.user = decoded as JwtPayload;
    next();
  });
};
