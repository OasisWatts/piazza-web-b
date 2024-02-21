import express from "express"
import DB from "database/connection"
import { CLOTHES, SETTINGS, writeClientConstants } from "util/setting"
import https from "https"
import fs from "fs"
import { sendWithNewToken, sendWithNewTokenJSON } from "database/token"
require('dotenv').config();

const boardListController = require("controller/boardList")
const boardController = require("controller/board")
const commentController = require("controller/comment")
const urlController = require("controller/url")
const signController = require("controller/sign")
const userController = require("controller/user")

const { verifyToken } = require("database/token")
const app = express()

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
      app.get("/", async (req, res) => {
            res.send("succeed1")
      })
      app.get("/test", async (req, res) => {
            res.send("succeed2")
      })
      app.get("/myboards", verifyToken, boardListController.apiGetMyBoards, sendWithNewTokenJSON) // 본인이 작성한 게시글 목록 조회.
      app.get("/upedboards", verifyToken, boardListController.apiGetMyUpBoards, sendWithNewTokenJSON) // 본인이 up한 게시글 목록 조회.
      app.get("/downedboards", verifyToken, boardListController.apiGetMyDownBoards, sendWithNewTokenJSON) // 본인이 up한 게시글 목록 조회.
      app.get("/urlboards", verifyToken, boardListController.apiGetUrlBoards, sendWithNewTokenJSON) // 같은 url의 게시글 목록 조회.
      // 검색어의 게시글 목록 조회.
      // app.get("/searchboards", verification, async (req, res, next) => {
      //       const startId = Number(req.query.sid)
      //       const search = String(req.query.s)
      //       const userKey = req.decoded.userKey
      //       else {
      //             const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.searchBoards, userKey, undefined, search)
      //             res.send(JSON.stringify(result))
      //       }
      // })
      // // 유저의 게시글 목록 조회.
      // app.get("/userboards", verification, async (req, res, next) => {
      //       const startId = Number(req.query.sid)
      //       const searchUser = Number(req.query.u)
      //       const userKey = req.decoded.userKey
      //       else {
      //             const result = await StatementBoard.boardList(startId, BOARD_CATEGORY.userBoards, userKey, undefined, undefined, searchUser)
      //             res.send(JSON.stringify(result))
      //       }
      // })

      app.post("/boardInsert", verifyToken, boardController.apiInsertBoard, sendWithNewToken) // 게시글 등록.
      app.post("/boardUpdate", verifyToken, boardController.apiUpdateBoard, sendWithNewToken) // 게시글 수정.
      app.get("/boardDelete", verifyToken, boardController.apiDeleteBoard, sendWithNewToken) // 게시글 삭제.
      app.get("/boardChangeType", verifyToken, boardController.apiChangeBoardType, sendWithNewToken) // 게시글 공개여부 설정.
      app.get("/boardReact", verifyToken, boardController.apiReactBoard, sendWithNewTokenJSON) // 게시글 좋아요.
      app.get("/boardGet", verifyToken, boardController.apiGetBoard, sendWithNewTokenJSON) // 게시글 가져오기.
      app.get("/commentListGet", verifyToken, boardController.apiGetCommentList, sendWithNewTokenJSON) // 댓글 목록 가져오기.

      app.post("/urlReact", verifyToken, urlController.apiUpUrl, sendWithNewTokenJSON) // url 좋아요.
      app.get("/reactedUrls", verifyToken, urlController.apiGetUpUrls, sendWithNewTokenJSON) // 좋아요한 url.
      app.post("/url", verifyToken, urlController.apiGetUrlInfo, sendWithNewTokenJSON)

      app.post("/commentInsert", verifyToken, commentController.apiInsertComment, sendWithNewToken) // 게시글 등록.
      app.post("/commentUpdate", verifyToken, commentController.apiUpdateComment, sendWithNewToken) // 게시글 수정.
      app.get("/commentDelete", verifyToken, commentController.apiDeleteComment, sendWithNewToken) // 게시글 삭제.
      app.get("/commentReact", verifyToken, commentController.apiReactComment, sendWithNewTokenJSON) // 게시글 좋아요.



      // 로그인 또는 계정 생성 (구글 소셜)
      app.post("/signIn", signController.apiSignIn)
      app.post("/signUp", signController.apiSignUp)
      app.post("/changeName", verifyToken, userController.apiChangeName, sendWithNewToken)
      // 게시글 조회.(랜더링된 화면에서)
      // app.get("/boardload", async (req, res, next) => {
      //       const boardId = Number(req.query.id)
      //       const userKey = req.decoded.userKey
      //       else {
      //             const board = await StatementBoard.boardSelect(boardId, userKey)
      //             res.send(JSON.stringify(board))
      //       }
      // })
      // app.get("/*", async (req, res, next) => {
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