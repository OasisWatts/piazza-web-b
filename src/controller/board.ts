import DB from "database/connection"
import Board from "model/board"
import { Logger } from "util/logger"
import { ErrorCode } from "common/applicationCode"
import Url from "model/url"
import { SETTINGS } from "util/setting"
import User from "model/user"
import HashTag from "model/hashTag"
import UserHashTag from "model/userHashTag"

const MAX_CONTENTS_LEN = SETTINGS.board.contentsLen
const MAX_HASH_TAG_LEN = SETTINGS.board.tagLenLim
const MAX_HASH_TAG_NUM = SETTINGS.board.tagCountLim
const MAX_LIST_LEN = SETTINGS.board.listLen

/**
 * 게시글 생성.
 * @param writerKey 글쓴이 디비 식별자.
 * @param contents 게시글 내용.
 */
async function boardInsert(writerKey: number, contents: string, hashTags: string[], urlid: number, title: string, isPublic: boolean, userId: string) {
    const user = await DB.Manager.findOne(User, { where: { key: writerKey } })
    let urlObj
    if (urlid) {
        urlObj = await DB.Manager.findOne(Url, { where: { id: urlid } })
        if (urlObj) {
            if (urlObj.title !== title) await DB.Manager.update(Url, { id: urlid }, { title: title })
        }
    }
    let error = false;
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await DB.Manager.increment(Url, { id: urlid }, "boardNum", 1)
        if (hashTags.length) {
            const hashTagPromises = []
            const userHashTagPromises = []
            for (let tag of hashTags) {
                hashTagPromises.push(
                    new Promise(async (resolve, reject) => {
                        try {
                            let hashTagObj = await DB.Manager.findOne(HashTag, { where: { text: tag } })
                            if (!hashTagObj) hashTagObj = await DB.Manager.save(HashTag, { text: tag })
                            resolve(hashTagObj)
                        } catch (err) {
                            Logger.errorApp(ErrorCode.hashtag_failed).put("boardInsert").put(err).next("userId").put(userId).next("tag").put(tag).out()
                            reject(true)
                        }
                    })
                )
            }
            const hashTagObjs = await Promise.all(hashTagPromises)
            for (let tag of hashTagObjs) {
                userHashTagPromises.push(
                    new Promise(async (resolve, reject) => {
                        try {
                            const userHashTagObj = await DB.Manager.findOne(UserHashTag, { where: { user: { key: writerKey }, hashTag: { text: tag.text } } })
                            if (userHashTagObj) {
                                await DB.Manager.increment(UserHashTag, userHashTagObj, "count", 1)
                            } else {
                                await DB.Manager.save(UserHashTag, { user: user, hashTag: tag })
                            }
                            resolve(true)
                        } catch (err) {
                            Logger.errorApp(ErrorCode.user_hashtag_failed).put("boardInsert").put(err).next("userId").put(userId).next("tag").put(tag).out()
                            reject(true)
                        }
                    })
                )
            }
            await Promise.all(userHashTagPromises)
            if (urlObj) {
                await DB.Manager.save(Board, { contents: contents.slice(0, MAX_CONTENTS_LEN), writer: writerKey, url: urlObj, isPublic: isPublic, hashTags: hashTagObjs })
            } else {
                await DB.Manager.save(Board, { contents: contents.slice(0, MAX_CONTENTS_LEN), writer: writerKey, isPublic: isPublic, hashTags: hashTagObjs })
            }
        } else {
            if (urlObj) {
                await DB.Manager.save(Board, { contents: contents.slice(0, MAX_CONTENTS_LEN), writer: writerKey, url: urlObj, isPublic: isPublic })
            } else {
                await DB.Manager.save(Board, { contents: contents.slice(0, MAX_CONTENTS_LEN), writer: writerKey, isPublic: isPublic })
            }
        }
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.board_insert_failed).put(err).next("userId").put(userId).next("urlid").put(String(urlid)).next("isPublic").put(isPublic ? "true" : "false").out()
    } finally {
        await queryRunner.release()
        if (error) {
            return false
        } else return true
    }
}

/**
  * 게시글 업데이트.
  * @param boardId 게시글 식별자.
  * @param updaterKey 업데이트하려는 사용자 식별자.
  * @param contents 게시글 내용.
  */
