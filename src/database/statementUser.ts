import DB from "database/connection"
import { ErrorCode } from "common/applicationCode"
import User from "model/user"
import { Logger } from "util/logger"
import { SETTINGS } from "util/setting"
import admin from 'firebase-admin'
import { OAuth2Client } from 'google-auth-library';
import { getAuth } from "firebase-admin/auth"
var serviceAccount = require("../../firebase-service-account.json")

const MAX_FRIENDS = SETTINGS.follow.limit
const MAX_BLOCKS = SETTINGS.block.limit
const MAX_FOLLOW_RECOMM = SETTINGS.follow.recommendLen
const MAX_FOLLOW_LEN = SETTINGS.follow.followLen

admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
})
const client = new OAuth2Client();
/**
 * 친구 관련 트랜잭션 함수를 가진 클래스.
 */
export class StatementUser {
      public static getUser(userKey: number): Promise<{ name: string, image: string }> {
            return new Promise((resolve, reject) => {
                  DB.Manager.findOne(User, {
                        where: { key: userKey },
                        select: ["image", "name"]
                  }).then((user) => {
                        if (user) {
                              Logger.passApp("getUser").out()
                              resolve({ image: user.image, name: user.name })
                        } else Logger.errorApp(ErrorCode.user_find_failed).put("getUser0").out()
                  }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("getUser1").put(err).out())
            })
      }
      /**
       * 팔로우 또는 언팔로우.
       * @param targetKey 대상 사용자 식별자.
       * @param userKey 친구를 추가하려는 사용자 식별자.
       */
      public static follow(targetKey: number, userKey: number) {
            return new Promise((resolve, reject) => {
                  DB.Manager.findOne(User, {
                        where: { key: userKey },
                        select: ["key"],
                        relations: ["followings"],
                  }).then((user) => {
                        if (user) {
                              const userKey = user.key
                              const numFriends = user.followings.length
                              if (targetKey === userKey) {
                                    Logger.errorApp(ErrorCode.follow_self).put("follow").out()
                                    return
                              }
                              if (numFriends > MAX_FRIENDS) {
                                    Logger.errorApp(ErrorCode.max_friends).put("follow").out()
                                    return
                              }
                              if (user.followings.some((f) => f.key === targetKey)) {
                                    DB.Manager.query(`delete from \`user_followings_user\` where followerKey = ${userKey} and followedKey = ${targetKey}`).then(() => {
                                          Logger.passApp("follow").out()
                                          resolve({ followed: false })
                                    }).catch((err) => { Logger.errorApp(ErrorCode.unfollow_failed).put("follow").put(err).out() })
                              } else {
                                    DB.Manager.query(`insert into \`user_followings_user\`(followerKey, followedKey) value(${userKey}, ${targetKey})`).then(() => {
                                          Logger.passApp("follow").out()
                                          resolve({ followed: true })
                                    }).catch((err) => { Logger.errorApp(ErrorCode.follow_failed).put("follow").put(err).out() })
                              }
                        } else Logger.errorApp(ErrorCode.user_unfound).put("follow_0").out()
                  }).catch((err) => { Logger.errorApp(ErrorCode.user_unfound).put("follow_1").put(err).out() })
            })
      }

