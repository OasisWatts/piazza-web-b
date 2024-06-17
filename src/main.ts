import express from "express"
import DB from "database/connection"
import { CLOTHES, SETTINGS, writeClientConstants } from "util/setting"
import { Logger } from "util/logger";
require('dotenv').config();

const controller = require("controller/controller")

const app = express()
const cors = require("cors")

declare global {
      namespace Express {
            interface Request {
                  decoded: { userKey: number };
            }
      }
}
export const send404 = (req, res) => {
      res.sendStatus(404)
}

Logger.initialize("piazza").then(async () => {
      DB.initialize().then(() => {
            writeClientConstants()
            app.use(express.urlencoded({ extended: true }))
            app.use(express.text())
            app.use(express.json())
            app.use(cors()) // TODO

            app.get("/", async (req, res) => {
                  res.send("succeed! succeed!")
            })
            app.get("/api", async (req, res) => {
                  res.send("api test succeed!!")
            })
            app.get("/api/waitlist", controller.apiEnrollInWaitlist)
            app.get("/api/visit", controller.apiCountVisit)

            if (!CLOTHES.development) {
                  app.listen(SETTINGS.port, '0.0.0.0') // container port로 노출 (ssl certificate는 nginx에서 load balance 전에 적용)
            } else {
                  app.listen(SETTINGS.port)
            }
      })
})