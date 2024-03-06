import { ErrorCode } from "common/applicationCode"
import DB from "database/connection"
import { Logger } from "util/logger"
import Comment from "model/comment"
import { SETTINGS } from "util/setting"
import Board from "model/board"
import User from "model/user"
import { reduceToTable } from "util/utility"
import { getEndIdOfListInorder, getEndOfList } from "./board"
import { LessThan } from "typeorm"


const MAX_CONTENTS_LEN = SETTINGS.comment.contentsLen
const MAX_LIST_LEN = SETTINGS.board.listLen

/**
* 댓글 생성.
* @param boardId 게시글 식별자.
* @param contents 내용물.
* @param writerKey 글쓴이 식별자.
*/
async function commentInsert(boardId: number, writerKey: number, contents: string, userId: string) {
    let error = false
    let inserted
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        inserted = await queryRunner.manager.insert(Comment, {
            writer: writerKey,
            contents: contents,
            board: {
                id: boardId,
            },
        })
        await queryRunner.manager.increment(Board, { id: boardId }, "commentNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.comment_insert_failed).put("commentInsert").put(err).next("userId").put(userId).next("boardId").put(String(boardId)).out()
    } finally {
        await queryRunner.release()
        if (!error) {
            const map = inserted.generatedMaps[0]
            return { id: map.id, date: String(map.date) }
        }
        else return null
    }
}

/**
* 댓글 생성.
* @param commentId 댓글 식별자.
* @param contents 내용물.
* @param writerKey 글쓴이 식별자.
*/
async function replyInsert(commentId: number, writerKey: number, contents: string, userId: string) {
    let error = false
    let inserted
    const comment = await DB.Manager.findOne(Comment, { where: { id: commentId }, relations: ["board"] })
    if (!comment) return null
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        inserted = await queryRunner.manager.insert(Comment, {
            writer: writerKey,
            contents,
            replied: {
                id: commentId,
            }
        })
        await queryRunner.manager.increment(Comment, { id: commentId }, "replyNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.comment_insert_failed).put("replyInsert").put(err).next("userId").put(userId).next("commentId").put(String(commentId)).out()
    } finally {
        await queryRunner.release()
        if (!error) {
            const map = inserted.generatedMaps[0]
            return { id: map.id, date: String(map.date) }
        }
        else return null
    }
}

/**
* 댓글 업데이트.
* @param commentId 댓글 식별자.
* @param updaterKey 업데이트하려는 사용자 식별자.
* @param contents 내용물.
*/
function commentUpdate(commentId: number, updaterKey: number, contents: string, userId: string) {
    return new Promise((resolve, _) => {
        DB.Manager.update(Comment, { id: commentId, writer: updaterKey }, {
            contents,
            updated: true
        }).then((r) => {
            if (!r.affected) {
                Logger.errorApp(ErrorCode.comment_update_bad_request).put("commentUpdate").next("userId").put(userId).out()
            } else {
                resolve(true)
            }
        }).catch((err) => Logger.errorApp(ErrorCode.comment_update_failed).put("commentUpdate").put(err).next("userId").put(userId).next("commentId").put(String(commentId)).out())
    })
}

/**
 * 댓글 삭제.
 * @param commentId 댓글 식별자.
 */
async function commentDelete(commentId: number, userKey: number, userId: string) {
    let error = false
    const comment = await DB.Manager.findOne(Comment, { where: { id: commentId, writer: userKey }, relations: ["board", "replied"] })
    if (!comment) return null
    const boardId = comment.board?.id
    const isReply = !!comment.replied
    const repliedId = comment.replied?.id
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.delete(Comment, { id: commentId, writer: userKey })
        if (isReply) {
            await queryRunner.manager.decrement(Comment, { id: repliedId }, "replyNum", 1)
        } else if (boardId != null) {
            await queryRunner.manager.decrement(Board, { id: boardId }, "commentNum", 1)
        }
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.comment_delete_failed).put("commentDelete").put(err).next("userId").put(userId).next("commentId").put(String(commentId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return true
        else return null
    }
}


