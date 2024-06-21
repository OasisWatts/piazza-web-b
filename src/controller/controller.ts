import { ErrorCode } from "common/applicationCode"
import DB from "database/connection"
import Waitlist from "model/waitlist"
import Statistics from "model/statistics"
import { Logger } from "util/logger"

async function enrollInWaitlist(emailtext: string) {
    const entry = await DB.Manager.findOne(Waitlist, { where: { email: emailtext } })
    if (!entry) {
        await DB.Manager.save(Waitlist, { email: emailtext })
    }
}

async function countWaitlist() {
    const count = await DB.Manager.countBy(Waitlist, {})
    return count
}

async function countVisit() {
    await DB.Manager.increment(Statistics, { category: "visit" }, "count", 1)
}

exports.apiEnrollInWaitlist = async (req, res) => {
    const emailtext = String(req.query.e)
    try {
        await enrollInWaitlist(emailtext)
        res.send()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiEnrollInWaitlist").next("email").put(emailtext).next("error").put(err).out()
    }
}

exports.apiCountWaitlist = async (req, res) => {
    try {
        const count = await countWaitlist()
        res.json({ count })
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiCountWaitlist").next("error").put(err).out()
    }
}

exports.apiCountVisit = async (req, res) => {
    try {
        await countVisit()
        res.send()
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiCountVisit").next("error").put(err).out()
    }

}