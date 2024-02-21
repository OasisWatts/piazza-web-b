import jwt from "jsonwebtoken"
import DB from "./connection";
import RefreshToken from "model/token";
import { Logger } from "util/logger";
import { ErrorCode } from "common/applicationCode";

async function verifyRefreshToken(userKey: number) {
    try {
        const refreshTokenEntity = await DB.Manager.findOne(RefreshToken, { where: { userKey } })
        const refreshToken = refreshTokenEntity.contents
        jwt.verify(refreshToken, process.env.JWT_SECRET)
        return true
    } catch (err) {
        return false
    }
}

async function verifyAccessToken(accessToken) {
    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
        return { ok: true, decoded }
    } catch (err) {
        return { ok: false }
    }
}

export function makeAccessToken(userKey) {
    const token = jwt.sign({
        userKey
    }, process.env.JWT_SECRET, {
        expiresIn: "1m"
    })
    return token
}

export async function makeRefreshToken(userKey) {
    try {
        console.log("makeRefreshToken")
        const token = jwt.sign({
        }, process.env.JWT_SECRET, {
            expiresIn: "14d"
        })
        await DB.Manager.delete(RefreshToken, { userKey })
        await DB.Manager.insert(RefreshToken, { userKey, contents: token })
    } catch (err) {
        Logger.errorApp(ErrorCode.refreshToken_create_failed).put("makeRefreshToken").put(err).out()
    }
}

export const verifyToken = async (req, res, next) => {
    try {
        const accessTokenVerified = await verifyAccessToken(req.headers.authorization)
        console.log("verifyToken")
        if (accessTokenVerified.ok) { // authorized and not expired
            console.log("verified")
            req.decoded = accessTokenVerified.decoded
            const refreshTokenVerified = await verifyRefreshToken(req.decoded.userKey)
            if (!refreshTokenVerified) await makeRefreshToken(req.decoded.userKey)
            console.log("next")
            return next();
        } else {
            console.log("unverified")
            const decoded = jwt.decode(req.headers.authorization)
            console.log("userKey", decoded["userKey"])
            const refreshTokenVerified = await verifyRefreshToken(decoded["userKey"])
            if (refreshTokenVerified) {
                console.log("refreshTkVerified")
                req.decoded = decoded
                req.newToken = makeAccessToken(decoded["userKey"])
                return next();
            } else { // refresh token and access token unverified
                console.log("failed both")
                return res.json({ needAuth: true })
            }
        }
    } catch (err) {
        Logger.errorApp(ErrorCode.verify_token_failed).put("verify token").put(err).out()
        console.log("verify error")
        return res.json({ needAuth: true })
    }
}

export const sendWithNewTokenJSON = (req, res, next) => {
    res.json({ ...req.result, newTk: req.newToken })
}

export const sendWithNewToken = (req, res, next) => {
    res.json({ pass: true, newTk: req.newToken })
}