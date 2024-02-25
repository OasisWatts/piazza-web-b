import DB from "database/connection"
import User from "model/user"
import { SETTINGS } from "util/setting"
import { reduceToTable } from "util/utility"
import { Logger } from "util/logger"
import { ErrorCode } from "common/applicationCode"
import { getEndIdOfList, getEndOfList } from "./board"
import Board from "model/board"
import { Like } from "typeorm"


const MAX_CONTENTS_LEN = 100 // SETTINGS.board.contentsLen
const MAX_LIST_LEN = SETTINGS.board.listLen

async function getMyBoards(startId: number, userKey: number): Promise<any[]> {
    return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, skip: startId, take: MAX_LIST_LEN, where: { writer: userKey } })
}

async function getMyUpBoards(startId: number, userKey: number): Promise<any[]> {
    return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, skip: startId, take: MAX_LIST_LEN, where: { upedUsers: { key: userKey } } })
}

async function getMyDownBoards(startId: number, userKey: number): Promise<any[]> {
    return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, skip: startId, take: MAX_LIST_LEN, where: { downedUsers: { key: userKey } } })
}

async function getUrlBoards(startId: number, url: number): Promise<any[]> {
    return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, skip: startId, take: MAX_LIST_LEN, where: { url: { id: url } } })
}

async function getMyBoardSearch(startId: number, userKey: number, hashTag: string, keyword: string): Promise<any[]> {
    if (hashTag) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, skip: startId, take: MAX_LIST_LEN, where: { writer: userKey, hashTags: { text: hashTag } } })
    else if (keyword) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, skip: startId, take: MAX_LIST_LEN, where: [{ writer: userKey, hashTags: { text: keyword } }, { writer: userKey, contents: Like(`%${keyword}%`) }] })
    return []
}

async function getMyUpSearch(startId: number, userKey: number, hashTag: string, keyword: string): Promise<any[]> {
    if (hashTag) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, skip: startId, take: MAX_LIST_LEN, where: { upedUsers: { key: userKey }, hashTags: { text: hashTag } } })
    else if (keyword) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, skip: startId, take: MAX_LIST_LEN, where: [{ upedUsers: { key: userKey }, hashTags: { text: keyword } }, { upedUsers: { key: userKey }, contents: Like(`%${keyword}%`) }] })
    return []
}

async function getUpedAndDowned(bList: Board[], userKey: number) {
    const promises = []
    for (const bid in bList) {
        promises.push(
            new Promise(async (resolve, reject) => {
                try {
                    const isUped = await DB.Manager.findOne(Board, { where: { id: bList[bid].id, upedUsers: { key: userKey } } })
                    if (isUped) bList[bid]["uped"] = true
                    else bList[bid]["uped"] = false
                    resolve(true)
                } catch (err) {
                    Logger.errorApp(ErrorCode.board_find_failed).put("getUpedAndDowned").put(err).out()
                    reject(err)
                }
            })
        )
        promises.push(
            new Promise(async (resolve, reject) => {
                try {
                    const isDowned = await DB.Manager.findOne(Board, { where: { id: bList[bid].id, downedUsers: { key: userKey } } })
                    if (isDowned) bList[bid]["downed"] = true
                    else bList[bid]["downed"] = false
                    resolve(true)
                } catch (err) {
                    Logger.errorApp(ErrorCode.board_find_failed).put("getUpedAndDowned").put(err).out()
                    reject(err)
                }
            })
        )
    }
    await Promise.all(promises)
    return bList
}
/**
 * 
 * @param bList 
 * @param userKey 
 * @param startId 
 * @returns 
 */
async function getAllBoardInfos(bList) {
    const boardList: boardType[] = []
    // where
    const userWhere: { key: number }[] = []
    for (const item of bList) {
        userWhere.push({
            key: item.writer,
        })
    } // 게시물 글쓴이 정보 조회.
    const users = await DB.Manager.find(User, {
        where: userWhere
    })
    const userTable = reduceToTable(users, (v) => v, (v) => v.key)

    for (const item of bList) {
        console.log("item", item)
        const user: any = userTable[item.writer]
        if (user == null || item == null) continue
        const board = {
            id: item.id,
            writer: user.name,
            uid: item.url?.id,
            url: item.url?.url,
            urlHostname: item.url?.hostname,
            urlTitle: item.url?.title,
            urlBoardNum: item.url?.boardNum,
            urlReactNum: item.url?.reactNum,
            contents: item.contents.slice(0, MAX_CONTENTS_LEN),
            tags: item.hashTags.map((tag) => tag.text),
            commentNum: item.commentNum,
            date: String(item.date),
            upNum: item.upNum,
            downNum: item.downNum,
            uped: item.uped ?? false,
            downed: item.downed ?? false,
            updated: item.updated,
            isPublic: item.isPublic
        }
        boardList.push(board)
    }
    return boardList
}

