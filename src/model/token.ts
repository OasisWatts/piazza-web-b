import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "refreshToken", schema: "brownie" })
export default class RefreshToken {
    @PrimaryGeneratedColumn("increment")
    public id!: number

    @Column({ type: "int" })
    public userKey!: number

    @Column({ type: "text" })
    public contents!: string
}