async function upComment(commentId: number, userKey: number, userId: string) {
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.query(`insert into \`user_uped_commenets_comment\` (userKey, commentId) values (${userKey}, ${commentId})`)
        await queryRunner.manager.increment(Comment, { id: commentId }, "upNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.comment_update_failed).put("upComment").put(err).next("userId").put(userId).next("commentId").put(String(commentId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return { up: 1 }
        else return null
    }
}
async function upAndCancelDownComment(commentId: number, userKey: number, userId: string) {
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.query(`insert into \`user_uped_commenets_comment\` (userKey, commentId) values (${userKey}, ${commentId})`)
        await queryRunner.manager.increment(Comment, { id: commentId }, "upNum", 1)
        await queryRunner.manager.query(`delete from \`user_downed_comments_comment\` where userKey=${userKey} and commentId=${commentId}`)
        await queryRunner.manager.decrement(Comment, { id: commentId }, "downNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.comment_update_failed).put("upAndCancelDownComment").put(err).next("userId").put(userId).next("commentId").put(String(commentId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return { up: 1, down: -1 }
        else return null
    }
}
async function cancelUpComment(commentId: number, userKey: number, userId: string) {
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.query(`delete from \`user_uped_commenets_comment\` where userKey=${userKey} and commentId=${commentId}`)
        await queryRunner.manager.decrement(Comment, { id: commentId }, "upNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.comment_update_failed).put("cancelUpComment").put(err).next("userId").put(userId).next("commentId").put(String(commentId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return { up: -1 }
        else return null
    }
}
async function downComment(commentId: number, userKey: number, userId: string) {
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.query(`insert into \`user_downed_comments_comment\` (userKey, commentId) values (${userKey}, ${commentId})`)
        await queryRunner.manager.increment(Comment, { id: commentId }, "downNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.comment_update_failed).put("downComment").put(err).next("userId").put(userId).next("commentId").put(String(commentId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return { down: 1 }
        else return null
    }
}
async function downAndCancelUpComment(commentId: number, userKey: number, userId: string) {
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.query(`insert into \`user_downed_comments_comment\` (userKey, commentId) values (${userKey}, ${commentId})`)
        await queryRunner.manager.increment(Comment, { id: commentId }, "downNum", 1)
        await queryRunner.manager.query(`delete from \`user_uped_commenets_comment\` where userKey=${userKey} and commentId=${commentId}`)
        await queryRunner.manager.decrement(Comment, { id: commentId }, "upNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.comment_update_failed).put("downAndCancelUpComment").put(err).next("usreId").put(userId).next("commentId").put(String(commentId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return { down: 1, up: -1 }
        else return null
    }

}
async function cancelDownComment(commentId: number, userKey: number, userId: string) {
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.query(`delete from \`user_downed_comments_comment\` where userKey=${userKey} and commentId=${commentId}`)
        await queryRunner.manager.decrement(Comment, { id: commentId }, "downNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.comment_update_failed).put("cancelDownComment").put(err).next("userId").put(userId).next("commentId").put(String(commentId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return { down: -1 }
        else return null
    }
}
/**
* 게시글 좋아요.
* @param commentId 게시글 식별자.
* @param userKey 사용자 디비 식별자.
*/
async function reactComment(commentId: number, userKey: number, up: boolean, down: boolean, userId: string) {
    const board = await DB.Manager.findOne(Comment, { where: { id: commentId }, select: ["writer"] })
    if (board?.writer === userKey) return null

    const uped = await DB.Manager.query(`select * from \`user_uped_comments_board\` where userKey=${userKey} and commentId=${commentId}`)
    const downed = await DB.Manager.query(`select * from \`user_downed_comments_board\` where userKey=${userKey} and commentId=${commentId}`)

    if (up) {
        if (uped.length) {
            return await cancelUpComment(commentId, userKey, userId)
        } else if (!uped.length) {
            if (downed.length) {
                return await upAndCancelDownComment(commentId, userKey, userId)
            } else {
                return await upComment(commentId, userKey, userId)
            }
        }
    }
    if (down) {
        if (downed.length) {
            return await cancelDownComment(commentId, userKey, userId)
        } else if (!downed.length) {
            if (uped.length) {
                return await downAndCancelUpComment(commentId, userKey, userId)
            } else {
                return await downComment(commentId, userKey, userId)
            }
        }
    } return null
}

