// AUTO DB-IMPORT
import { Logger } from "util/logger"
import { SETTINGS } from "util/setting"
import { RedisClientType } from "redis"
import { DataSource, EntityManager } from "typeorm";


// import redis from "redis"
import User from "model/user"
import Board from "model/board";
import Comment from "model/comment";
import Url from "model/url";
import RefreshToken from "model/token";
import HashTag from "model/hashTag";
import UserHashTag from "model/userHashTag";

export default class DB {
      public static connection: DataSource

      public static redisClient: RedisClientType

      public static get Manager(): EntityManager {
            return DB.connection.manager
      }

      public static async initialize(): Promise<void> {
            const entities: Function[] = [
                  User,
                  Board,
                  Comment,
                  Url,
                  HashTag,
                  UserHashTag,
                  RefreshToken
            ]

            DB.connection = new DataSource({
                  type: "mysql",
                  supportBigNumbers: true,
                  bigNumberStrings: false,
                  ...SETTINGS.database,
                  synchronize: true, // synchronize: true여야 수정 entity가 반영
                  entities,
                  cache: true,
                  // logging: true,
                  // ssl: SSL_OPTIONS,
            })
            await DB.connection.initialize()
            Logger.passSignificant("DB").put(SETTINGS.database.host).out()

            // redis 초기화.
            // DB.redisClient = redis.createClient()
            // DB.redisClient.on("connect", () => {
            //       Logger.passSignificant("Redis").out()
            // })
            // DB.redisClient.on("error", (err) => {
            //       Logger.errorSignificant("Redis").put(err).out()
            // })
      }
}