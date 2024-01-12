import Comment from "./comment"
import Url from "./url"
import User from "./user"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, OneToMany, ManyToOne } from "typeorm"

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

      /** 좋아요한 유저와의 관계 설정. */
      @ManyToMany(
            () => User,
            (reactedUsers) => reactedUsers.reactedBoards,
            { nullable: true },
      )
      public reactedUsers!: User[]

      @Column({ type: "int", unsigned: true, default: 0 })
      public reactNum!: number

      /** url과 관계 설정. */
      @ManyToOne(
            () => Url,
            (url) => url.boards,
            { nullable: true }
      )
      public url!: Url
}
