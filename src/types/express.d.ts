declare namespace Express {
  export interface Request {
    user?: {
      userId: number,
      username: string,
      profilePic: string,
      expiredAt: Date,
    };
  }
}