async function boardUpdate(boardId: number, updaterKey: number, contents: string, hashTags: string[], userId: string) {
    const user = await DB.Manager.findOne(User, { where: { key: updaterKey } })
    const board = await DB.Manager.findOne(Board, { relations: ["hashTags"], where: { id: boardId } })
    if (!board) return false
    let error = false;
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        if (hashTags.length) {
            const hashTagPromises = []
            const userHashTagPromises = []
            const newHashTags = []
            const deleteHashTags = []
            for (let tag of hashTags) {
                const isNewHashTag = board.hashTags.every((t) => t.text !== tag)
                if (isNewHashTag) {
                    hashTagPromises.push(
                        new Promise(async (resolve, reject) => { // create new hashtag if hashtag is new
                            try {
                                let hashTagObj = await DB.Manager.findOne(HashTag, { where: { text: tag } })
                                if (!hashTagObj) hashTagObj = await DB.Manager.save(HashTag, { text: tag })
                                newHashTags.push(hashTagObj)
                                resolve(hashTagObj)
                            } catch (err) {
                                Logger.errorApp(ErrorCode.hashtag_failed).put("boardUpdate").put(err).next("userId").put(userId).next("tag").put(tag).out()
                                reject(err)
                            }
                        })
                    )
                }
            }
            for (let tag of board.hashTags) {
                if (hashTags.findIndex((v) => v == tag.text) == -1) {
                    deleteHashTags.push(tag)
                }
            }
            const hashTagObjs = await Promise.all(hashTagPromises)
            for (let tag of newHashTags) { // new hash tag
                userHashTagPromises.push(
                    new Promise(async (resolve, reject) => {
                        try {
                            const userHashTagObj = await DB.Manager.findOne(UserHashTag, { where: { user: { key: updaterKey }, hashTag: { text: tag.text } } })
                            if (userHashTagObj) {
                                await DB.Manager.increment(UserHashTag, userHashTagObj, "count", 1)
                            } else {
                                await DB.Manager.save(UserHashTag, { user: user, hashTag: tag })
                            }
                            resolve(true)
                        } catch (err) {
                            Logger.errorApp(ErrorCode.user_hashtag_failed).put("boardUpdate").put(err).next("userId").put(userId).next("tag").put(tag).next("userHashTagObj").out()
                            reject(true)
                        }
                    })
                )
            }
            for (let tag of deleteHashTags) { // delete hash tag
                userHashTagPromises.push(
                    new Promise(async (resolve, reject) => {
                        try {
                            const userHashTagObj = await DB.Manager.findOne(UserHashTag, { where: { user: { key: updaterKey }, hashTag: { text: tag.text } } })
                            if (!userHashTagObj) {
                                Logger.errorApp(ErrorCode.user_hashtag_failed).put("boardUpdate").put("no userHashTag").next("userId").put(userId).out()
                            }
                            if (userHashTagObj?.count > 1) {
                                await DB.Manager.decrement(UserHashTag, userHashTagObj, "count", 1)
                            } else {
                                await DB.Manager.remove(UserHashTag, userHashTagObj)
                            }
                            resolve(true)
                        } catch (err) {
                            Logger.errorApp(ErrorCode.user_hashtag_failed).put("boardUpdate").put(err).next("userId").put(userId).next("tag").put(tag).out()
                            reject(true)
                        }
                    })
                )
            }
            await Promise.all(userHashTagPromises)
            await DB.Manager.save(Board, { id: boardId, contents: contents.slice(0, MAX_CONTENTS_LEN), writer: updaterKey, updated: true, hashTags: hashTagObjs })
        } else {
            await DB.Manager.save(Board, { id: boardId, contents: contents.slice(0, MAX_CONTENTS_LEN), writer: updaterKey, updated: true })
        }
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.board_update_failed).put("boardUpdate").put(err).next("userId").put(userId).next("boardId").put(String(boardId)).out()
    } finally {
        await queryRunner.release()
        if (error) {
            return false
        } else return true
    }
}

/**
* 게시글 삭제.
* @param boardId 게시글 식별자.
*/
async function boardDelete(boardId: number, userKey: number, userId: string) {
    const board = await DB.Manager.findOne(Board, { where: { id: boardId }, relations: ["hashTags"] })
    if (!board) return true
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        const promises = []
        for (const tag of board.hashTags) {
            promises.push(
                new Promise(async (resolve, reject) => {
                    try {
                        const userHashTagObj = await DB.Manager.findOne(UserHashTag, { where: { user: { key: userKey }, hashTag: { text: tag.text } } })
                        if (!userHashTagObj) {
                            Logger.errorApp(ErrorCode.user_hashtag_failed).put("boardDelete").put("no userHashTag").next("userId").put(userId).out()
                            reject("no userHashTag")
                        }
                        if (userHashTagObj.count > 1) {
                            await DB.Manager.decrement(UserHashTag, userHashTagObj, "count", 1)
                        } else {
                            await DB.Manager.remove(UserHashTag, userHashTagObj)
                        } resolve(true)
                    } catch (err) {
                        Logger.errorApp(ErrorCode.user_hashtag_failed).put("boardDelete").put(err).next("userId").put(userId).next("tag").put(tag.text).out()
                        reject(err)
                    }
                })
            )
        }
        promises.push(DB.Manager.decrement(Url, { id: board.url }, "boardNum", 1))
        promises.push(DB.Manager.remove(Board, board))
        await Promise.all(promises)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.board_delete_failed).put("boardDelete").put(err).next("userId").put(userId).next("boardId").put(String(boardId)).out()
    } finally {
        await queryRunner.release()
        if (error) {
            return false
        } else return true
    }
}

