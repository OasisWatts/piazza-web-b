import { ErrorCode } from "common/applicationCode";
import DB from "database/connection";
import UserHashTag from "model/userHashTag";
import { Logger } from "util/logger";
import { SETTINGS } from "util/setting";

const MAX_HASH_TAG_NUM = SETTINGS.board.tagCountLim

async function getFrequentlyUsedHashTags(userKey: number) {
    const userHashTags = await DB.Manager.find(UserHashTag, { relations: ["hashTag"], where: { user: { key: userKey } }, order: { count: "DESC" }, take: MAX_HASH_TAG_NUM });
    return userHashTags.map((u) => ({ text: u.hashTag.text }))
}


exports.apiGetHashTag = async (req, res, next) => {
    try {
        const userKey = req.decoded.userKey
        const hashTags = await getFrequentlyUsedHashTags(userKey)
        req.result = { hashTags };
        next();
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiGetHashTag").put(err).out()
    }
}