import Board from "./board"
import { CreateDateColumn, JoinColumn } from "typeorm"
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

      /** 좋아요한 유저와의 관계 설정. */
      @ManyToMany(
            () => User,
            (reactedUsers) => reactedUsers.reactedComments,
            { nullable: true },
      )
      public reactedUsers!: User[]

      @Column({ type: "int", unsigned: true, default: 0 })
      public reactNum!: number
}
