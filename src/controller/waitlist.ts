import { ErrorCode } from "common/applicationCode"
import DB from "database/connection"
import Waitlist from "model/waitlist"
import { Logger } from "util/logger"

export function enrollInWaitlist(emailtext: string) {
    DB.Manager.save(Waitlist, { email: emailtext })
}

exports.apiEnrollInWaitlist = async (req, res, next) => {
    const emailtext = String(req.query.e)
    try {
        await enrollInWaitlist(emailtext)
        res.send()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiEnrollInWaitlist").next("email").put(emailtext).next("error").put(err).out()
    }
}