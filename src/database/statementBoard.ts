import DB from "database/connection"
import Board from "model/board"
import Comment from "model/comment"
import User from "model/user"
import { SETTINGS } from "util/setting"
import { reduceToTable } from "util/utility"
import { Logger } from "util/logger"
import { ErrorCode, BOARD_CATEGORY } from "common/applicationCode"
import Url from "model/url"


const MAX_CONTENTS_LEN = 100 // SETTINGS.board.contentsLen
const MAX_LIST_LEN = SETTINGS.board.listLen

/**
 * 커뮤니티 관련 트랜잭션 함수를 가진 클래스.
 */
export class StatementBoard {
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getMyBoards(startId: number, userKey: number): Promise<any[]> {
            let whereQuery: string = `where writer = ${userKey} ${startId ? `and id < ${startId}` : ""}`
            let fromQuery: string = "from `board`"
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
            let selectAndQuery = ""

            const bList = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                              from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                              ) b join \`board\` a on b.id = a.id;`
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getMyBoards").put(err).out())
            return bList
      }
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getMyUpBoards(startId: number, userKey: number): Promise<any[]> {
            let whereQuery: string = ""
            let fromQuery: string = `from (
                  select boardId from \`user_reacted_boards_board\`
                  where userKey = ${userKey}${startId ? ` and boardId < ${startId}` : ""}
                  order by boardId desc limit ${MAX_LIST_LEN}) c join \`board\` d on d.id = c.boardId`
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
            let selectAndQuery = ""

            const bList = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                              from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                              ) b join \`board\` a on b.id = a.id;`
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getMyUpBoards").put(err).out())
            // bList.forEach((b, idx) => { bList[idx].reacted = 1 })
            return bList
      }
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getUrlBoards(startId: number, userKey: number, blockeds: number[], url: number): Promise<any[]> {
            let selectAndQuery = `, (select count(*) from \`user_reacted_boards_board\` where userKey = ${userKey} and boardId = a.id) as reacted`
            let fromQuery: string = "from \`board\`"
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`

            const urlObj = await DB.Manager.findOne(Url, { where: { id: url }, select: ["id"] }).catch((err) => Logger.errorApp(ErrorCode.url_find_failed).put("getUrlBoards").put(err).out())
            if (urlObj) {
                  let whereQuery = `where urlId = ${urlObj.id} ${startId ? ` and id < ${startId}` : ""}`
                  const bList = await DB.Manager.query(
                        `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                                    from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                                    ) b join \`board\` a on b.id = a.id;`
                  ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getUrlBoards").put(err).out())
                  let bListFiltered = bList.filter((b: any) => !blockeds.includes(b.writer))
                  return bListFiltered.sort((b1, b2) => b2.reactNum - b1.reactNum)
            } else return []
      }
      /** 전체 항목에서 보여줄 게시글 가져오기. (게시글을 넉넉히 뽑은뒤, up이 높은 것을 보여줌 - 모든 게시글을 다 보여줄 필요 없음 ) */
      private static async getFeeds(startId: number, userKey: number, blockeds: number[]): Promise<any[]> {
            let whereQuery: string = startId ? `where id < ${startId}` : ""
            let fromQuery: string = "from \`board\`"
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
            let selectAndQuery = `, (select count(*) from \`user_reacted_boards_board\` where userKey = ${userKey} and boardId = a.id) as reacted`
            const bList = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                              from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                              ) b join \`board\` a on b.id = a.id;`,
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getBoards").put(err).out())  // 차단 대상 제외.
            let bListFiltered = bList.filter((b: any) => !blockeds.includes(b.writer))
            return bListFiltered.sort((b1, b2) => b2.reactNum - b1.reactNum)
      }
      private static async getSearchBoards(startId: number, userKey: number, blockeds: number[], search: string): Promise<any[]> {
            let whereQuery: string = (startId ? `where id < ${startId} and ` : "where ") + `contents like \"%${search}%\"`
            let fromQuery: string = "from \`board\`"
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
            let selectAndQuery = `, (select count(*) from \`user_reacted_boards_board\` where userKey = ${userKey} and boardId = a.id) as reacted`

            const bList = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                                    from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                                    ) b join \`board\` a on b.id = a.id;`,
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getSearchBoards").put(err).out())  // 차단 대상 제외.
            let bListFiltered = bList.filter((b: any) => !blockeds.includes(b.writer))
            return bListFiltered.sort((b1, b2) => b2.reactNum - b1.reactNum)
      }
      private static async getUserBoards(startId: number, userKey: number, searchUser: number): Promise<any[]> {
            let whereQuery: string = (startId ? `where id < ${startId} and ` : "where ") + `writer = ${searchUser}`
            let fromQuery: string = "from \`board\`"
            let orderQuery = `order by id desc limit ${MAX_LIST_LEN}`
            let selectAndQuery = `, (select count(*) from \`user_reacted_boards_board\` where userKey = ${userKey} and boardId = a.id) as reacted`
            const bList = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = a.id) as comNum ${selectAndQuery}
                                    from ( select id ${fromQuery} ${whereQuery} ${orderQuery}
                                    ) b join \`board\` a on b.id = a.id;`,
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getUserBoards").put(err).out())  // 차단 대상 제외.
            console.log("bList", bList)
            return bList.sort((b1, b2) => b2.reactNum - b1.reactNum)
      }
      /** 차단한 상대가 쓴 것이 아닌 게시글 가져오기. */
      private static async getBoard(boardId: number, userKey: number): Promise<any> {
            let whereQuery: string = `where id = ${boardId}`
            let fromQuery: string = "from `board`"
            let selectAndQuery = `, (select count(*) from \`user_reacted_boards_board\` where userKey = ${userKey} and boardId = ${boardId}) as reacted`

            const boards = await DB.Manager.query(
                  `select *, (select count(id) from \`comment\` where boardId = ${boardId}) as comNum ${selectAndQuery}
                              ${fromQuery} ${whereQuery};`,
            ).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("getBoard_0").put(err).out())  // 차단 대상 제외.
            return boards[0]
      }

      public static async categorizedBoardList(startId: number, categ: number, userKey: number, urlid?: number, search?: string, searchUser?: number) {
            const user = await DB.Manager.findOne(User, { relations: ["blockeds"], where: { key: userKey } }).catch((err) => {
                  Logger.errorApp(ErrorCode.user_find_failed).put("categorizedBoardList_0").put(err).out()
            })
            if (user) {
                  switch (categ) {
                        case BOARD_CATEGORY.myBoards:
                              return await this.getMyBoards(startId, userKey)
                        case BOARD_CATEGORY.myUpBoards:
                              return await this.getMyUpBoards(startId, userKey)
                        case BOARD_CATEGORY.urlBoards:
                              if (urlid) return await this.getUrlBoards(startId, userKey, user.blockeds.map((b) => b.key), urlid)
                              else return null
                        case BOARD_CATEGORY.feed:
                              return await this.getFeeds(startId, userKey, user.blockeds.map((b) => b.key))
                        case BOARD_CATEGORY.searchBoards:
                              if (search) return await this.getSearchBoards(startId, userKey, user.blockeds.map((b) => b.key), search)
                              else return null
                        case BOARD_CATEGORY.userBoards:
                              if (searchUser) return await this.getUserBoards(startId, userKey, searchUser)
                              else return null
                        default: return null
                  }
            } else {
                  Logger.errorApp(ErrorCode.user_find_failed).put("categorizedBoardList_1").out()
                  return null
            }
      }
      /**
      * 게시글 목록 조회.
      * @param startId 게시글 시작 식별자.
      * @param categ 게시글 ui 버튼 enum.
      * @param userKey 사용자 식별자.
      * @returns 조회한 게시글 목록, 끝 식별자 또는 오류 전송.
      */
      public static async boardList(startId: number, categ: number, userKey: number, urlid?: number) {
            return new Promise(async (resolve, _) => {
                  const bList = await this.categorizedBoardList(startId, categ, userKey, urlid)
                  if (bList) {
                        const boardList: boardType[] = []
                        const where: { key: number }[] = []
                        let endOfList = false
                        if (bList.length === 0) {
                              resolve({ boardList: [], endId: startId, end: true })
                              return
                        } else if (bList.length < MAX_LIST_LEN) {
                              endOfList = true
                        }
                        let endId = bList[0].id
                        bList.forEach((b) => { if (endId > b.id) endId = b.id })
                        for (const item of bList) {
                              where.push({
                                    key: item.writer,
                              })
                        } // 게시물 글쓴이 정보 조회.
                        DB.Manager.find(User, {
                              where,
                              relations: ["followers"]
                        }).then((r) => {
                              const userTable = reduceToTable(r, (v) => v, (v) => v.key)
                              const setBoardPromises = [];
                              for (const item of bList) {
                                    const user_: any = userTable[item.writer]
                                    console.log("board url", item.urlId)
                                    if (user_ == null) continue
                                    if (item.urlId == null) {
                                          boardList.push({
                                                id: item.id,
                                                writer: user_.name,
                                                writerId: user_.key,
                                                writerImage: user_.image,
                                                writerFollowed: user_.followers.some((f: User) => f.key === userKey),
                                                contents: item.contents.slice(0, MAX_CONTENTS_LEN),
                                                numComment: item.comNum,
                                                date: String(item.date),
                                                reactNum: item.reactNum,
                                                reacted: item.reacted,
                                                updated: item.updated,
                                                isPublic: item.isPublic
                                          })
                                    } else {
                                          setBoardPromises.push(
                                                DB.Manager.findOne(Url, { where: { id: item.urlId } }).then((url_) => {
                                                      console.log("board url1", url_)
                                                      boardList.push({
                                                            id: item.id,
                                                            writer: user_.name,
                                                            writerId: user_.key,
                                                            writerImage: user_.image,
                                                            writerFollowed: user_.followers.some((f: User) => f.key === userKey),
                                                            contents: item.contents.slice(0, MAX_CONTENTS_LEN),
                                                            url: url_.url,
                                                            urlHostname: url_.hostname,
                                                            urlTitle: url_.title,
                                                            urlBoardNum: url_.boardNum,
                                                            urlReactNum: url_.reactNum,
                                                            numComment: item.comNum,
                                                            date: String(item.date),
                                                            reactNum: item.reactNum,
                                                            reacted: item.reacted,
                                                            updated: item.updated,
                                                            isPublic: item.isPublic
                                                      })
                                                }))
                                    }
                              }
                              Promise.all(setBoardPromises).then(() => {
                                    Logger.passApp("boardList").put(BOARD_CATEGORY[categ]).out()
                                    resolve({ boardList, endId, end: endOfList })
                              })
                        }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("boardList").put(err).out())
                  } else {
                        Logger.errorApp(ErrorCode.board_find_failed).put("boardList").out()
                  }
            })
      }

      /**
       * 게시글 조회.
       * @param boardId 게시글 식별자.
       * @param userKey 사용자 디비 식별자.
       * @returns 조회한 게시글 내용 및 댓글.
       */
      public static boardSelect(boardId: number, userKey: number): Promise<any> {
            return new Promise((resolve, _) => {
                  this.getBoard(boardId, userKey).then((board: any) => {
                        if (board) {
                              DB.Manager.findOne(User, {
                                    where: { key: board?.writer },
                                    relations: ["followers"]
                              }).then((user) => {
                                    DB.Manager.query(
                                          `select comment.id, comment.contents, comment.reactNum, comment.writer, comment.date
                        , (select count(*) from \`user_reacted_comments_comment\` where userKey = ${userKey} and commentId = comment.id) as reacted
                              from (
                                    select id
                                    from \`board\`
                                    where board.id = ${boardId}
                              ) board left join \`comment\` comment on board.id = comment.boardId order by comment.id desc limit ${MAX_LIST_LEN};`
                                    ).then((cList) => {
                                          const where: { key: number }[] = []
                                          if (cList[0]?.id === null) {
                                                resolve({
                                                      id: boardId,
                                                      writer: user?.name,
                                                      writerId: user?.key,
                                                      writerImage: user?.image,
                                                      writerFollowed: user?.followers.some((f: User) => f.key === userKey) || false,
                                                      date: String(board?.date),
                                                      updated: board?.updated,
                                                      reactNum: board?.reactNum,
                                                      numComment: board?.comNum,
                                                      reacted: board?.reacted,
                                                      contents: board?.contents.slice(0, MAX_CONTENTS_LEN),
                                                      comments: [],
                                                      endId: 0, // comment 관련
                                                      end: true,
                                                      tags: board?.tags,
                                                      url: board?.url
                                                })
                                                return
                                          }
                                          let endOfList = false
                                          let endId = cList[cList.length - 1].id
                                          if (cList.length < MAX_LIST_LEN) {
                                                endOfList = true
                                          }
                                          for (const c of cList) {
                                                where.push({
                                                      key: c.writer,
                                                })
                                          }
                                          DB.Manager.find(User, {
                                                where,
                                                relations: ["followers"]
                                          }).then((r) => {
                                                const userTable = reduceToTable(r, (v) => v, (v) => v.key)
                                                const comments: commentType[] = []
                                                for (const c of cList) {
                                                      const u = userTable[c.writer]
                                                      comments.push({
                                                            id: c.id,
                                                            date: c.date,
                                                            contents: c.contents.slice(0, MAX_CONTENTS_LEN),
                                                            reactNum: c.reactNum,
                                                            reacted: c.reacted,
                                                            updated: c.updated,
                                                            writer: u.name,
                                                            writerId: u.key,
                                                            writerImage: u.image,
                                                            writerFollowed: u.followers.some((f: User) => f.key === userKey),
                                                      })
                                                }
                                                resolve({
                                                      id: boardId,
                                                      writer: user?.name,
                                                      writerId: user?.key,
                                                      writerImage: user?.image,
                                                      writerFollowed: user?.followers.some((f: User) => f.key === userKey) || false,
                                                      date: board.date,
                                                      updated: board.updated,
                                                      reactNum: board.reactNum,
                                                      numComment: board.comNum,
                                                      reacted: board.reacted,
                                                      contents: board.contents.slice(0, MAX_CONTENTS_LEN),
                                                      comments,
                                                      endId,
                                                      end: endOfList,
                                                      tags: board.tags,
                                                      url: board.url
                                                })
                                          }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("boardSelect_0").put(err).out())
                                    }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("boardSelect_0").put(err).out())
                              }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("boardSelect_1").put(err).out())
                        } else Logger.errorApp(ErrorCode.board_find_failed).put("boardSelect_1").out()
                  }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("boardSelect_2").put(err).out())
            })
      }
      /**
       * 댓글 조회.
       * @param boardId 게시글 식별자.
       * @param userKey 사용자 디비 식별자.
       * @returns 조회한 게시글 내용 및 댓글.
       */
      public static commentList(boardId: number, commentStartId: number, userKey: number) {
            return new Promise((resolve, _) => {
                  DB.Manager.query(
                        `select comment.id, comment.contents, comment.reactNum, comment.writer
                              , (select count(*) from \`user_reacted_comments_comment\` where userKey = ${userKey} and commentId = comment.id) as reacted
                              from (
                                    select id
                                    from \`board\`
                                    where board.id = ${boardId}
                              ) board left join \`comment\` comment on board.id = comment.boardId where ${commentStartId ? `comment.id < ${commentStartId}` : ""} order by comment.id desc limit ${MAX_LIST_LEN};`,
                  ).then((cList) => {
                        const where: { key: number }[] = []
                        let endOfList = false
                        if (cList.length === 0) {
                              resolve({ comments: [], endId: commentStartId, end: true })
                              return
                        } else if (cList.length < MAX_LIST_LEN) {
                              endOfList = true
                        }
                        for (const c of cList) {
                              where.push({
                                    key: c.writer,
                              })
                        }
                        const endId = cList[cList.length - 1].id
                        DB.Manager.find(User, {
                              where,
                              relations: ["followers"]
                        }).then((r) => {
                              const userTable = reduceToTable(r, (v) => v, (v) => v.key)
                              const comments: commentType[] = []
                              for (const c of cList) {
                                    const u = userTable[c.writer]
                                    comments.push({
                                          id: c.id,
                                          date: c.date,
                                          contents: c.contents.slice(0, MAX_CONTENTS_LEN),
                                          reactNum: c.reactNum,
                                          reacted: c.reacted,
                                          updated: c.updated,
                                          writer: u.name,
                                          writerId: u.key,
                                          writerImage: u.image,
                                          writerFollowed: u.followers.some((f: User) => f.key === userKey)
                                    })
                              }
                              resolve({
                                    comments: (comments[0].id === null ? [] : comments),
                                    endId,
                                    end: endOfList
                              })
                        }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("commentList").put(err).out())
                  }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("commentList").put(err).out())
            })
      }
      /**
       * 게시글 생성.
       * @param writerKey 글쓴이 디비 식별자.
       * @param contents 게시글 내용.
       */
      public static async boardInsert(writerKey: number, contents: string, urlid_: number, title_: string, isPublic: boolean) {
            let url_set: Url
            console.log("bi", urlid_, title_)
            return new Promise(async (resolve, _) => {
                  if (urlid_) {
                        const url__ = await DB.Manager.findOne(Url, { where: { id: urlid_ } })
                        if (url__) {
                              url_set = url__
                              if (url__.title !== title_) DB.Manager.update(Url, { id: urlid_ }, { title: title_ })
                              DB.Manager.increment(Url, { id: urlid_ }, "boardNum", 1)
                        }
                        await DB.Manager.save(Board, { contents: contents.slice(0, MAX_CONTENTS_LEN), writer: writerKey, url: url_set, isPublic: isPublic })
                  } else {
                        await DB.Manager.save(Board, { contents: contents.slice(0, MAX_CONTENTS_LEN), writer: writerKey, isPublic: isPublic })
                  }
                  Logger.passApp("boardInserted").out()
                  resolve(true)
            })
      }

      /**
        * 게시글 업데이트.
        * @param boardId 게시글 식별자.
        * @param updaterKey 업데이트하려는 사용자 식별자.
        * @param contents 게시글 내용.
        */
      public static boardUpdate(boardId: number, updaterKey: number, contents: string) {
            return new Promise(async (resolve, _) => {
                  DB.Manager.findOne(Board, { where: { id: boardId, writer: updaterKey } }).then(async (board) => {
                        if (board) {
                              DB.Manager.save(Board, {
                                    id: boardId, writer: updaterKey,
                                    contents: contents.slice(0, MAX_CONTENTS_LEN),
                                    updated: true,
                              }).then(() => {
                                    Logger.passApp("boardUpdate").out()
                                    resolve(true)
                              }).catch((err) => Logger.errorApp(ErrorCode.board_update_failed).put("boardUpdate_1").put(err).out())
                        } else Logger.errorApp(ErrorCode.board_find_failed).put("boardUpdate_0").out()
                  }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("boardUpdate_1").put(err).out())
            })
      }

      /**
      * 게시글 삭제.
      * @param boardId 게시글 식별자.
      */
      public static boardDelete(boardId: number, userKey: number) {
            return new Promise((resolve, _) => {
                  DB.Manager.findOne(Board, { where: { id: boardId, writer: userKey } }).then((board) => {
                        if (board) {
                              DB.Manager.decrement(Url, { id: board.url }, "boardNum", 1)
                              DB.Manager.remove(Board, board).then(async () => {
                                    resolve(true)
                              }).catch((err) => Logger.errorApp(ErrorCode.block_delete_failed).put("boardDelete").put(err).out())
                        } else Logger.errorApp(ErrorCode.board_find_failed).put("boardDelete_0").out()
                  }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("boardDelete_1").put(err).out())
            })
      }

      /**
        * 게시글 업데이트.
        * @param boardId 게시글 식별자.
        * @param updaterKey 업데이트하려는 사용자 식별자.
        * @param contents 게시글 내용.
        */
      public static boardChangeType(boardId: number, userKey: number, toPublic: boolean) {
            console.log("boardChangeType", toPublic)
            return new Promise(async (resolve, _) => {
                  DB.Manager.findOne(Board, { where: { id: boardId, writer: userKey } }).then(async (board) => {
                        if (board) {
                              DB.Manager.save(Board, {
                                    id: boardId, writer: userKey,
                                    isPublic: toPublic
                              }).then(() => {
                                    Logger.passApp("boardChangeType").out()
                                    resolve(true)
                              }).catch((err) => Logger.errorApp(ErrorCode.board_update_failed).put("boardChangeType_1").put(err).out())
                        } else Logger.errorApp(ErrorCode.board_find_failed).put("boardChangeType_0").out()
                  }).catch((err) => Logger.errorApp(ErrorCode.board_find_failed).put("boardChangeType_1").put(err).out())
            })
      }
      /**
      * 게시글 좋아요.
      * @param boardId 게시글 식별자.
      * @param userKey 사용자 디비 식별자.
      */
      public static async boardReact(boardId: number, userKey: number, toCancel: boolean) {
            console.log("boardReact", toCancel)
            const board = await DB.Manager.findOne(Board, { where: { id: boardId }, select: ["writer"] })
            if (board?.writer === userKey) return null
            console.log("not same")
            const reacted = await DB.Manager.query(`select * from \`user_reacted_boards_board\` where userKey=${userKey} and boardId=${boardId}`)

            console.log(reacted, toCancel)
            if (reacted.length && toCancel) {
                  console.log("react to false")
                  await DB.Manager.query(`delete from \`user_reacted_boards_board\` where userKey=${userKey} and boardId=${boardId}`)
                  await DB.Manager.decrement(Board, { id: boardId }, "reactNum", 1)
                  return ({ reacted: false })
            } else if (!reacted.length && !toCancel) {
                  console.log("react to true")
                  await DB.Manager.query(`insert into \`user_reacted_boards_board\` (userKey, boardId) values (${userKey}, ${boardId})`)
                  await DB.Manager.increment(Board, { id: boardId }, "reactNum", 1)
                  return ({ reacted: true })
            } else return null
      }

      /**
      * 댓글 생성.
      * @param boardId 게시글 식별자.
      * @param contents 내용물.
      * @param writerKey 글쓴이 식별자.
      */
      public static commentInsert(boardId: number, writerKey: number, contents: string) {
            return new Promise((resolve, _) => {
                  DB.Manager.insert(Comment, {
                        writer: writerKey,
                        contents,
                        board: {
                              id: boardId,
                        },
                  }).then(() => {
                        Logger.passApp("commentInsert").out()
                        resolve(true)
                  }).catch((err) => Logger.errorApp(ErrorCode.comment_insert_failed).put("commentInsert").put(err).out())
            })
      }

      /**
      * 댓글 업데이트.
      * @param boardId 댓글 식별자.
      * @param updaterKey 업데이트하려는 사용자 식별자.
      * @param contents 내용물.
      */
      public static commentUpdate(boardId: number, updaterKey: number, contents: string) {
            return new Promise((resolve, _) => {
                  DB.Manager.update(Comment, { id: boardId, writer: updaterKey }, {
                        contents,
                        updated: true
                  }).then((r) => {
                        if (!r.affected) {
                              Logger.errorApp(ErrorCode.comment_update_bad_request).put("commentUpdate_0").out()
                        } else {
                              Logger.passApp("commentUpdate").out()
                              resolve(true)
                        }
                  }).catch((err) => Logger.errorApp(ErrorCode.comment_update_failed).put("commentUpdate_1").put(err).out())
            })
      }

      /**
       * 댓글 삭제.
       * @param commentId 댓글 식별자.
       */
      public static commentDelete(commentId: number, userKey: number) {
            return new Promise((resolve, _) => {
                  DB.Manager.findOne(User, { where: { key: userKey } }).then((user) => {
                        if (user) {
                              DB.Manager.delete(Comment, commentId).then(() => {
                                    Logger.passApp("commentDelete").out()
                                    resolve(true)
                              }).catch((err) => Logger.errorApp(ErrorCode.comment_delete_failed).put("commentDelete").put(err).out())
                        } else Logger.errorApp(ErrorCode.user_find_failed).put("commentDelete_0").out()
                  }).catch((err) => Logger.errorApp(ErrorCode.user_find_failed).put("commentDelete_1").put(err).out())
            })
      }

      /**
       * 댓글 좋아요.
       * @param commentId 댓글 식별자.
       * @param userKey 사용자 식별자.
       */
      public static async commentUp(commentId: number, userKey: number) {
            const board = await DB.Manager.findOne(Comment, { where: { id: commentId }, select: ["writer"] })
            if (board?.writer === userKey) return null
            const reacted = await DB.Manager.query(`select * from \`user_reacted_comments_comment\` where userKey=${userKey} and commentId=${commentId}`)
            if (reacted.length) {
                  await DB.Manager.query(`delete from \`user_reacted_comments_comment\` where userKey=${userKey} and commentId=${commentId}`)
                  await DB.Manager.decrement(Comment, { id: commentId }, "reactNum", 1)
                  return ({ reacted: false })
            } else {
                  await DB.Manager.query(`insert into \`user_reacted_comments_comment\` (userKey, commentId) values (${userKey}, ${commentId})`)
                  await DB.Manager.increment(Comment, { id: commentId }, "reactNum", 1)
                  return ({ reacted: false })
            }
            // return new Promise((resolve, _) => {
            //       DB.Manager.query(`select * from \`user_reacted_comments_comment\` where userKey=${userKey} and commentId=${commentId}`).then(async (reacted) => {
            //             if (reacted.length) {
            //                   DB.Manager.query(`delete from \`user_reacted_comments_comment\` where userKey=${userKey} and commentId=${commentId}`).then(() => {
            //                         DB.Manager.decrement(Comment, { id: commentId }, "reactNum", 1).then(() => {
            //                               Logger.passApp("commentUp").out()
            //                               resolve({ reacted: false })
            //                               return
            //                         }).catch((err) => Logger.errorApp(ErrorCode.comment_like_decrement).put(err).out())
            //                   }).catch((err) => Logger.errorApp(ErrorCode.comment_like_delete_failed).put(err).out())
            //             } else {
            //                   DB.Manager.query(`insert into \`user_reacted_comments_comment\` (userKey, commentId) values (${userKey}, ${commentId})`).then(() => {
            //                         DB.Manager.increment(Comment, { id: commentId }, "reactNum", 1).then(() => {
            //                               Logger.passApp("commentUp").out()
            //                               resolve({ reacted: true })
            //                               return
            //                         }).catch((err) => Logger.errorApp(ErrorCode.comment_like_increment).put(err).out())
            //                   }).catch((err) => Logger.errorApp(ErrorCode.comment_like_insert_failed).put(err).out())
            //             }
            //       }).catch((err) => Logger.errorApp(ErrorCode.comment_unfound).put(err).out())
            // })
      }
}