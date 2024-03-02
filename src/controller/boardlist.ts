import DB from "database/connection"
import User from "model/user"
import { SETTINGS } from "util/setting"
import { reduceToTable } from "util/utility"
import { Logger } from "util/logger"
import { ErrorCode } from "common/applicationCode"
import { getEndIdOfList, getEndOfList } from "./board"
import Board from "model/board"
import { LessThan, Like, MoreThan } from "typeorm"


const MAX_CONTENTS_LEN = SETTINGS.board.contentsLen
const MAX_LIST_LEN = SETTINGS.board.listLen
const TREND_LIST_LEN = SETTINGS.board.trendListLen
const TREND_LIST_FILTER_ID_RANGE = SETTINGS.board.trendListFilterIdRange

async function getMyBoards(startId: number, userKey: number): Promise<any[]> {
    if (startId == 0) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { writer: userKey } })
    return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { writer: userKey, id: LessThan(startId) } })
}

async function getMyUpBoards(startId: number, userKey: number): Promise<any[]> {
    if (startId == 0) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { upedUsers: { key: userKey } } })
    return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { upedUsers: { key: userKey }, id: LessThan(startId) } })
}

async function getMyDownBoards(startId: number, userKey: number): Promise<any[]> {
    if (startId == 0) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { downedUsers: { key: userKey } } })
    return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { downedUsers: { key: userKey }, id: LessThan(startId) } })
}

async function getTrendBoards(startId: number): Promise<any[]> {
    const board = await DB.Manager.find(Board, { order: { id: "DESC" }, take: 1 })
    const trendBoards = await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { visitNum: "DESC", id: "DESC" }, take: TREND_LIST_LEN, where: { id: MoreThan(board[0].id - TREND_LIST_FILTER_ID_RANGE), isPublic: true } })
    return trendBoards.slice(MAX_LIST_LEN * startId, MAX_LIST_LEN * (startId + 1))
}

async function getUrlBoards(startId: number, url: number): Promise<any[]> {
    if (startId == 0) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { url: { id: url }, isPublic: true } })
    return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { url: { id: url }, isPublic: true, id: LessThan(startId) } })
}

async function getMyBoardSearch(startId: number, userKey: number, hashTag: string, keyword: string): Promise<any[]> {
    if (hashTag) {
        if (startId == 0) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { writer: userKey, hashTags: { text: hashTag } } })
        else return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { writer: userKey, hashTags: { text: hashTag }, id: LessThan(startId) } })
    } else if (keyword) {
        if (startId == 0) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: [{ writer: userKey, hashTags: { text: keyword } }, { writer: userKey, contents: Like(`%${keyword}%`) }] })
        else return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: [{ writer: userKey, hashTags: { text: keyword }, id: LessThan(startId) }, { writer: userKey, contents: Like(`%${keyword}%`), id: LessThan(startId) }] })
    }
    return []
}

async function getMyUpSearch(startId: number, userKey: number, hashTag: string, keyword: string): Promise<any[]> {
    if (hashTag) {
        if (startId == 0) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { upedUsers: { key: userKey }, hashTags: { text: hashTag } } })
        else return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { upedUsers: { key: userKey }, hashTags: { text: hashTag }, id: LessThan(startId) } })
    } else if (keyword) {
        if (startId == 0) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: [{ upedUsers: { key: userKey }, hashTags: { text: keyword } }, { upedUsers: { key: userKey }, contents: Like(`%${keyword}%`) }] })
        return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: [{ upedUsers: { key: userKey }, hashTags: { text: keyword }, id: LessThan(startId) }, { upedUsers: { key: userKey }, contents: Like(`%${keyword}%`), id: LessThan(startId) }] })
    } return []
}

async function getBoardSearch(startId: number, hashTag: string, keyword: string): Promise<any[]> {
    if (hashTag) {
        if (startId == 0) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { hashTags: { text: hashTag }, isPublic: true } })
        else return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: { hashTags: { text: hashTag }, id: LessThan(startId), isPublic: true } })
    } else if (keyword) {
        if (startId == 0) return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: [{ hashTags: { text: keyword }, isPublic: true }, { contents: Like(`%${keyword}%`), isPublic: true }] })
        return await DB.Manager.find(Board, { relations: { hashTags: true, url: true }, order: { id: "DESC" }, take: MAX_LIST_LEN, where: [{ hashTags: { text: keyword }, id: LessThan(startId), isPublic: true }, { contents: Like(`%${keyword}%`), id: LessThan(startId), isPublic: true }] })
    } return []
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
        if (item == null) continue
        const user: any = userTable[item.writer]
        let userName = user ? user.name : "?"
        const board = {
            id: item.id,
            writer: userName,
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

exports.apiGetTrendBoards = async (req, res, next) => {
    try {
        const startId = Number(req.query.sid)
        const userKey = req.decoded.userKey
        const bList = await getTrendBoards(startId)
        const end = await getEndOfList(bList)
        const bListWithUpedAndDowned = await getUpedAndDowned(bList, userKey)
        const bInfoList = await getAllBoardInfos(bListWithUpedAndDowned)
        req.result = { boardList: bInfoList, end, endId: startId + 1 }
        next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetTrendBoards").put(err).out()
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
        const bList = await getMyBoardSearch(startId, userKey, hashTag, keyword)
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

exports.apiGetBoardSearch = async (req, res, next) => {
    try {
        const startId = Number(req.query.sid)
        const userKey = req.decoded.userKey
        const hashTag = req.query.ht
        const keyword = req.query.kw
        const bList = await getBoardSearch(startId, hashTag, keyword)
        const endId = await getEndIdOfList(bList, startId)
        const end = await getEndOfList(bList)
        const bListWithUpedAndDowned = await getUpedAndDowned(bList, userKey)
        const bInfoList = await getAllBoardInfos(bListWithUpedAndDowned)
        req.result = { boardList: bInfoList, end, endId }
        next()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetBoardSearch").put(err).out()
    }
}