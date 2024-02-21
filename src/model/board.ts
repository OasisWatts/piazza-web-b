import Comment from "./comment"
import HashTag from "./hashTag"
import Url from "./url"
import User from "./user"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, OneToMany, ManyToOne, JoinTable } from "typeorm"

@Entity({ name: "board", schema: "brownie" })
export default class Board {
      @PrimaryGeneratedColumn("increment")
      public id!: number

      @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
      public date!: number

      @Column({ type: "int" })
      public writer!: number

      @Column({ type: "text" })
      public contents!: string

      @Column({ type: "boolean", default: false })
      public updated!: boolean

      @Column({ type: "boolean" })
      public isPublic!: boolean

      /** 댓글과의 관계 설정. */
      @OneToMany(
            () => Comment,
            (comments) => comments.board,
            { nullable: true },
      ) //@JoinColumn()
      public comments!: Comment[]

      @Column({ type: "int", unsigned: true, default: 0 })
      public commentNum!: number

      /** 업한 유저와의 관계 설정. */
      @ManyToMany(
            () => User,
            (upedUsers) => upedUsers.upedBoards,
            { nullable: true },
      )
      public upedUsers!: User[]

      @Column({ type: "int", unsigned: true, default: 0 })
      public upNum!: number

      /** 다운한 유저와의 관계 설정. */
      @ManyToMany(
            () => User,
            (downedUsers) => downedUsers.downedBoards,
            { nullable: true },
      )
      public downedUsers!: User[]

      @Column({ type: "int", unsigned: true, default: 0 })
      public downNum!: number

      /** url과 관계 설정. */
      @ManyToOne(
            () => Url,
            (url) => url.boards,
            { nullable: true }
      )
      public url!: Url

      @ManyToMany(
            () => HashTag,
            (hashTags) => hashTags.boards,
            { nullable: true }
      )
      @JoinTable()
      public hashTags!: HashTag[]
}
