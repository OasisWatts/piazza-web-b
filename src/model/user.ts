import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable } from "typeorm"
import Board from "./board"
import Comment from "./comment"
import Url from "./url"
import UserHashTag from "./userHashTag"

@Entity({ name: "user", schema: "brownie" })
export default class User {
      @PrimaryGeneratedColumn("increment")
      public key!: number

      /** 아이디 */
      @Column({ type: "varchar" })
      public uid!: string

      /** 아이디 */
      @Column({ type: "varchar" })
      public name!: string

      /** 이메일 */
      @Column({ type: "varchar", nullable: true })
      public email!: string

      /** 이미지 */
      @Column({ type: "varchar", nullable: true })
      public image!: string

      /** 개인정보처리방침 및 이용약관 동의 여부 */
      @Column({ type: "boolean", default: true })
      public agree!: boolean

      /** 최근 로그인 날짜. */
      @CreateDateColumn({ name: "recent-login-date"/* , transformer: Transformer.Date */ })
      public recentLoginDate!: Date

      /** 생성 날짜. */
      @CreateDateColumn({ name: "create-date"/* , transformer: Transformer.Date */ })
      public createDate!: Date

      /** 탈퇴 날짜. */
      @Column({ type: "timestamp", nullable: true, name: "withdraw-date" })
      public withdrawDate!: Date

      /** 좋아한 글과 관계 설정. */
      @ManyToMany(
            () => Url,
            (reactedUrls) => reactedUrls.reactedUsers,
      )
      @JoinTable()
      public reactedUrls!: Url[]

      /** 업한 글과 관계 설정. */
      @ManyToMany(
            () => Board,
            (upedBoards) => upedBoards.upedUsers,
      )
      @JoinTable()
      public upedBoards!: Board[]

      /** 다운한 글과 관계 설정. */
      @ManyToMany(
            () => Board,
            (downedBoards) => downedBoards.downedUsers,
      )
      @JoinTable()
      public downedBoards!: Board[]

      /** 업한 댓글과 관계 설정. */
      @ManyToMany(
            () => Comment,
            (upedComments) => upedComments.upedUsers,
      )
      @JoinTable()
      public upedComments!: Comment[]

      /** 다운한 댓글과 관계 설정. */
      @ManyToMany(
            () => Comment,
            (downedComments) => downedComments.downedUsers,
      )
      @JoinTable()
      public downedComments!: Comment[]

      /** 사용한 해시 태그. */
      @ManyToMany(
            () => UserHashTag,
            (usedHashTags) => usedHashTags.user,
      )
      @JoinTable()
      public usedHashTags!: UserHashTag[]

      /** 팔로윙하고 있는 유저 관계 설정. */
      @ManyToMany(
            () => User,
            (followings) => followings.followers,
      )
      @JoinTable({
            joinColumn: {
                  name: "followerKey",
                  referencedColumnName: "key",
            },
            inverseJoinColumn: {
                  name: "followedKey",
                  referencedColumnName: "key",
            },
      })
      public followings!: User[]

      /** 자신을 팔로잉하는 유저 관계 설정. */
      @ManyToMany(
            () => User,
            (followers) => followers.followings,
            { onDelete: "CASCADE" } // followee가 삭제되면 항목이 삭제.
      )
      public followers!: User[]

      @ManyToMany(
            () => User,
            (blockeds) => blockeds.blockers,
      )
      @JoinTable({
            joinColumn: {
                  name: "blockersKey",
                  referencedColumnName: "key",
            },
            inverseJoinColumn: {
                  name: "blockedsKey",
                  referencedColumnName: "key",
            },
      })
      public blockeds!: User[]

      @ManyToMany(
            () => User,
            (blockers) => blockers.blockeds,
            { onDelete: "CASCADE" } // blocked 삭제되면 항목이 삭제.
      )
      public blockers!: User[]
}
