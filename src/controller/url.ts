import Url from "model/url"
import DB from "database/connection"
import { SETTINGS } from "util/setting"
import User from "model/user"
import { Logger } from "util/logger"
import { ErrorCode } from "common/applicationCode"

const MAX_LIST_LEN = SETTINGS.board.listLen

/**
* 게시글 좋아요.
* @param boardId 게시글 식별자.
* @param userKey 사용자 디비 식별자.
*/
async function UrlReact(urlid: number, title: string, userKey: number, toCancel: boolean) {
    let url_ = await DB.Manager.findOne(Url, { where: { id: urlid } })
    if (url_) {
        if (title) DB.Manager.update(Url, { id: urlid }, { title: title })

        const reacted = await DB.Manager.query(`select * from \`user_reacted_urls_url\` where userKey=${userKey} and urlId=${url_.id}`)

        if (reacted.length && toCancel) {
            await DB.Manager.query(`delete from \`user_reacted_urls_url\` where userKey=${userKey} and urlId=${url_.id}`)
            await DB.Manager.decrement(Url, { id: url_.id }, "reactNum", 1)
            return ({ reacted: false })
        } else if (!reacted.length && !toCancel) {
            await DB.Manager.query(`insert into \`user_reacted_urls_url\` (userKey, urlId) values (${userKey}, ${url_.id})`)
            await DB.Manager.increment(Url, { id: url_.id }, "reactNum", 1)
            return ({ reacted: true })
        } else return null
    } else return null
}

async function reactedUrls(startId: number, userKey: number, userId: string) {
    const user = await DB.Manager.findOne(User, { relations: { "reactedUrls": true }, where: { key: userKey } })
    if (!user) {
        Logger.errorApp(ErrorCode.user_find_failed).put("reactedUrls").next("userId").put(userId).next("sid").put(String(startId)).out()
        return false
    }
    const tmpEndId = startId + MAX_LIST_LEN
    const urlsLen = user.reactedUrls?.length || 0
    const endOfList = tmpEndId < urlsLen ? false : true
    const endId = tmpEndId < urlsLen ? tmpEndId : urlsLen
    const urlList = urlsLen > 0 ? user.reactedUrls.slice(startId, endId).map((url) => ({
        uid: url.id,
        url: url.url,
        hostname: url.hostname,
        title: url.title,
        boardNum: url.boardNum,
        reactNum: url.reactNum,
        reacted: true
    })) : []
    return ({ urlList, endId, end: endOfList })
}

async function getUrl(url_: string, hostname_: string, userKey: number) {
    const urlObj = new URL(url_)
    urlObj.hash = ""
    const urlWoHash = urlObj.toString()
    let url = await DB.Manager.findOne(Url, { where: { url: urlWoHash } })
    let reacted = false
    if (!url) {
        url = await DB.Manager.save(Url, { url: urlWoHash, hostname: hostname_ })
    } else {
        const _reacted = await DB.Manager.query(`select * from \`user_reacted_urls_url\` where userKey=${userKey} and urlId=${url.id}`)
        reacted = _reacted.length ? true : false
    }
    return ({
        uid: url.id,
        url: url.url,
        title: url.title,
        hostname: url.hostname,
        boardNum: url.boardNum,
        reactNum: url.reactNum,
        reacted: reacted
    })
}

exports.apiUpUrl = async (req, res, next) => {
    try {
        let urlid = Number(req.body.uid)
        let title = String(req.body.t)
        const toCancel = Boolean(req.body.cc)
        const userKey = req.decoded.userKey
        Logger.enterApi("apiUpUrl").next("userId").put(req.decoded.userId).next("urlid").put(String(req.body.uid)).next("title").put(title).next("toCancel").put(String(req.body.cc)).out()
        if (isNaN(urlid)) urlid = null
        if (title === "") title = null
        const result = await DB.Manager.transaction(() => UrlReact(urlid, title, userKey, toCancel))
        if (result) {
            req.result = result
            next()
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiUpUrl").next("userId").put(req.decoded.userId).put(err).next("urlid").put(String(req.body.uid)).next("title").put(String(req.body.t)).next("toCancel").put(String(req.body.cc)).out()
    }
}

exports.apiGetUpUrls = async (req, res, next) => {
    try {
        const startId = Number(req.query.sid)
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        Logger.enterApi("apiGetUpUrls").next("userId").put(userId).next("sid").put(req.query.sid).out()
        const result = await reactedUrls(startId, userKey, userId)
        if (result) {
            req.result = result
            next()
        } else {
            req.result = { needAuth: true }
            next()
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetUpUrls").next("userId").put(req.decoded.userId).put(err).next("sid").put(req.query.sid).out()
    }
}

exports.apiGetUrlInfo = async (req, res, next) => {
    try {
        const urlname = String(req.body.u)
        const hostname = String(req.body.h)
        const userKey = req.decoded.userKey
        Logger.enterApi("apiGetUrlInfo").next("userId").put(req.decoded.userId).next("urlname").put(urlname).next("hostname").put(hostname).out()
        const result = await getUrl(urlname, hostname, userKey)
        if (result) {
            req.result = result
            next()
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetUrlInfo").put(err).next("userId").put(req.decoded.userId).next("urlname").put(String(req.body.u)).next("hostname").put(String(req.body.h)).out()
    }
}