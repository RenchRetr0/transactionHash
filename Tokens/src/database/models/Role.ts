import {
    Table,
    Column,
    Model,
    PrimaryKey,
    AllowNull,
    HasOne,
} from "sequelize-typescript";
import { DataTypes } from "sequelize";
import User from "./User";

@Table({
    timestamps: false,
    freezeTableName: true,
    tableName: "role",
    underscored: true,
    modelName: "Role",
})
export default class Role extends Model {
    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataTypes.BIGINT,
        autoIncrement: true,
    })
    id: number;

    @AllowNull(true)
    @Column({
        type: DataTypes.STRING,
    })
    role: string;

    @HasOne(() => User)
    user: User;
}