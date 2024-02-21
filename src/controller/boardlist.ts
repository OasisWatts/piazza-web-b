import DB from "database/connection"
import User from "model/user"
import { SETTINGS } from "util/setting"
import { reduceToTable } from "util/utility"
import { Logger } from "util/logger"
import { ErrorCode } from "common/applicationCode"
import { getEndIdOfList, getEndOfList } from "./board"
import Board from "model/board"


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

// async function getSearchBoards(startId: number, userKey: number, blockeds: number[], search: string): Promise<any[]> {
//     let whereQuery: string = (startId ? `where id < ${startId} and ` : "where ") + `contents like \"%${search}%\"`
//     let fromQuery: string = "from \`board\`"
//     let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
//     let selectAndQuery = `, (select count(*) from \`user_uped_boards_board\` where userKey = ${userKey} and boardId = a.id) as reacted`

//     const bList = await DB.Manager.query(
//         `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
//                               from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
//                               ) b join \`board\` a on b.id = a.id;`,
//     ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getSearchBoards").put(err).out())  // 차단 대상 제외.
//     let bListFiltered = bList.filter((b: any) => !blockeds.includes(b.writer))
//     return bListFiltered.sort((b1, b2) => b2.reactNum - b1.reactNum)
// }
// async function getUserBoards(startId: number, userKey: number, searchUser: number): Promise<any[]> {
//     let whereQuery: string = (startId ? `where id < ${startId} and ` : "where ") + `writer = ${searchUser}`
//     let fromQuery: string = "from \`board\`"
//     let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
//     let selectAndQuery = `, (select count(*) from \`user_uped_boards_board\` where userKey = ${userKey} and boardId = a.id) as reacted`
//     const bList = await DB.Manager.query(
//         `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
//                               from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
//                               ) b join \`board\` a on b.id = a.id;`,
//     ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getUserBoards").put(err).out())  // 차단 대상 제외.
//     console.log("bList", bList)
//     return bList.sort((b1, b2) => b2.reactNum - b1.reactNum)
// }

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