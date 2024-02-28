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
async function boardInsert(writerKey: number, contents: string, hashTags: string[], urlid: number, title: string, isPublic: boolean) {
    console.log("bi", urlid, title, hashTags)
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
                            Logger.errorApp(ErrorCode.hashtag_failed).put("boardInsert").put(err).out()
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
                            Logger.errorApp(ErrorCode.user_hashtag_failed).put("boardInsert").put(err).out()
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
        Logger.errorApp(ErrorCode.board_insert_failed).put(err).out()
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
async function boardUpdate(boardId: number, updaterKey: number, contents: string, hashTags: string[]) {
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
                                Logger.errorApp(ErrorCode.hashtag_failed).put("boardUpdate").put(err).out()
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
            console.log("dh", deleteHashTags, "nh", newHashTags)
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
                            Logger.errorApp(ErrorCode.user_hashtag_failed).put("boardUpdate").put(err).out()
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
                                Logger.errorApp(ErrorCode.user_hashtag_failed).put("boardUpdate").put("no userHashTag").out()
                            }
                            if (userHashTagObj?.count > 1) {
                                await DB.Manager.decrement(UserHashTag, userHashTagObj, "count", 1)
                            } else {
                                await DB.Manager.remove(UserHashTag, userHashTagObj)
                            }
                            resolve(true)
                        } catch (err) {
                            Logger.errorApp(ErrorCode.user_hashtag_failed).put("boardUpdate").put(err).out()
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
        Logger.errorApp(ErrorCode.board_update_failed).put("boardUpdate").put(err).out()
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
async function boardDelete(boardId: number, userKey: number) {
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
                        console.log("delete tag", tag)
                        const userHashTagObj = await DB.Manager.findOne(UserHashTag, { where: { user: { key: userKey }, hashTag: { text: tag.text } } })
                        if (!userHashTagObj) {
                            Logger.errorApp(ErrorCode.user_hashtag_failed).put("boardDelete").put("no userHashTag").out()
                            reject("no userHashTag")
                        }
                        console.log("uht", userHashTagObj)
                        if (userHashTagObj.count > 1) {
                            await DB.Manager.decrement(UserHashTag, userHashTagObj, "count", 1)
                        } else {
                            await DB.Manager.remove(UserHashTag, userHashTagObj)
                        } resolve(true)
                    } catch (err) {
                        Logger.errorApp(ErrorCode.user_hashtag_failed).put("boardDelete").put(err).out()
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
        Logger.errorApp(ErrorCode.board_delete_failed).put("boardDelete").put(err).out()
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
async function boardChangeType(boardId: number, userKey: number, toPublic: boolean) {
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
            Logger.errorApp(ErrorCode.board_find_failed).put("boardChangeType").out()
        }
    } catch (err) {
        error = true
        Logger.errorApp(ErrorCode.board_update_failed).put("boardChangeType").put(err).out()
        return false
    } finally {
        if (error) return false
        return true
    }
}

