import { Knex, knex } from "knex";
import * as dotenv from "dotenv";

dotenv.config();

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      database: `${process.env.DATABASE}`,
      user: `${process.env.USER}`,
      password: `${process.env.PASSWORD}`,
      host: `${process.env.HOST}`,
      port: Number(`${process.env.DB_PORT}`),
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/migrations"
    },
    seeds: {
      directory: "./src/seeds"
    },
  },

  production: {
    client: "pg",
    connection: {
      database: `${process.env.DATABASE}`,
      user: `${process.env.USER}`,
      password: `${process.env.PASSWORD}`,
      host: `${process.env.HOST}`,
      port: Number(`${process.env.DB_PORT}`),
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./dist/migrations"
    },
    seeds: {
      directory: "./dist/seeds"
    },
  },
};

const environment = process.env.NODE_ENV || 'development';
const knexInstance = knex(knexConfig[environment]);

console.log(`[knex] Using environment ${environment}`);

export default knexInstance;