      /**
       * follow 찾기 (태그 사용 순으로 배열)
       * @param userKey 
       * @param tag 
       * @param startId 
       * @returns 
       */
      public static getFollow(userKey: number, tag: string | null, startId: number, zeroTagUse: boolean) {
            return new Promise((resolve, reject) => {
                  if (zeroTagUse) {
                        DB.Manager.query(`select followedKey, (select name from brownie.user where user.key = followedKey) name, (select image from brownie.user where user.key = followedKey) image from brownie.user_followings_user where followerKey = ${userKey} and followedKey > ${startId} and followedKey not in (select usertagcount.userKey from brownie.usertagcount where usertagcount.userKey = followedKey) order by followedKey desc limit ${MAX_FOLLOW_LEN};
                                    `).then((usersO) => {
                              const users = usersO.map((us) => ({ key: us.userKey, name: us.name, image: us.image }))
                              if (users.length === 0) {
                                    resolve({ users, end: true, endId: 0, zero: true })
                              } else {
                                    const endId = users[users.length - 1].key
                                    if (users.length < MAX_FOLLOW_LEN) {
                                          resolve({ users, end: true, endId: 0, zero: true })
                                    } else resolve({ users, end: false, endId, zero: true })
                              }
                              Logger.passApp("getFollow").out()
                              return
                        }).catch((err) => Logger.errorApp(ErrorCode.follow_find_failed).put("getFollow_0").put(err).out())
                  } else {
                        DB.Manager.query(`select userKey, (select name from brownie.user where user.key = userKey) name, (select image from brownie.user where user.key = userKey) image, count(*) as cnt from (select followedKey from brownie.user_followings_user where followerKey = ${userKey}) followed left join brownie.usertagcount usertagcount on usertagcount.userKey = followed.followedKey where userKey > 0 group by userKey order by cnt desc limit ${MAX_FOLLOW_LEN};
                        `).then((usersO) => {
                              const users = usersO.map((us) => ({ key: us.userKey, name: us.name, image: us.image }))
                              if (users.length === 0) {
                                    resolve({ users, end: true, endId: 0, zero: true })
                              } else {
                                    const endId = users[users.length - 1].key
                                    if (users.length < MAX_FOLLOW_LEN) {
                                          DB.Manager.query(`select followedKey, (select name from brownie.user where user.key = followedKey) name, (select image from brownie.user where user.key = followedKey) image from brownie.user_followings_user where followerKey = ${userKey} and followedKey > ${startId} and followedKey not in (select usertagcount.userKey from brownie.usertagcount where usertagcount.userKey = followedKey) order by followedKey desc limit ${MAX_FOLLOW_LEN};
                                                      `).then((usersO_) => {
                                                const users_ = usersO_.map((us) => ({ key: us.userKey, name: us.name, image: us.image }))
                                                if (users_.length === 0) {
                                                      resolve({ users: [...users, ...users_], end: true, endId: 0, zero: true })
                                                } else {
                                                      const endId = users_[users_.length - 1].key
                                                      if (users_.length < MAX_FOLLOW_LEN) {
                                                            resolve({ users: [...users, ...users_], end: true, endId: 0, zero: true })
                                                      } else resolve({ users: [...users, ...users_], end: false, endId, zero: true })
                                                }
                                                Logger.passApp("getFollow").out()
                                                return
                                          }).catch((err) => Logger.errorApp(ErrorCode.follow_find_failed).put("getFollow_2").put(err).out())
                                    } else resolve({ users, end: false, endId })
                              }
                        }).catch((err) => Logger.errorApp(ErrorCode.follow_find_failed).put("getFollow_3").put(err).out())
                  }
            })
      }

      /**
       * follow 추천 (태그(url, hostname 포함)에 가장 많이 사용한 유저)
       * @param userKey 
       * @param tag 
       * @returns 
       */
      public static getFollowRecommend(userKey: number, tag: string | null) {
            return new Promise((resolve, reject) => {
                  DB.Manager.query(`select userKey, (select name from brownie.user where user.key = userKey) name, (select image from brownie.user where user.key = userKey) image, count(*) as cnt from brownie.usertagcount group by userKey order by cnt desc limit ${MAX_FOLLOW_RECOMM};`).then((usersO) => {
                        const users = usersO.map((us) => ({ key: us.userKey, name: us.name, image: us.image }))
                        Logger.passApp("getFollowRecommend").out()
                        resolve(users)
                        return
                  }).catch((err) => Logger.errorApp(ErrorCode.follow_recommend_find_failed).put("getFollowRecommend_1").put(err).out())
            })
      }

