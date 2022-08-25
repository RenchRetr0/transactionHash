import {
    Table,
    Column,
    Model,
    PrimaryKey,
    AllowNull,
    HasOne,
    HasMany,
} from "sequelize-typescript";
import { DataTypes } from "sequelize";
import HistoryTokens from "./HistoryTokens";

@Table({
    timestamps: false,
    freezeTableName: true,
    tableName: "status",
    underscored: true,
    modelName: "Status",
})
export default class Status extends Model {
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
    status: string;

    @HasMany(() => HistoryTokens, { as: 'status_from', foreignKey: 'status_from_id' })
    status_from: HistoryTokens[];

    @HasMany(() => HistoryTokens, { as: 'status_to', foreignKey: 'status_to_id' })
    status_to: HistoryTokens[];
}