async function getReplyListByStartId(commentId: number, replyStartId: number) {
    if (replyStartId == 0) {
        await DB.Manager.increment(Comment, { id: commentId }, "visitNum", 1)
        return await DB.Manager.find(Comment, { order: { id: "DESC" }, take: MAX_LIST_LEN, where: { replied: { id: commentId } } })
    }
    else return await DB.Manager.find(Comment, { order: { id: "DESC" }, take: MAX_LIST_LEN, where: { replied: { id: commentId }, id: LessThan(replyStartId) } })
}

async function getCommentListByStartId(boardId: number, commentStartId: number) {
    if (commentStartId == 0) {
        await DB.Manager.increment(Board, { id: boardId }, "visitNum", 1)
        return await DB.Manager.find(Comment, { order: { id: "DESC" }, take: MAX_LIST_LEN, where: { board: { id: boardId } } })
    }
    else return await DB.Manager.find(Comment, { order: { id: "DESC" }, take: MAX_LIST_LEN, where: { board: { id: boardId }, id: LessThan(commentStartId) } })
}

async function getUpedAndDowned(commentList: Comment[], userKey: number, userId: string) {
    const promises = []
    for (const commentIdx in commentList) {
        promises.push(
            new Promise(async (resolve, reject) => {
                try {
                    const isUped = await DB.Manager.findOne(Comment, { where: { id: commentList[commentIdx].id, upedUsers: { key: userKey } } })
                    if (isUped) commentList[commentIdx]["uped"] = true
                    else commentList[commentIdx]["uped"] = false
                    resolve(true)
                } catch (err) {
                    Logger.errorApp(ErrorCode.board_find_failed).put("getUpedAndDowned").put(err).next("userId").put(userId).next("commentId").put(String(commentList[commentIdx].id)).out()
                    reject(err)
                }
            })
        )
        promises.push(
            new Promise(async (resolve, reject) => {
                try {
                    const isDowned = await DB.Manager.findOne(Comment, { where: { id: commentList[commentIdx].id, downedUsers: { key: userKey } } })
                    if (isDowned) commentList[commentIdx]["downed"] = true
                    else commentList[commentIdx]["downed"] = false
                    resolve(true)
                } catch (err) {
                    Logger.errorApp(ErrorCode.board_find_failed).put("getUpedAndDowned").put(err).next("userId").put(userId).next("commentId").put(String(commentList[commentIdx].id)).out()
                    reject(err)
                }
            })
        )
    }
    await Promise.all(promises)
    return commentList
}

async function getCommentListInfoByStartId(commentList: any[]) {
    const userWhere: { key: number }[] = []
    for (const comment of commentList) {
        userWhere.push({
            key: comment.writer
        })
    }
    const users = await DB.Manager.find(User, {
        where: userWhere
    })
    const userTable = reduceToTable(users, (v) => v, (v) => v.key)
    const commentInfoList = []
    for (const comment of commentList) {
        const user = userTable[comment.writer]
        let userName = user ? user.name : "?"
        let userId = user ? user.userId : "?"
        const commentInfo = {
            id: comment.id,
            date: String(comment.date),
            contents: comment.contents.slice(0, MAX_CONTENTS_LEN),
            upNum: comment.upNum,
            downNum: comment.downNum,
            replyNum: comment.replyNum,
            uped: comment.uped,
            downed: comment.downed,
            updated: comment.updated,
            writer: userName,
            writerId: userId,
        }
        commentInfoList.push(commentInfo)
    }
    return commentInfoList
}

