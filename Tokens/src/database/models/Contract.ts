import {
    Table,
    Column,
    Model,
    PrimaryKey,
    AllowNull,
    Unique,
    ForeignKey,
    BelongsTo,
    BelongsToMany,
    HasMany,
    BeforeDestroy,
    Default,
    HasOne
} from "sequelize-typescript";
import { DataTypes } from "sequelize";
import User from "./User";

@Table({
    timestamps: true,
    freezeTableName: true,
    tableName: "contract",
    underscored: true,
    modelName: "Contract",
})
export default class Contract extends Model {
    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataTypes.BIGINT,
        autoIncrement: true,
    })
    id: number;

    @AllowNull(false)
    @Column({
        type: DataTypes.STRING,
    })
    smart: string;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
        type: DataTypes.BIGINT,
    })
    ownerId: number;

    @BelongsTo(() => User)
    public user: User;

    @AllowNull(false)
    @Column({
        type: DataTypes.STRING(256),
    })
    name: string;

    @AllowNull(false)
    @Column({
        type: DataTypes.STRING(256),
    })
    symbol: string;
}