import express from "express"
import DB from "database/connection"
import { CLOTHES, SETTINGS, writeClientConstants } from "util/setting"
import https from "https"
import fs from "fs"
import { sendWithNewToken, sendWithNewTokenJSON } from "database/token"
require('dotenv').config();

const boardListController = require("controller/boardlist")
const boardController = require("controller/board")
const commentController = require("controller/comment")
const urlController = require("controller/url")
const signController = require("controller/sign")
const userController = require("controller/user")
const hashTagController = require("controller/hashTag")

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
            res.send("succeed!")
      })
      app.get("/test", async (req, res) => {
            res.send("succeed2")
      })
      app.get("/myboards", verifyToken, boardListController.apiGetMyBoards, sendWithNewTokenJSON) // 본인이 작성한 게시글 목록 조회.
      app.get("/upedboards", verifyToken, boardListController.apiGetMyUpBoards, sendWithNewTokenJSON) // 본인이 up한 게시글 목록 조회.
      app.get("/downedboards", verifyToken, boardListController.apiGetMyDownBoards, sendWithNewTokenJSON) // 본인이 down한 게시글 목록 조회.
      app.get("/trendboards", verifyToken, boardListController.apiGetTrendBoards, sendWithNewTokenJSON) // trend 게시글 목록 조회.
      app.get("/urlboards", verifyToken, boardListController.apiGetUrlBoards, sendWithNewTokenJSON) // 같은 url의 게시글 목록 조회.
      app.get("/myboardsearch", verifyToken, boardListController.apiGetMyBoardSearch, sendWithNewTokenJSON) // 본인이 작성한 게시글 중 검색하여 목록 조회.
      app.get("/upedboardsearch", verifyToken, boardListController.apiGetMyUpSearch, sendWithNewTokenJSON) // 본인이 up한 게시글 중 검색하여 목록 조회.
      app.get("/boardsearch", verifyToken, boardListController.apiGetBoardSearch, sendWithNewTokenJSON) // 게시글 중 검색하여 목록 조회.

      app.get("/hashTags", verifyToken, hashTagController.apiGetHashTag, sendWithNewTokenJSON)

      app.post("/boardInsert", verifyToken, boardController.apiInsertBoard, sendWithNewToken) // 게시글 등록.
      app.post("/boardUpdate", verifyToken, boardController.apiUpdateBoard, sendWithNewToken) // 게시글 수정.
      app.get("/boardDelete", verifyToken, boardController.apiDeleteBoard, sendWithNewToken) // 게시글 삭제.
      app.get("/boardChangeType", verifyToken, boardController.apiChangeBoardType, sendWithNewToken) // 게시글 공개여부 설정.
      app.get("/boardReact", verifyToken, boardController.apiReactBoard, sendWithNewTokenJSON) // 게시글 좋아요.

      app.post("/urlReact", verifyToken, urlController.apiUpUrl, sendWithNewTokenJSON) // url 좋아요.
      app.get("/reactedUrls", verifyToken, urlController.apiGetUpUrls, sendWithNewTokenJSON) // 좋아요한 url.
      app.post("/url", verifyToken, urlController.apiGetUrlInfo, sendWithNewTokenJSON)

      app.post("/commentInsert", verifyToken, commentController.apiInsertComment, sendWithNewTokenJSON) // 댓글 등록.
      app.post("/commentUpdate", verifyToken, commentController.apiUpdateComment, sendWithNewToken) // 댓글 수정.
      app.get("/commentDelete", verifyToken, commentController.apiDeleteComment, sendWithNewToken) // 댓글 삭제.
      app.get("/commentReact", verifyToken, commentController.apiReactComment, sendWithNewTokenJSON) // 댓글 좋아요.
      app.get("/commentListGet", verifyToken, commentController.apiGetCommentList, sendWithNewTokenJSON) // 댓글 목록 가져오기.
      app.get("/replyListGet", verifyToken, commentController.apiGetReplyList, sendWithNewTokenJSON) // 답글 목록 가져오기.
      app.post("/replyInsert", verifyToken, commentController.apiInsertReply, sendWithNewTokenJSON) // 답글 등록.

      app.post("/signIn", signController.apiSignIn)
      app.post("/signUp", signController.apiSignUp)
      app.post("/changeName", verifyToken, userController.apiChangeName, sendWithNewToken)
      app.get("/deleteAccount", verifyToken, userController.apiDeleteAccount, sendWithNewToken)

      if (!CLOTHES.development && SETTINGS.https) {
            const ssl_options = SETTINGS.https && ({
                  cert: fs.readFileSync(SETTINGS.https.cert),
                  key: fs.readFileSync(SETTINGS.https.key),
                  ca: fs.readFileSync(SETTINGS.https.ca),
            })
            const server = https.createServer(ssl_options, app).listen(SETTINGS.port, function () { // pm2
                  process.send("ready")
            })
            process.on("SIGINT", function () { // pm2
                  server.close(function () {
                        process.exit(0)
                  })
            })
      } else {
            app.listen(SETTINGS.port)
      }
})