import Board from "./board"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany } from "typeorm"
import User from "./user"

@Entity({ name: "url", schema: "brownie" })
export default class Url {
      @PrimaryGeneratedColumn("increment")
      public id!: number

      @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
      public date!: number

      @Column({ type: "text" })
      public url!: string

      @Column({ type: "text" })
      public hostname!: string

      @Column({ type: "text", default: null })
      public title!: string

      @Column({ type: "int", default: 0 })
      public boardNum!: number

      @Column({ type: "int", unsigned: true, default: 0 })
      public reactNum!: number

      /** 좋아요한 유저와의 관계 설정. */
      @ManyToMany(
            () => User,
            (reactedUsers) => reactedUsers.reactedUrls,
            { nullable: true },
      )
      public reactedUsers!: User[]

      /** 게시글과 관계 설정. */
      @OneToMany(
            () => Board,
            (boards) => boards.url,
            { nullable: true }
      )
      public boards!: Board[]
}
