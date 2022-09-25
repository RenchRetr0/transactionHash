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
import {
    DataTypes,
    HasManyCountAssociationsMixin,
    HasManyGetAssociationsMixin,
    HasOneGetAssociationMixin,
} from "sequelize";
import User from "./User";
import Contract from "./Contract";
import Status from "./Status";

@Table({
    timestamps: true,
    freezeTableName: true,
    tableName: "history",
    underscored: true,
    modelName: "HistoryTokens",
    paranoid: true,
})
export default class HistoryTokens extends Model {
    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataTypes.BIGINT,
        autoIncrement: true,
    })
    id: number;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
        type: DataTypes.BIGINT,
    })
    fromId: number;

    @ForeignKey(() => User)
    @AllowNull(true)
    @Column({
        type: DataTypes.BIGINT,
    })
    toId: number;

    @BelongsTo(() => User, { as: 'to', foreignKey: 'toId' })
    public User_to: User;

    @BelongsTo(() => User, { as: 'from', foreignKey: 'fromId' })
    public User_from: User;

    @ForeignKey(() => Contract)
    @AllowNull(false)
    @Column({
        type: DataTypes.BIGINT,
    })
    smartId: number;

    @BelongsTo(() => Contract)
    public smart: Contract;

    @AllowNull(false)
    @Column({
        type: DataTypes.BIGINT,
    })
    value: number;

    @ForeignKey(() => Status)
    @AllowNull(false)
    @Column({
        type: DataTypes.BIGINT,
    })
    status_from_id: number;

    @BelongsTo(() => Status, { as: 'status_from', foreignKey: 'status_from_id' })
    public status_from: Status;

    @ForeignKey(() => Status)
    @AllowNull(false)
    @Column({
        type: DataTypes.BIGINT,
    })
    status_to_id: number;

    @BelongsTo(() => Status, { as: 'status_to', foreignKey: 'status_to_id' })
    public status_to: Status;

    @AllowNull(true)
    @Column({
        type: DataTypes.STRING(256),
    })
    blockHash_from: string;

    @AllowNull(true)
    @Column({
        type: DataTypes.STRING(256),
    })
    blockHash_to: string;
}