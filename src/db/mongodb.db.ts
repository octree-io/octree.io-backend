import * as dotenv from "dotenv";
import { Db, MongoClient } from "mongodb";

dotenv.config();

class MongodbClient {
  private client: MongoClient;
  private db: Db | null = null;

  constructor() {
    const url = process.env.MONGODB_CONNECTION_URL || "mongodb://localhost:27017/";
    this.client = new MongoClient(url);
    this.connect();
  }

  private async connect() {
    if (!this.db) {
      try {
        await this.client.connect();
        this.db = this.client.db(process.env.MONGODB_DATABASE_NAME);
        console.log("[mongodb] Successfully connected to MongoDB");
      } catch (error) {
        console.log("[mongodb] Error while connecting to MongoDB:", error);
        throw error;
      }
    }
  }

  public getDb() {
    if (!this.db) {
      console.log("[mongodb] db does not exist");
      return null;
    }
    return this.db;
  }
}

const mongoDbClient = new MongodbClient();
export default mongoDbClient;
