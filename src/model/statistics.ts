import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "statistics", schema: "piazza" })
export default class Statistics {
      @PrimaryGeneratedColumn("increment")
      public id!: number

      @Column({ type: "text" })
      public category!: string

      @Column({ type: "int", default: 0 })
      public count!: number
}
