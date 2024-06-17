// AUTO DB-IMPORT
import { Logger } from "util/logger"
import { SETTINGS } from "util/setting"
import { DataSource, EntityManager } from "typeorm";

import Waitlist from "model/waitlist";
import Statistics from "model/statistics";


export default class DB {
      public static connection: DataSource

      public static get Manager(): EntityManager {
            return DB.connection.manager
      }

      public static async initialize(): Promise<void> {
            const entities: Function[] = [
                  Waitlist,
                  Statistics
            ]

            DB.connection = new DataSource({
                  type: "mysql",
                  supportBigNumbers: true,
                  bigNumberStrings: false,
                  ...SETTINGS.database,
                  synchronize: true, // synchronize: true여야 수정 entity가 반영
                  entities,
                  cache: true,
                  charset: 'utf8mb4'
                  // logging: true,
                  // ssl: SSL_OPTIONS,
            })
            await DB.connection.initialize()
            const entry = await DB.Manager.findOne(Statistics, { where: { category: "visit" } })
            if (!entry) {
                  await DB.Manager.save(Statistics, { category: "visit" })
            }
            Logger.passSignificant("DB").put(SETTINGS.database.host).out()
      }
}
