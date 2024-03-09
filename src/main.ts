import express from "express"
import DB from "database/connection"
import { CLOTHES, SETTINGS, writeClientConstants } from "util/setting"
//import https from "https"
//import fs from "fs"
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
            res.send("succeed! succeed!")
      })
      app.get("/api", async (req, res) => {
            res.send("api test succeed")
      })
      app.get("/api/myboards", verifyToken, boardListController.apiGetMyBoards, sendWithNewTokenJSON) // 본인이 작성한 게시글 목록 조회.
      app.get("/api/upedboards", verifyToken, boardListController.apiGetMyUpBoards, sendWithNewTokenJSON) // 본인이 up한 게시글 목록 조회.
      app.get("/api/downedboards", verifyToken, boardListController.apiGetMyDownBoards, sendWithNewTokenJSON) // 본인이 down한 게시글 목록 조회.
      app.get("/api/trendboards", verifyToken, boardListController.apiGetTrendBoards, sendWithNewTokenJSON) // trend 게시글 목록 조회.
      app.get("/api/urlboards", verifyToken, boardListController.apiGetUrlBoards, sendWithNewTokenJSON) // 같은 url의 게시글 목록 조회.
      app.get("/api/myboardsearch", verifyToken, boardListController.apiGetMyBoardSearch, sendWithNewTokenJSON) // 본인이 작성한 게시글 중 검색하여 목록 조회.
      app.get("/api/upedboardsearch", verifyToken, boardListController.apiGetMyUpSearch, sendWithNewTokenJSON) // 본인이 up한 게시글 중 검색하여 목록 조회.
      app.get("/api/boardsearch", verifyToken, boardListController.apiGetBoardSearch, sendWithNewTokenJSON) // 게시글 중 검색하여 목록 조회.

      app.get("/api/hashTags", verifyToken, hashTagController.apiGetHashTag, sendWithNewTokenJSON)

      app.post("/api/boardInsert", verifyToken, boardController.apiInsertBoard, sendWithNewToken) // 게시글 등록.
      app.post("/api/boardUpdate", verifyToken, boardController.apiUpdateBoard, sendWithNewToken) // 게시글 수정.
      app.get("/api/boardDelete", verifyToken, boardController.apiDeleteBoard, sendWithNewToken) // 게시글 삭제.
      app.get("/api/boardChangeType", verifyToken, boardController.apiChangeBoardType, sendWithNewToken) // 게시글 공개여부 설정.
      app.get("/api/boardReact", verifyToken, boardController.apiReactBoard, sendWithNewTokenJSON) // 게시글 좋아요.

      app.post("/api/urlReact", verifyToken, urlController.apiUpUrl, sendWithNewTokenJSON) // url 좋아요.
      app.get("/api/reactedUrls", verifyToken, urlController.apiGetUpUrls, sendWithNewTokenJSON) // 좋아요한 url.
      app.post("/api/url", verifyToken, urlController.apiGetUrlInfo, sendWithNewTokenJSON)

      app.post("/api/commentInsert", verifyToken, commentController.apiInsertComment, sendWithNewTokenJSON) // 댓글 등록.
      app.post("/api/commentUpdate", verifyToken, commentController.apiUpdateComment, sendWithNewToken) // 댓글 수정.
      app.get("/api/commentDelete", verifyToken, commentController.apiDeleteComment, sendWithNewToken) // 댓글 삭제.
      app.get("/api/commentReact", verifyToken, commentController.apiReactComment, sendWithNewTokenJSON) // 댓글 좋아요.
      app.get("/api/commentListGet", verifyToken, commentController.apiGetCommentList, sendWithNewTokenJSON) // 댓글 목록 가져오기.
      app.get("/api/replyListGet", verifyToken, commentController.apiGetReplyList, sendWithNewTokenJSON) // 답글 목록 가져오기.
      app.post("/api/replyInsert", verifyToken, commentController.apiInsertReply, sendWithNewTokenJSON) // 답글 등록.

      app.post("/api/signIn", signController.apiSignIn)
      app.post("/api/signUp", signController.apiSignUp)
      app.post("/api/changeName", verifyToken, userController.apiChangeName, sendWithNewToken)
      app.get("/api/deleteAccount", verifyToken, userController.apiDeleteAccount, sendWithNewToken)

      if (!CLOTHES.development) {
            app.listen(SETTINGS.port, '0.0.0.0') // container port로 노출 (ssl certificate는 nginx에서 load balance 전에 적용)
      } else {
            app.listen(SETTINGS.port)
      }
})
