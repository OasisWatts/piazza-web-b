import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import User from "./user"
import HashTag from "./hashTag"

@Entity({ name: "userHashTag", schema: "brownie" })
export default class UserHashTag {
      @PrimaryGeneratedColumn("increment")
      public id!: number

      @Column({ type: "int", default: 1, unsigned: true })
      public count!: number

      /** 해시 태그를 사용한 사용자. */
      @ManyToOne(
            () => User,
            (user) => user.usedHashTags,
            { nullable: true, onDelete: "CASCADE" }
      )
      public user!: User

      @ManyToOne(
            () => HashTag,
            (hashTag) => hashTag.userHashTags,
            { nullable: true, onDelete: "CASCADE" }
      )
      public hashTag: HashTag
}
