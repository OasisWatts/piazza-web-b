import { ErrorCode } from "common/applicationCode"
import DB from "database/connection"
import User from "model/user"
import { Logger } from "util/logger"

/**
 * 로그인 또는 계정 생성
 * @param userKey 
 * @param name
 */
async function changeName(userKey: number, name: string) {
    console.log("cn", name)
    return new Promise((resolve, reject) => {
        DB.Manager.update(User, { key: userKey }, { name: name }).then((res) => {
            Logger.passApp("change Name").put("complete").out()
            resolve(true)
            return
        }).catch((err) => Logger.errorApp(ErrorCode.user_save_failed).put("changeName").put(err).out())
    })
}

async function deleteAccount(userKey: number) {
    return new Promise((resolve, reject) => {
        DB.Manager.delete(User, { key: userKey }).then((res) => {
            resolve(true)
            return
        }).catch((err) => Logger.errorApp(ErrorCode.user_delete_failed).put("deleteAccount").put(err).out())
    })
}

exports.apiChangeName = async (req, res, next) => {
    try {
        const name = String(req.body.name)
        const userKey = req.decoded.userKey
        const result = await changeName(userKey, name)
        if (result) {
            next()
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiChangeName").put(err).out()
    }
}

exports.apiDeleteAccount = async (req, res, next) => {
    try {
        const userKey = req.decoded.userKey
        const result = await deleteAccount(userKey)
        if (result) {
            next()
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiDeleteAccount").put(err).out()
    }
}