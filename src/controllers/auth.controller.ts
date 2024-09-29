import axios from "axios";
import { Request, Response, NextFunction } from "express";
import knex from "../db/knex.db";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const DEFAULT_PROFILE_PICTURES = [
  "https://singlecolorimage.com/get/7da5ee/100x100"
];

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "123456";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "123456";
const ACCESS_TOKEN_EXPIRY = "2h";
const REFRESH_TOKEN_EXPIRY = "30d";

export const passwordSignup = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  const existingUser = await knex("users").whereRaw("LOWER(username) = ?", username.toLowerCase()).first();
  if (existingUser) {
    return res.status(400).json({ message: "Username already taken" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [newUser] = await knex("users").insert({
    username,
    email,
    password: hashedPassword,
    profile_pic: getRandomElement(DEFAULT_PROFILE_PICTURES),
  }).returning('*');

  const accessToken = generateAccessToken({ userId: newUser.id, username: newUser.username });
  const refreshToken = generateRefreshToken({ userId: newUser.id });

  const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await saveRefreshTokenToDb(newUser.id, refreshToken, refreshTokenExpiry);

  setRefreshTokenCookie(res, refreshToken);

  return res.json({ accessToken });
};

export const googleSignup = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Invalid token" });
  }

  const googleInfo = await fetchGoogleUserInfo(token);
  const existingUser = await knex('users').where({ google_id: googleInfo.sub }).first();

  if (existingUser) {
    const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const accessToken = generateAccessToken({
      userId: existingUser.id,
      username: existingUser.username,
      profilePic: existingUser.profile_pic,
      expiredAt: refreshTokenExpiry,
    });
    const refreshToken = generateRefreshToken({ userId: existingUser.id });

    await saveRefreshTokenToDb(existingUser.id, refreshToken, refreshTokenExpiry);

    setRefreshTokenCookie(res, refreshToken);

    return res.json({ accessToken });
  }

  const baseUsername = googleInfo.email.split('@')[0];
  const username = await generateUniqueUsername(baseUsername);

  const [newUser] = await knex('users').insert({
    email: googleInfo.email,
    google_id: googleInfo.sub,
    username,
    profile_pic: googleInfo.picture,
  }).returning('*');

  const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const accessToken = generateAccessToken({ userId: newUser.id, username });
  const refreshToken = generateRefreshToken({ userId: newUser.id });

  await saveRefreshTokenToDb(newUser.id, refreshToken, refreshTokenExpiry);

  setRefreshTokenCookie(res, refreshToken);

  return res.json({ accessToken });
};

export const passwordLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  const user = await knex("users")
    .whereRaw("LOWER(username) = ?", username.toLowerCase())
    .first();

  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const accessToken = generateAccessToken({
    userId: user.id,
    username: user.username,
    profilePic: user.profile_pic,
    expiredAt: refreshTokenExpiry,
  });
  const refreshToken = generateRefreshToken({ userId: user.id });

  await saveRefreshTokenToDb(user.id, refreshToken, refreshTokenExpiry);

  setRefreshTokenCookie(res, refreshToken);

  return res.json({ accessToken });
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  const googleInfo = await fetchGoogleUserInfo(token);
  if (!googleInfo) {
    return res.status(400).json({ message: "Error while fetching Google profile" });
  }

  const existingUser = await knex('users').where({ google_id: googleInfo.sub }).first();

  if (!existingUser) {
    return res.status(400).json({ message: 'User not found, please sign up first.' });
  }

  const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const accessToken = generateAccessToken({
    userId: existingUser.id,
    username: existingUser.username,
    profilePic: existingUser.profile_pic,
    expiredAt: refreshTokenExpiry,
  });
  const refreshToken = generateRefreshToken({ userId: existingUser.id });

  await saveRefreshTokenToDb(existingUser.id, refreshToken, refreshTokenExpiry);

  setRefreshTokenCookie(res, refreshToken);

  return res.json({ accessToken });
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number };

  const tokenInDb = await knex('refresh_tokens')
    .where({ user_id: decoded.userId, token: refreshToken })
    .first();

  if (!tokenInDb) {
    return res.status(403).json({ message: 'Refresh token not found' });
  }

  const currentTime = new Date();
  if (new Date(tokenInDb.expired_at) < currentTime) {
    await knex("refresh_tokens")
      .where({ user_id: decoded.userId, token: refreshToken })
      .del();

    return res.status(403).json({ message: 'Refresh token has expired' });
  }

  const user = await knex('users')
    .where({ id: decoded.userId })
    .select('username', 'profile_pic')
    .first();

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const newAccessToken = generateAccessToken({
    userId: decoded.userId,
    username: user.username,
    profilePic: user.profile_pic,
    expiredAt: refreshTokenExpiry,
  });
  const newRefreshToken = generateRefreshToken({ userId: decoded.userId });

  await knex.transaction(async (trx) => {
    await trx('refresh_tokens')
      .where({ user_id: decoded.userId, token: refreshToken })
      .del();

    await trx('refresh_tokens').insert({
      user_id: decoded.userId,
      token: newRefreshToken,
      expired_at: refreshTokenExpiry,
    });
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  });

  setRefreshTokenCookie(res, newRefreshToken);

  return res.json({ accessToken: newAccessToken });
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  try {
    await knex("refresh_tokens").where({ token: refreshToken }).del();

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (e) {
    next(e);
  }
};

const isUsernameTaken = async (username: string): Promise<boolean> => {
  const user = await knex("users").whereRaw("LOWER(username) = ?", username.toLowerCase()).first();
  return !!user;
};

const fetchGoogleUserInfo = async (accessToken: string) => {
  let response = null;
  try {
    response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    response = response.data;
  } catch (e) {
    console.log("[fetchGoogleUserInfo]", e);
  }

  return response;
}

const generateRandomNumber = (): number => {
  return Math.floor(Math.random() * 9999);
};

function getRandomElement(arr: any) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};

const generateUniqueUsername = async (baseUsername: string): Promise<string> => {
  let username = baseUsername;

  if (username.length > 12) {
    username = username.substring(0, 12);
  }

  while (await isUsernameTaken(username)) {
    const randomNum = generateRandomNumber();

    const maxBaseLength = 12 - randomNum.toString().length;
    const truncatedBaseUsername = username.substring(0, maxBaseLength);

    username = `${truncatedBaseUsername}${randomNum}`;
  }

  return username;
};

const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const saveRefreshTokenToDb = async (userId: number, token: string, expiredAt: Date) => {
  await knex("refresh_tokens").insert({ user_id: userId, token, expired_at: expiredAt });
};
