import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import knex from "../db/knex.db";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "path";

const CDN_URL = "cdn.octree.io";
const DO_NOT_DELETE = "DO-NOT-DELETE";

const s3 = new S3Client({
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
  region: "auto",
});

const deletePreviousProfilePic = async (profilePic: string) => {
  if (profilePic.indexOf(CDN_URL) !== -1) {
    const imageName = profilePic.split(`${CDN_URL}/`)[1];

    if (imageName.startsWith(DO_NOT_DELETE)) {
      console.log(`Skipping deletion for profile picture ${profilePic}`);
      return;
    }

    try {
      const deleteParams = {
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: `${imageName}`,
      };

      await s3.send(new DeleteObjectCommand(deleteParams));
      console.log(`Previous image ${imageName} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting previous image ${imageName}:`, error);
    }
  }
};

export const changeProfilePic = async (req: Request, res: Response, next: NextFunction) => {
  const username = req.user?.username;
  const profilePic = req.user?.profilePic;
  const file = req.file;

  if (!username || !profilePic) {
    return res.status(401).json({ message: "Invalid username or profile picture" });
  }

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  deletePreviousProfilePic(profilePic);

  try {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;

    const params = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploadCommand = new PutObjectCommand(params);
    await s3.send(uploadCommand);

    await knex("users").where({ username }).update({
      profile_pic: `https://${CDN_URL}/${fileName}`,
    });

    return res.json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
};
