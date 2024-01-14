import Url from "model/url"
import DB from "./connection"
import { SETTINGS } from "util/setting"
import User from "model/user"

const MAX_LIST_LEN = SETTINGS.board.listLen

export class statementUrl {
    /**
    * 게시글 좋아요.
    * @param boardId 게시글 식별자.
    * @param userKey 사용자 디비 식별자.
    */
    public static async UrlReact(urlid: number, title: string, userKey: number, toCancel: boolean) {
        console.log("urlReact", toCancel, urlid)
        let url_ = await DB.Manager.findOne(Url, { where: { id: urlid } })
        if (url_) {
            DB.Manager.update(Url, { id: urlid }, { title: title })

            console.log("url_", url_)
            const reacted = await DB.Manager.query(`select * from \`user_reacted_urls_url\` where userKey=${userKey} and urlId=${url_.id}`)

            console.log(reacted, toCancel)
            if (reacted.length && toCancel) {
                console.log("react to false")
                await DB.Manager.query(`delete from \`user_reacted_urls_url\` where userKey=${userKey} and urlId=${url_.id}`)
                await DB.Manager.decrement(Url, { id: url_.id }, "reactNum", 1)
                return ({ reacted: false })
            } else if (!reacted.length && !toCancel) {
                console.log("react to true")
                await DB.Manager.query(`insert into \`user_reacted_urls_url\` (userKey, urlId) values (${userKey}, ${url_.id})`)
                await DB.Manager.increment(Url, { id: url_.id }, "reactNum", 1)
                return ({ reacted: true })
            } else return null
        } else return null
    }

    public static async reactedUrls(startId: number, userKey: number) {
        const user = await DB.Manager.findOne(User, { relations: { "reactedUrls": true }, where: { key: userKey } })
        console.log(user)
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

    public static async getUrl(url_: string, hostname_: string, userKey: number) {
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
}