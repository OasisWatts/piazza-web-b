import DB from "database/connection"
import { ErrorCode } from "common/applicationCode"
import User from "model/user"
import { Logger } from "util/logger"
import admin from 'firebase-admin'
import { OAuth2Client } from 'google-auth-library';
import { getAuth } from "firebase-admin/auth"

const { makeAccessToken, makeRefreshToken } = require("database/token")

var serviceAccount = require("../../firebase-service-account.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
const client = new OAuth2Client();

function decodeToken(idToken: string, signedMethod: string) {
    if (signedMethod == "google") {
        return new Promise((resolve, reject) => {
            client.verifyIdToken({
                idToken: idToken,
                audience: "1014849903887-9mnmap14qoqt5mps4458tgumbhu6pdf7.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            }).then((ticket) => {
                const payload = ticket.getPayload();
                console.log(payload)
                resolve({ uid: payload.sub, email: payload.email })
            }).catch((error) => {
                Logger.errorApp(ErrorCode.token_failed).put(error).out()
            })
        })
    } else if (signedMethod == "email") {
        return new Promise((resolve, reject) => {
            getAuth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    resolve({ uid: decodedToken.uid, email: decodedToken.email })
                })
                .catch((error) => {
                    Logger.errorApp(ErrorCode.token_failed).put(error).out()
                })
        })
    } else return null
}
/**
 * 로그인 또는 계정 생성
 */
async function signIn(token: string, signedMethod: string) {
    console.log("1")
    const decodedToken = await decodeToken(token, signedMethod)
    console.log("2")
    if (decodedToken) {
        return new Promise((resolve, reject) => {
            console.log("signIn", decodedToken)
            DB.Manager.findOne(User, { where: { uid: decodedToken["uid"], email: decodedToken["email"] } }).then((user) => {
                if (user) {
                    Logger.passApp("signIn").put("complete").out()
                    resolve({ signed: true, userKey: user.key, name: user.name, image: user.image })
                } else {
                    console.log("needSignUp")
                    resolve({ needSignUp: true })
                }
            }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("signIn").put(err).out())
        })
    } else return null
}
/**
 * 로그인 또는 계정 생성
 */
async function signUp(token: string, name: string, signedMethod: string) {
    const decodedToken = await decodeToken(token, signedMethod)
    if (decodedToken) {
        return new Promise((resolve, reject) => {
            DB.Manager.findOne(User, { where: { uid: decodedToken["uid"], email: decodedToken["email"] } }).then((user) => {
                if (!user) {
                    DB.Manager.save(User, { name, uid: decodedToken["uid"], email: decodedToken["email"] }).then((res) => {
                        Logger.passApp("signUp").put("complete").out()
                        resolve({ signed: true, userKey: res.key })
                        return
                    }).catch((err) => Logger.errorApp(ErrorCode.user_save_failed).put("signUp").put(err).out())
                } else {
                    resolve({ signed: false, already_exists: true })
                }
            })
        })
    } else return null
}

exports.apiSignIn = async (req, res, next) => {
    try {
        const token = String(req.body.t)
        const signedMethod = String(req.body.m)
        const result: any = await signIn(token, signedMethod)
        if (result) {
            if (result.signed) {
                const token = makeAccessToken(result.userKey)
                await makeRefreshToken(result.userKey)
                res.json({ signed: true, name: result.name, image: result.image, token })
            } else if (result.needSignUp) {
                res.json({ needSignUp: true })
            } else res.json({ signed: false })
        } else res.json({ signed: false })
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiSignIn").put(err).out()
    }
}

exports.apiSignUp = async (req, res, next) => {
    try {
        const token = String(req.body.t)
        const name = String(req.body.n)
        const signedMethod = String(req.body.m)
        if (name.length < 2) return
        const result: any = await signUp(token, name, signedMethod)
        if (result.signed) {
            const token = makeAccessToken(result.userKey)
            await makeRefreshToken(result.userKey)
            res.json({ signed: true, name: result.name, image: result.image, token })
        } else if (result.already_exists) {
            res.json({ signed: false, already_exists: true })
        } else res.json({ signed: false })
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiSignUp").put(err).out()
    }
}