exports.apiGetMyBoards = async (req, res, next) => {
    try {
        const startId = Number(req.query.sid)
        const userKey = req.decoded.userKey
        const bList = await getMyBoards(startId, userKey)
        const endId = await getEndIdOfList(bList, startId)
        const end = await getEndOfList(bList)
        const bInfoList = await getAllBoardInfos(bList)
        req.result = { boardList: bInfoList, end, endId }
        next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetMyBoards").put(err).out()
    }
}

exports.apiGetMyUpBoards = async (req, res, next) => {
    try {
        const startId = Number(req.query.sid)
        const userKey = req.decoded.userKey
        const bList = await getMyUpBoards(startId, userKey)
        const endId = await getEndIdOfList(bList, startId)
        const end = await getEndOfList(bList)
        const bListWithUpedAndDowned = await getUpedAndDowned(bList, userKey)
        const bInfoList = await getAllBoardInfos(bListWithUpedAndDowned)
        req.result = { boardList: bInfoList, end, endId }
        next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetMyUpBoards").put(err).out()
    }
}

exports.apiGetMyDownBoards = async (req, res, next) => {
    try {
        const startId = Number(req.query.sid)
        const userKey = req.decoded.userKey
        const bList = await getMyDownBoards(startId, userKey)
        const endId = await getEndIdOfList(bList, startId)
        const end = await getEndOfList(bList)
        const bListWithUpedAndDowned = await getUpedAndDowned(bList, userKey)
        const bInfoList = await getAllBoardInfos(bListWithUpedAndDowned)
        req.result = { boardList: bInfoList, end, endId }
        next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetMyDownBoards").put(err).out()
    }
}

exports.apiGetUrlBoards = async (req, res, next) => {
    try {
        const startId = Number(req.query.sid)
        const urlid = Number(req.query.uid)
        const userKey = req.decoded.userKey
        const newTk = req.newToken
        const bList = await getUrlBoards(startId, urlid)
        const endId = await getEndIdOfList(bList, startId)
        const end = await getEndOfList(bList)
        const bListWithUpedAndDowned = await getUpedAndDowned(bList, userKey)
        const bInfoList = await getAllBoardInfos(bListWithUpedAndDowned)
        req.result = { boardList: bInfoList, end, endId, newTk }
        next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetUrlBoards").put(err).out()
    }
}

exports.apiGetMyBoardSearch = async (req, res, next) => {
    try {
        const startId = Number(req.query.sid)
        const userKey = req.decoded.userKey
        const hashTag = req.query.ht
        const keyword = req.query.kw
        console.log(hashTag, keyword)
        const bList = await getMyBoardSearch(startId, userKey, hashTag, keyword)
        console.log("bl", bList)
        const endId = await getEndIdOfList(bList, startId)
        const end = await getEndOfList(bList)
        const bInfoList = await getAllBoardInfos(bList)
        req.result = { boardList: bInfoList, end, endId }
        next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetMyBoardSearch").put(err).out()
    }
}

exports.apiGetMyUpSearch = async (req, res, next) => {
    try {
        const startId = Number(req.query.sid)
        const userKey = req.decoded.userKey
        const hashTag = req.query.ht
        const keyword = req.query.kw
        const bList = await getMyUpSearch(startId, userKey, hashTag, keyword)
        const endId = await getEndIdOfList(bList, startId)
        const end = await getEndOfList(bList)
        const bListWithUpedAndDowned = await getUpedAndDowned(bList, userKey)
        const bInfoList = await getAllBoardInfos(bListWithUpedAndDowned)
        req.result = { boardList: bInfoList, end, endId }
        next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetMyUpSearch").put(err).out()
    }
}