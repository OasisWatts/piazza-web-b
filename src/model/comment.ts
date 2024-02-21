import Board from "./board"
import { CreateDateColumn, JoinColumn, OneToMany } from "typeorm"
import User from "./user"
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from "typeorm"

@Entity({ name: "comment", schema: "brownie" })
export default class Comment {
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

      /** 게시글과 관계 설정. */
      @ManyToOne(
            () => Board,
            (board) => board.comments,
            { onDelete: "CASCADE" },
      ) @JoinColumn()
      public board!: Board

      /** 답글과의 관계 설정. */
      @OneToMany(
            () => Comment,
            (replies) => replies.replied,
            { nullable: true },
      )
      public replies!: Comment[]

      /** 답한 댓글과 관계 설정. */
      @ManyToOne(
            () => Comment,
            (replied) => replied.replies,
            { onDelete: "CASCADE" },
      ) @JoinColumn()
      public replied!: Comment

      @Column({ type: "int", unsigned: true, default: 0 })
      public replyNum!: number


      /** 업한 유저와의 관계 설정. */
      @ManyToMany(
            () => User,
            (upedUsers) => upedUsers.upedComments,
            { nullable: true },
      )
      public upedUsers!: User[]

      @Column({ type: "int", unsigned: true, default: 0 })
      public upNum!: number

      /** 다운한 유저와의 관계 설정. */
      @ManyToMany(
            () => User,
            (downedUsers) => downedUsers.downedComments,
            { nullable: true },
      )
      public downedUsers!: User[]

      @Column({ type: "int", unsigned: true, default: 0 })
      public downNum!: number
}
