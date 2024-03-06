import DB from "database/connection"
import { ErrorCode } from "common/applicationCode"
import User from "model/user"
import { Logger } from "util/logger"
import admin from 'firebase-admin'
import { OAuth2Client } from 'google-auth-library'
import verifyAppleToken from "verify-apple-id-token"
import { getAuth } from "firebase-admin/auth"
import axios from "axios"
import { v4 } from "uuid"

const { makeAccessToken, makeRefreshToken } = require("database/token")

var serviceAccount = require("../../firebase-service-account.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
const client = new OAuth2Client();

function decodeToken(idToken: string, signedMethod: string) {
    Logger.passApp("decodeToken").next("signedMethod").put(signedMethod).out()
    if (signedMethod == "google") {
        return new Promise((resolve, reject) => {
            client.verifyIdToken({
                idToken: idToken,
                audience: ["1014849903887-9mnmap14qoqt5mps4458tgumbhu6pdf7.apps.googleusercontent.com", "1014849903887-fdgqqjforesaopodqbsm9nlg2se4mud7.apps.googleusercontent.com"],  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            }).then((ticket) => {
                const payload = ticket.getPayload();
                resolve({ uid: payload.sub, email: payload.email })
            }).catch((error) => {
                Logger.errorApp(ErrorCode.token_failed).put("google").put(error).out()
            })
        })
    } else if (signedMethod == "facebook") {
        return new Promise((resolve, reject) => {
            axios.get(
                `https://graph.facebook.com/me?access_token=${idToken}`).then((res) => {
                    resolve({ uid: res.data.id, email: res.data.email })
                }).catch((error) => {
                    Logger.errorApp(ErrorCode.token_failed).put("facebook").put(error).out()
                })
        });
    } else if (signedMethod == "apple") {
        return new Promise((resolve, reject) => {
            verifyAppleToken({
                idToken: idToken,
                clientId: "com.brownie.flutterbrowser"
            }).then((res) => {
                resolve({ uid: res.sub, email: res.email })
            }).catch((error) => {
                Logger.errorApp(ErrorCode.token_failed).put("apple").put(error).out()
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
                    Logger.errorApp(ErrorCode.token_failed).put("email").put(error).out()
                })
        })
    } else return null
}
/**
 * 로그인 또는 계정 생성
 */
async function signIn(token: string, signedMethod: string) {
    Logger.passApp("signIn").next("signedMethod").put(signedMethod).out()
    const decodedToken = await decodeToken(token, signedMethod)
    if (decodedToken) {
        return new Promise((resolve, reject) => {
            DB.Manager.findOne(User, { where: { uid: decodedToken["uid"], email: decodedToken["email"] } }).then((user) => {
                if (user) {
                    Logger.passApp("signIn").put("signed").next("userId").put(String(user.userId)).next("name").put(user.name)
                    resolve({ signed: true, userKey: user.key, userId: user.userId, name: user.name, image: user.image })
                } else {
                    Logger.passApp("signIn").put("need to sign up").out() // sign up request 이전의 서버 오류인지, 이후의 어플리케이션 오류인지 파악
                    resolve({ needSignUp: true })
                }
            }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("signIn").put(err).next("uid").put(decodedToken["uid"]).next("email").put(decodeToken["email"]).out())
        })
    } else return null
}
/**
 * 로그인 또는 계정 생성
 */
async function signUp(token: string, name: string, signedMethod: string) {
    Logger.passApp("signUp").next("name").put(name).next("signedMethod").put(signedMethod).out()
    const decodedToken = await decodeToken(token, signedMethod)
    if (decodedToken) {
        return new Promise((resolve, reject) => {
            DB.Manager.findOne(User, { where: { uid: decodedToken["uid"], email: decodedToken["email"] } }).then((user) => {
                if (!user) {
                    const userId = v4();
                    Logger.passApp("signUp").put("userId generated").put(userId).next("name").put(name).next("signedMethod").put(signedMethod).out()
                    DB.Manager.save(User, { name, uid: decodedToken["uid"], email: decodedToken["email"], userId: userId }).then((res) => {
                        Logger.passApp("signUp").put("user saved").next("userId").put(String(userId)).next("name").put(name).out()
                        resolve({ signed: true, name: res.name, userKey: res.key, userId: res.userId })
                        return
                    }).catch((err) => Logger.errorApp(ErrorCode.user_save_failed).put("signUp").put(err).next("uid").put(decodedToken["uid"]).next("email").put(decodeToken["email"]).out())
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
        Logger.enterApi("signIn").next("signedMethod").put(signedMethod).out()
        if (result) {
            if (result.signed) {
                const token = makeAccessToken(result.userKey, result.userId)
                await makeRefreshToken(result.userKey)
                res.json({ signed: true, name: result.name, image: result.image, userId: result.userId, token })
            } else if (result.needSignUp) {
                res.json({ needSignUp: true })
            } else res.json({ signed: false })
        } else res.json({ signed: false })
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiSignIn").put(err).next("signedMethod").put(String(req.body.m)).out()
    }
}

exports.apiSignUp = async (req, res, next) => {
    try {
        const token = String(req.body.t)
        const name = String(req.body.n)
        const signedMethod = String(req.body.m)
        Logger.enterApi("apiSignUp").next("signedMethod").put(signedMethod).next("name").put(name).out()
        if (name.length < 2) return
        const result: any = await signUp(token, name, signedMethod)
        if (result.signed) {
            const token = makeAccessToken(result.userKey, result.useId)
            await makeRefreshToken(result.userKey)
            res.json({ signed: true, name: result.name, image: result.image, userId: result.userId, token })
        } else if (result.already_exists) {
            res.json({ signed: false, already_exists: true })
        } else res.json({ signed: false })
    } catch (err) {
        Logger.errorApp(ErrorCode.api_failed).put("apiSignUp").put(err).next("signedMethod").put(String(req.body.m)).next("name").put(String(req.body.n)).out()
    }
}