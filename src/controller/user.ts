import { ErrorCode } from "common/applicationCode"
import DB from "database/connection"
import User from "model/user"
import { Logger } from "util/logger"

/**
 * 로그인 또는 계정 생성
 * @param userKey 
 * @param name
 */
async function changeName(userKey: number, name: string, userId: string) {
    return new Promise((resolve, reject) => {
        DB.Manager.update(User, { key: userKey }, { name: name }).then((res) => {
            resolve(true)
            return
        }).catch((err) => Logger.errorApp(ErrorCode.user_save_failed).put("changeName").put(err).next("userId").put(userId).next("name").put(name).out())
    })
}

async function deleteAccount(userKey: number, userId: string) {
    return new Promise((resolve, reject) => {
        DB.Manager.delete(User, { key: userKey }).then((res) => {
            resolve(true)
            return
        }).catch((err) => Logger.errorApp(ErrorCode.user_delete_failed).put("deleteAccount").put(err).next("userId").put(userId).out())
    })
}

exports.apiChangeName = async (req, res, next) => {
    try {
        const name = String(req.body.name)
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        const result = await changeName(userKey, name, userId)
        if (result) {
            next()
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiChangeName").put(err).next("userId").put(req.decoded.userId).next("name").put(String(req.body.name)).out()
    }
}

exports.apiDeleteAccount = async (req, res, next) => {
    try {
        const userKey = req.decoded.userKey
        const userId = req.decoded.userId
        const result = await deleteAccount(userKey, userId)
        if (result) {
            next()
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiDeleteAccount").put(err).next("userId").put(req.decoded.userId).out()
    }
}