      /**
       * 밴 추가.
       * @param targetName 대상 사용자 식별자.
       * @param userName 친구를 추가하려는 사용자 식별자.
       */
      public static blockAdd(targetName: string, userName: string) {
            return new Promise((resolve, reject) => {
                  const target = DB.Manager.findOne(User, {
                        where: { name: targetName },
                        select: ["key"]
                  })
                  const user = DB.Manager.findOne(User, {
                        where: { name: userName },
                        select: ["key"],
                        relations: ["blockeds"],
                  })
                  Promise.all([target, user]).then(([target, user]) => {
                        if (target && user) {
                              const targetKey = target.key
                              const userKey = user.key
                              const numBlocks = user.blockeds.length
                              if (user.blockeds.some((u) => u.key === targetKey)) Logger.errorApp(ErrorCode.block_already).put("blockAdd").out()
                              if (targetKey === userKey) Logger.errorApp(ErrorCode.block_self).put("blockAdd").out()
                              if (numBlocks > MAX_BLOCKS) Logger.errorApp(ErrorCode.max_blocks).put("blockAdd").out()
                              else DB.Manager.query(`insert into \`user_blockeds_user\`(blockersKey, blockedsKey) value(${userKey}, ${targetKey})`)
                                    .then(() => {
                                          Logger.passApp("blockAdd").out()
                                          resolve(true)
                                    }).catch((err) => {
                                          Logger.errorApp(ErrorCode.block_add_failed).put("blockAdd_0").put(err).out()
                                    })
                        }
                  }).catch((err) => {
                        Logger.errorApp(ErrorCode.block_add_failed).put("blockAdd_1").put(err).out()
                  })
                  reject()
            })
      }

      /**
       * 밴 제거.
       * @param targetName 대상 사용자 식별자.
       * @param userName 친구를 삭제하려는 사용자 식별자.
       */
      public static blockDelete(targetName: string, userName: string) {
            return new Promise((resolve, reject) => {
                  /** 대상 사용자 키. */
                  const targetKey = new Promise((res, _) => {
                        DB.Manager.findOne(User, {
                              where: { name: targetName },
                              select: ["key"],
                        }).then((u) => {
                              if (u) res(u.key)
                              else Logger.errorApp(ErrorCode.user_unfound).put("boardSelect_0").out()
                        })
                  })
                  /** 친구를 삭제하려는 사용자 키 */
                  const userKey = new Promise((res, _) => {
                        DB.Manager.findOne(User, {
                              where: { name: userName },
                              select: ["key"],
                        }).then((u) => {
                              if (u) res(u.key)
                              else Logger.errorApp(ErrorCode.user_unfound).put("boardSelect_1").out()
                        })
                  })
                  Promise.all([targetKey, userKey]).then((v) => {
                        DB.Manager.query(`delete from \`user_blockeds_user\` where blockersKey = ${v[1]} and blockedsKey = ${v[0]}`)
                              .then((res) => {
                                    Logger.passApp("blockDelete").out()
                                    resolve(true)
                              }).catch((err) => {
                                    Logger.errorApp(ErrorCode.block_delete_failed).put("blockDelete_0").put(err).out()
                              })
                  }).catch((err) => {
                        Logger.errorApp(ErrorCode.block_delete_failed).put("blockDelete_1").put(err).out()
                  })
                  reject()
            })
      }

      public static decodeToken(idToken: string, signedMethod: string) {
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
      public static async signIn(token: string, signedMethod: string) {
            console.log("1")
            const decodedToken = await StatementUser.decodeToken(token, signedMethod)
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
      public static async signUp(token: string, name: string, signedMethod: string) {
            const decodedToken = await StatementUser.decodeToken(token, signedMethod)
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
      /**
       * 로그인 또는 계정 생성
       * @param userKey 
       * @param name
       */
      public static async changeName(userKey: number, name: string) {
            return new Promise((resolve, reject) => {
                  DB.Manager.save(User, { userKey, name }).then((res) => {
                        Logger.passApp("change Name").put("complete").out()
                        resolve(true)
                        return
                  }).catch((err) => Logger.errorApp(ErrorCode.user_save_failed).put("changeName").put(err).out())
            })
      }
}