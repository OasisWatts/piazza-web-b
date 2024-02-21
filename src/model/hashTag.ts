import UserHashTag from "./userHashTag"
import Board from "./board"
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from "typeorm"

@Entity({ name: "hashTag", schema: "brownie" })
export default class HashTag {
      @PrimaryGeneratedColumn("increment")
      public id!: number

      @Column({ type: "text" })
      public text!: string

      /** 해시 태그를 사용한 사용자. */
      @OneToMany(
            () => UserHashTag,
            (userHashTags) => userHashTags.hashTag,
            { nullable: true }
      )
      public userHashTags!: UserHashTag[]

      @ManyToMany(
            () => Board,
            (boards) => boards.hashTags,
            { nullable: true }
      )
      public boards: Board[]
}
