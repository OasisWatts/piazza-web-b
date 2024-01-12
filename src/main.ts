import express from "express"
import DB from "database/connection"
import { StatementBoard } from "database/statementBoard"
import { CLOTHES, SETTINGS, writeClientConstants } from "util/setting"
import { BOARD_CATEGORY } from "common/applicationCode"
import { StatementUser } from "database/statementUser"
import https from "https"
import fs from "fs"
import { statementUrl } from "database/statementUrl"
import jwt from "jsonwebtoken"
require('dotenv').config();

const { verifyToken } = require("database/token")
const app = express()
const MAX_CONTENTS_LEN = SETTINGS.board.contentsLen

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
DB.initialize().then(() => {
      writeClientConstants()
      app.use(express.urlencoded({ extended: true }))
      app.use(express.text())
      app.use(express.json())
      // 전체 게시글 목록 조회.
      // app.use((req, res, next) => {
      //       console.log("sessin", req.session)
      //       // req.decoded.userKey = 2
      //       // req.decoded.isLogined = true
      //       next()
      // })
      app.get("/feed", verifyToken, async (req, res, next) => {
            const startId = Number(req.query.sid)
            const userKey = req.decoded.userKey
            const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.feed, userKey)
            res.json(result)
      }) // 본인이 작성한 게시글 목록 조회.
      app.get("/myboards", verifyToken, async (req, res, next) => {
            const startId = Number(req.query.sid)
            const userKey = req.decoded.userKey
            console.log("my boards0", userKey)
            const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.myBoards, userKey)
            res.json(result)
      }) // 본인이 up한 게시글 목록 조회.
      app.get("/reactedboards", verifyToken, async (req, res, next) => {
            const startId = Number(req.query.sid)
            const userKey = req.decoded.userKey
            const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.myUpBoards, userKey)
            res.json(result)
      }) // 같은 url의 게시글 목록 조회.
      app.get("/urlboards", verifyToken, async (req, res, next) => {
            const startId = Number(req.query.sid)
            const urlid = Number(req.query.uid)
            const userKey = req.decoded.userKey
            console.log("urlboards")
            const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.urlBoards, userKey, urlid)
            res.json(result)
      })
      // 검색어의 게시글 목록 조회.
      // app.get("/searchboards", verifyToken, async (req, res, next) => {
      //       const startId = Number(req.query.sid)
      //       const search = String(req.query.s)
      //       const userKey = req.decoded.userKey
      //       else {
      //             const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.searchBoards, userKey, undefined, search)
      //             res.send(JSON.stringify(result))
      //       }
      // })
      // // 유저의 게시글 목록 조회.
      // app.get("/userboards", verifyToken, async (req, res, next) => {
      //       const startId = Number(req.query.sid)
      //       const searchUser = Number(req.query.u)
      //       const userKey = req.decoded.userKey
      //       else {
      //             const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.userBoards, userKey, undefined, undefined, searchUser)
      //             res.send(JSON.stringify(result))
      //       }
      // })
      // 게시글 등록.
      app.post("/boardInsert", verifyToken, async (req, res) => {
            const userKey = req.decoded.userKey
            const contents = req.body.c
            console.log("req body uid", req.body.uid)
            let uid = Number(req.body.uid)
            let title = String(req.body.t)
            let isPublic = true
            if (contents.length > MAX_CONTENTS_LEN) return
            if (isNaN(uid)) uid = null
            if (title === "") title = null
            if (req.body.p === "") isPublic = false
            const result = await DB.Manager.transaction(() => StatementBoard.boardInsert(userKey, contents, uid, title, isPublic))
            if (result) res.send(true)
      })
      // 게시글 수정.
      app.post("/boardUpdate", verifyToken, async (req, res) => {
            const boardId = Number(req.query.id)
            const userKey = req.decoded.userKey
            const contents = req.body.c
            if (contents.length > MAX_CONTENTS_LEN) return
            const result = await StatementBoard.boardUpdate(boardId, userKey, contents)
            if (result) res.send(true)
      })
      // 게시글 삭제.
      app.get("/boardDelete", verifyToken, async (req, res) => {
            const boardId = Number(req.query.id)
            const userKey = req.decoded.userKey
            const result = await StatementBoard.boardDelete(boardId, userKey)
            if (result) res.send(true)
      })
      // 게시글 삭제.
      app.get("/boardChangeType", verifyToken, async (req, res) => {
            const boardId = Number(req.query.id)
            const forPublic = Boolean(req.query.pb)
            const userKey = req.decoded.userKey
            const result = await StatementBoard.boardChangeType(boardId, userKey, forPublic)
            if (result) res.send(true)
      })
      // 게시글 좋아요.
      app.get("/boardReact", verifyToken, async (req, res) => {
            const boardId = Number(req.query.id)
            const toCancel = Boolean(req.query.cc)
            const userKey = req.decoded.userKey
            const result = await DB.Manager.transaction(() => StatementBoard.boardReact(boardId, userKey, toCancel))
            if (result) res.json(result)
      })
      // url 좋아요.
      app.post("/urlReact", verifyToken, async (req, res) => {
            let urlid = Number(req.body.uid)
            let title = String(req.body.t)
            const toCancel = Boolean(req.body.cc)
            const userKey = req.decoded.userKey
            if (isNaN(urlid)) urlid = null
            if (title === "") title = null
            const result = await DB.Manager.transaction(() => statementUrl.UrlReact(urlid, title, userKey, toCancel))
            if (result) res.json(result)
      })
      // 좋아요한 url.
      app.get("/reactedUrls", verifyToken, async (req, res) => {
            const startId = Number(req.query.sid)
            const userKey = req.decoded.userKey
            const result = await statementUrl.reactedUrls(startId, userKey)
            if (result) res.json(result)
      })
      app.post("/url", verifyToken, async (req, res) => {
            const urlname = String(req.body.u)
            const hostname = String(req.body.h)
            const userKey = req.decoded.userKey
            const result = await statementUrl.getUrl(urlname, hostname, userKey)
            if (result) res.json(result)
      })
      // 로그인 또는 계정 생성 (구글 소셜)
      app.post("/signIn", async (req, res) => { // get 으로 하지말기
            const id = String(req.body.i)
            const email = String(req.body.e)

            const result: any = await StatementUser.signIn(id, email)
            if (result) {
                  if (result.signed) {
                        const token = jwt.sign({
                              userKey: result.userKey
                        }, process.env.JWT_SECRET, {
                              expiresIn: "7d"
                        })
                        res.json({ signed: true, name: result.name, image: result.image, token })
                  } else if (result.needSignUp) {
                        res.json({ needSignUp: true })
                  } else res.json({ signed: false })
            }
      })
      app.post("/signUp", async (req, res) => {
            const id = String(req.body.i)
            const name = String(req.body.n)
            const email = String(req.body.e)
            console.log("signUp", id, name, email)

            const result: any = await StatementUser.signUp(id, name, email)
            if (result.signed) {
                  const token = jwt.sign({
                        userKey: result.userKey
                  }, process.env.JWT_SECRET, {
                        expiresIn: "7d"
                  })
                  res.json({ signed: true, name: result.name, image: result.image, token })
            } else res.json({ signed: false })
      })
      // 게시글 조회.(랜더링된 화면에서)
      // app.get("/boardload", verifyToken, async (req, res, next) => {
      //       const boardId = Number(req.query.id)
      //       const userKey = req.decoded.userKey
      //       else {
      //             const board = await StatementBoard.boardSelect(boardId, userKey)
      //             res.send(JSON.stringify(board))
      //       }
      // })
      // app.get("/*", verifyToken, async (req, res, next) => {
      //       res.send("hi")
      // })
      if (!CLOTHES.development && SETTINGS.https) {
            const ssl_options = SETTINGS.https && ({
                  cert: fs.readFileSync(SETTINGS.https.cert),
                  key: fs.readFileSync(SETTINGS.https.key),
                  ca: fs.readFileSync(SETTINGS.https.ca),
            })
            https.createServer(ssl_options, app).listen(SETTINGS.port)
      } else {
            app.listen(SETTINGS.port)
      }
})