/**
  * 게시글 업데이트.
  * @param boardId 게시글 식별자.
  * @param updaterKey 업데이트하려는 사용자 식별자.
  * @param contents 게시글 내용.
  */
async function boardChangeType(boardId: number, userKey: number, toPublic: boolean, userId: string) {
    let error = false
    try {
        const board = await DB.Manager.findOne(Board, { where: { id: boardId, writer: userKey } })
        if (board) {
            await DB.Manager.save(Board, {
                id: boardId, writer: userKey,
                isPublic: toPublic
            })
        } else {
            error = true
            Logger.errorApp(ErrorCode.board_find_failed).put("boardChangeType").next("userId").put(userId).next("boardId").put(String(boardId)).next("toPublic").put(toPublic ? "true" : "false").out()
        }
    } catch (err) {
        error = true
        Logger.errorApp(ErrorCode.board_update_failed).put("boardChangeType").put(err).next("userId").put(userId).next("boardId").put(String(boardId)).next("toPublic").put(toPublic ? "true" : "false").out()
        return false
    } finally {
        if (error) return false
        return true
    }
}

async function upBoard(boardId: number, userKey: number, userId: string) {
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.query(`insert into \`user_uped_boards_board\` (userKey, boardId) values (${userKey}, ${boardId})`)
        await queryRunner.manager.increment(Board, { id: boardId }, "upNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.board_update_failed).put("upBoard").put(err).next("userId").put(userId).next("boardId").put(String(boardId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return { up: 1 }
        else return null
    }
}
async function upAndCancelDownBoard(boardId: number, userKey: number, userId: string) {
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.query(`insert into \`user_uped_boards_board\` (userKey, boardId) values (${userKey}, ${boardId})`)
        await queryRunner.manager.increment(Board, { id: boardId }, "upNum", 1)
        await queryRunner.manager.query(`delete from \`user_downed_boards_board\` where userKey=${userKey} and boardId=${boardId}`)
        await queryRunner.manager.decrement(Board, { id: boardId }, "downNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.board_update_failed).put("upAndCancelDownBoard").put(err).next("userId").put(userId).next("boardId").put(String(boardId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return { up: 1, down: -1 }
        else return null
    }
}
async function cancelUpBoard(boardId: number, userKey: number, userId: string) {
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.query(`delete from \`user_uped_boards_board\` where userKey=${userKey} and boardId=${boardId}`)
        await queryRunner.manager.decrement(Board, { id: boardId }, "upNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.board_update_failed).put("cancelUpBoard").put(err).next("userId").put(userId).next("boardId").put(String(boardId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return { up: -1 }
        else return null
    }
}
async function downBoard(boardId: number, userKey: number, userId: string) {
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.query(`insert into \`user_downed_boards_board\` (userKey, boardId) values (${userKey}, ${boardId})`)
        await queryRunner.manager.increment(Board, { id: boardId }, "downNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.board_update_failed).put("downBoard").put(err).next("userId").put(userId).next("boardId").put(String(boardId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return { down: 1 }
        else return null
    }
}
async function downAndCancelUpBoard(boardId: number, userKey: number, userId: string) {
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.query(`insert into \`user_downed_boards_board\` (userKey, boardId) values (${userKey}, ${boardId})`)
        await queryRunner.manager.increment(Board, { id: boardId }, "downNum", 1)
        await queryRunner.manager.query(`delete from \`user_uped_boards_board\` where userKey=${userKey} and boardId=${boardId}`)
        await queryRunner.manager.decrement(Board, { id: boardId }, "upNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.board_update_failed).put("downAndCancelUpBoard").put(err).next("userId").put(userId).next("boardId").put(String(boardId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return { down: 1, up: -1 }
        else return null
    }

}
async function cancelDownBoard(boardId: number, userKey: number, userId: string) {
    let error = false
    const queryRunner = DB.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        await queryRunner.manager.query(`delete from \`user_downed_boards_board\` where userKey=${userKey} and boardId=${boardId}`)
        await queryRunner.manager.decrement(Board, { id: boardId }, "downNum", 1)
        await queryRunner.commitTransaction()
    } catch (err) {
        error = true
        await queryRunner.rollbackTransaction()
        Logger.errorApp(ErrorCode.board_update_failed).put("cancelDownBoard").put(err).next("userId").put(userId).next("boardId").put(String(boardId)).out()
    } finally {
        await queryRunner.release()
        if (!error) return { down: -1 }
        else return null
    }
}
/**
* 게시글 좋아요.
* @param boardId 게시글 식별자.
* @param userKey 사용자 디비 식별자.
*/
async function reactBoard(boardId: number, userKey: number, up: boolean, down: boolean, userId: string) {
    const board = await DB.Manager.findOne(Board, { where: { id: boardId }, select: ["writer"] })
    if (board?.writer === userKey) return null

    const uped = await DB.Manager.query(`select * from \`user_uped_boards_board\` where userKey=${userKey} and boardId=${boardId}`)
    const downed = await DB.Manager.query(`select * from \`user_downed_boards_board\` where userKey=${userKey} and boardId=${boardId}`)

    if (up) {
        if (uped.length) {
            return await cancelUpBoard(boardId, userKey, userId)
        } else if (!uped.length) {
            if (downed.length) {
                return await upAndCancelDownBoard(boardId, userKey, userId)
            } else {
                return await upBoard(boardId, userKey, userId)
            }
        }
    }
    if (down) {
        if (downed.length) {
            return await cancelDownBoard(boardId, userKey, userId)
        } else if (!downed.length) {
            if (uped.length) {
                return await downAndCancelUpBoard(boardId, userKey, userId)
            } else {
                return await downBoard(boardId, userKey, userId)
            }
        }
    } return null
}