async function upBoard(boardId: number, userKey: number) {
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
        Logger.errorApp(ErrorCode.board_update_failed).put("upBoard").put(err).out()
    } finally {
        await queryRunner.release()
        if (!error) return { up: 1 }
        else return null
    }
}
async function upAndCancelDownBoard(boardId: number, userKey: number) {
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
        Logger.errorApp(ErrorCode.board_update_failed).put("upAndCancelDownBoard").put(err).out()
    } finally {
        await queryRunner.release()
        if (!error) return { up: 1, down: -1 }
        else return null
    }
}
async function cancelUpBoard(boardId: number, userKey: number) {
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
        Logger.errorApp(ErrorCode.board_update_failed).put("cancelUpBoard").put(err).out()
    } finally {
        await queryRunner.release()
        if (!error) return { up: -1 }
        else return null
    }
}
async function downBoard(boardId: number, userKey: number) {
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
        Logger.errorApp(ErrorCode.board_update_failed).put("downBoard").put(err).out()
    } finally {
        await queryRunner.release()
        if (!error) return { down: 1 }
        else return null
    }
}
async function downAndCancelUpBoard(boardId: number, userKey: number) {
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
        Logger.errorApp(ErrorCode.board_update_failed).put("downAndCancelUpBoard").put(err).out()
    } finally {
        await queryRunner.release()
        if (!error) return { down: 1, up: -1 }
        else return null
    }

}
async function cancelDownBoard(boardId: number, userKey: number) {
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
        Logger.errorApp(ErrorCode.board_update_failed).put("cancelDownBoard").put(err).out()
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
async function reactBoard(boardId: number, userKey: number, up: boolean, down: boolean) {
    console.log("reactBoard")
    const board = await DB.Manager.findOne(Board, { where: { id: boardId }, select: ["writer"] })
    if (board?.writer === userKey) return null

    const uped = await DB.Manager.query(`select * from \`user_uped_boards_board\` where userKey=${userKey} and boardId=${boardId}`)
    const downed = await DB.Manager.query(`select * from \`user_downed_boards_board\` where userKey=${userKey} and boardId=${boardId}`)

    console.log(uped, downed)

    if (up) {
        if (uped.length) {
            console.log("cancelUpBoard")
            return await cancelUpBoard(boardId, userKey)
        } else if (!uped.length) {
            if (downed.length) {
                console.log("upAndCancelDownBoard")
                return await upAndCancelDownBoard(boardId, userKey)
            } else {
                console.log("upBoard")
                return await upBoard(boardId, userKey)
            }
        }
    }
    if (down) {
        if (downed.length) {
            console.log("cancelDownBoard")
            return await cancelDownBoard(boardId, userKey)
        } else if (!downed.length) {
            if (uped.length) {
                console.log("downAndCancelUpBoard")
                return await downAndCancelUpBoard(boardId, userKey)
            } else {
                console.log("downBoard")
                return await downBoard(boardId, userKey)
            }
        }
    } return null
}


export async function getEndOfList(list) {
    let endOfList = list.length < MAX_LIST_LEN ? true : false
    console.log("ll", list.length, endOfList, MAX_LIST_LEN)
    return endOfList
}

export async function getEndIdOfList(list, startId) {
    if (list.length == 0) return startId
    let endId = list[0].id
    list.forEach((b) => { if (endId > b.id) endId = b.id })
    console.log("endId", endId)
    return endId
}

export async function getEndIdOfListInorder(list, startId) {
    if (list.length == 0) return startId
    return list[list.length - 1].id
}


exports.apiInsertBoard = async (req, res, next) => {
    try {
        const userKey = req.decoded.userKey
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
        const result = await DB.Manager.transaction(() => boardInsert(userKey, contents, hashTags, uid, title, isPublic))
        if (result) next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiInsertBoard").put(err).out()
    }
}

exports.apiUpdateBoard = async (req, res, next) => {
    try {
        const boardId = Number(req.query.id)
        const userKey = req.decoded.userKey
        const contents = req.body.c
        if (contents.length > MAX_CONTENTS_LEN) return
        let hashTagText = req.body.h
        const hashTags = hashTagText.split("#")
        if (hashTags.length > MAX_HASH_TAG_NUM) return
        if (hashTags.some((tag) => tag > MAX_HASH_TAG_LEN || tag.trim().length < 1)) return
        const result = await boardUpdate(boardId, userKey, contents, hashTags)
        if (result) next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiUpdateBoard").put(err).out()
    }
}

exports.apiDeleteBoard = async (req, res, next) => {
    try {
        const boardId = Number(req.query.id)
        const userKey = req.decoded.userKey
        const result = await boardDelete(boardId, userKey)
        if (result) next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiDeleteBoard").put(err).out()
    }
}

exports.apiChangeBoardType = async (req, res, next) => {
    try {
        const boardId = Number(req.query.id)
        const forPublic = Boolean(req.query.pb)
        const userKey = req.decoded.userKey
        const result = await boardChangeType(boardId, userKey, forPublic)
        if (result) next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiChangeBoardType").put(err).out()
    }
}

exports.apiReactBoard = async (req, res, next) => {
    try {
        const boardId = Number(req.query.id)
        const up = Boolean(req.query.u)
        const down = Boolean(req.query.d)
        const userKey = req.decoded.userKey
        const result = await DB.Manager.transaction(() => reactBoard(boardId, userKey, up, down))
        if (result) {
            req.result = result
            next()
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiUpBoard").put(err).out()
    }
}