exports.apiInsertComment = async (req, res, next) => {
    try {
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        const contents = req.body.c
        let boardId = Number(req.body.b)
        Logger.passApp("apiInsertComment").next("userId").put(userId).out()
        if (contents.length > MAX_CONTENTS_LEN) return // TODO front error handling -> comment MAX_CONTENTS_LEN has to be changed in frontent 
        const result = await commentInsert(boardId, userKey, contents, userId)
        if (result) {
            req.result = result
            next()
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiInsertComment").put(err).next("userId").put(req.decoded.userId).out()
    }
}

exports.apiInsertReply = async (req, res, next) => {
    try {
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        const contents = req.body.c
        let commentId = Number(req.body.cid)
        Logger.passApp("apiInsertReply").next("userId").put(userId).out()
        if (contents.length > MAX_CONTENTS_LEN) return // TODO front error handling -> comment MAX_CONTENTS_LEN has to be changed in frontent 
        const result = await replyInsert(commentId, userKey, contents, userId)
        if (result) {
            req.result = result
            next()
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiInsertReply").put(err).next("userId").put(req.decoded.userId).out()
    }
}

exports.apiUpdateComment = async (req, res, next) => {
    try {
        const commentId = Number(req.query.id)
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        const contents = req.body.c
        Logger.passApp("apiUpdateComment").next("userId").put(userId).next("commentId").put(req.query.id).out()
        if (contents.length > MAX_CONTENTS_LEN) return
        const result = await commentUpdate(commentId, userKey, contents, userId)
        if (result) next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiUpdateComment").put(err).next("userId").put(req.decoded.userId).next("commentId").put(req.query.id).out()
    }
}

exports.apiDeleteComment = async (req, res, next) => {
    try {
        const commentId = Number(req.query.id)
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        Logger.passApp("apiDeleteComment").next("userId").put(userId).next("commentId").put(req.query.id).out()
        const result = await commentDelete(commentId, userKey, userId)
        if (result) next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiDeleteComment").put(err).next("userId").put(req.decoded.userId).next("commentId").put(req.query.id).out()
    }
}

exports.apiReactComment = async (req, res, next) => {
    try {
        const commentId = Number(req.query.id)
        const up = Boolean(req.query.u)
        const down = Boolean(req.query.d)
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        Logger.passApp("apiUpComment").next("userId").put(userId).next("commentId").put(req.query.id).next("up").put(req.query.u).next("down").put(req.query.d).out()
        const result = await reactComment(commentId, userKey, up, down, userId)
        if (result) {
            req.result = result
            next()
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiUpComment").put(err).next("userId").put(req.decoded.userId).next("commentId").put(req.query.id).next("up").put(req.query.u).next("down").put(req.query.d).out()
    }
}


exports.apiGetCommentList = async (req, res, next) => {
    try {
        const startId = Number(req.query.sid)
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        const boardId = req.query.bid
        Logger.passApp("apiGetCommentList").next("userId").put(userId).next("sid").put(req.query.sid).next("bid").put(boardId).out()
        const commentList = await getCommentListByStartId(boardId, startId)
        const endId = await getEndIdOfListInorder(commentList, startId)
        const end = await getEndOfList(commentList)
        const commentListUpedAndDowned = await getUpedAndDowned(commentList, userKey, userId)
        const cInfoList = await getCommentListInfoByStartId(commentListUpedAndDowned)
        req.result = { commentList: cInfoList, end, endId }
        next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetCommentList").put(err).next("userId").put(req.decoded.userId).next("sid").put(req.query.sid).next("bid").put(req.query.bid).out()
    }
}

exports.apiGetReplyList = async (req, res, next) => {
    try {
        const startId = Number(req.query.sid)
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        const commentId = req.query.cid
        Logger.passApp("apiGetReplyList").next("userId").put(userId).next("sid").put(req.query.sid).next("cid").put(commentId).out()
        const commentList = await getReplyListByStartId(commentId, startId)
        const endId = await getEndIdOfListInorder(commentList, startId)
        const end = await getEndOfList(commentList)
        const commentListUpedAndDowned = await getUpedAndDowned(commentList, userKey, userId)
        const cInfoList = await getCommentListInfoByStartId(commentListUpedAndDowned)
        req.result = { commentList: cInfoList, end, endId }
        next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetReplyList").put(err).next("userId").put(req.decoded.userId).next("sid").put(req.query.sid).next("cid").put(req.query.cid).out()
    }
}