export async function getEndOfList(list) {
    return list.length < MAX_LIST_LEN ? true : false
}

export async function getEndIdOfList(list, startId) {
    if (list.length == 0) return startId
    let endId = list[0].id
    list.forEach((b) => { if (endId > b.id) endId = b.id })
    return endId
}

export async function getEndIdOfListInorder(list, startId) {
    if (list.length == 0) return startId
    return list[list.length - 1].id
}


exports.apiInsertBoard = async (req, res, next) => {
    try {
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        const contents = req.body.c
        let hashTagText = req.body.h
        let hashTags = []
        if (hashTagText.length != 0) {
            hashTags = hashTagText.split("#")
        }
        if (hashTags.length > MAX_HASH_TAG_NUM) return
        if (hashTags.some((tag) => tag > MAX_HASH_TAG_LEN || tag.trim().length < 1)) return
        let uid = Number(req.body.uid)
        let title = String(req.body.t)
        let isPublic = true
        if (contents.length > MAX_CONTENTS_LEN) return
        if (isNaN(uid)) uid = null
        if (title === "") title = null
        if (req.body.p === "") isPublic = false
        const result = await DB.Manager.transaction(() => boardInsert(userKey, contents, hashTags, uid, title, isPublic, userId))
        if (result) next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiInsertBoard").put(err).next("userId").put(req.decoded.userId).out()
    }
}

exports.apiUpdateBoard = async (req, res, next) => {
    try {
        const boardId = Number(req.query.id)
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        const contents = req.body.c
        if (contents.length > MAX_CONTENTS_LEN) return
        let hashTagText = req.body.h
        const hashTags = hashTagText.split("#")
        if (hashTags.length > MAX_HASH_TAG_NUM) return
        if (hashTags.some((tag) => tag > MAX_HASH_TAG_LEN || tag.trim().length < 1)) return
        const result = await boardUpdate(boardId, userKey, contents, hashTags, userId)
        if (result) next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiUpdateBoard").put(err).next("userId").put(req.decoded.userId).next("boardId").put(req.query.id).out()
    }
}

exports.apiDeleteBoard = async (req, res, next) => {
    try {
        const boardId = Number(req.query.id)
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        const result = await boardDelete(boardId, userKey, userId)
        if (result) next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiDeleteBoard").put(err).next("userId").put(req.decoded.userId).next("boardId").put(req.query.id).out()
    }
}

exports.apiChangeBoardType = async (req, res, next) => {
    try {
        const boardId = Number(req.query.id)
        const forPublic = Boolean(req.query.pb)
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        const result = await boardChangeType(boardId, userKey, forPublic, userId)
        if (result) next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiChangeBoardType").put(err).next("userId").put(req.decoded.userId).next("boardId").put(req.query.id).next("forPublic").put(req.query.pb).out()
    }
}

exports.apiReactBoard = async (req, res, next) => {
    try {
        const boardId = Number(req.query.id)
        const up = Boolean(req.query.u)
        const down = Boolean(req.query.d)
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        const result = await DB.Manager.transaction(() => reactBoard(boardId, userKey, up, down, userId))
        if (result) {
            req.result = result
            next()
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiUpBoard").put(err).next("userId").put(req.decoded.userId).next("boardId").put(req.query.id).next("up").put(req.query.u).next("down").put(req.query.d).out()
    }
}