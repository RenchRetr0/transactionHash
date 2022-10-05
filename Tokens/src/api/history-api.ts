import sequelize from "../database/sequelize";
import CustomError from "../CustomError";
import User from "../database/models/User";
import { Op, Sequelize } from "sequelize";
import HistoryTokens from "../database/models/HistoryTokens";
import Contract from "../database/models/Contract";
import Status from "../database/models/Status";
import { HTTPStatus } from "../utils";
import Role from "../database/models/Role";

export default class HistroryApi {
    sequelize: Sequelize;

    constructor() {
        this.sequelize = sequelize;
    }

    public static async GetHistorys() : Promise<HistoryTokens[]> {
        const historysFound = await HistoryTokens.findAll({
            include: [
                {
                    model: Contract,
                    include: [
                        {
                            model: User,
                            attributes: {
                                exclude: ["id", "password", "roleId", "createdAt", "updatedAt", "deletedAt"],
                            },
                        },
                    ],
                    attributes: {
                        exclude: ["id", "ownerId"],
                    },
                },
                {
                    model: Status,
                    as: 'status_from_id',
                    association: 'status_from',
                    attributes: {
                        exclude: ["id"],
                    },
                },
                {
                    model: Status,
                    as: 'status_to_id',
                    association: 'status_to',
                    attributes: {
                        exclude: ["id"],
                    },
                },
                {
                    model: User,
                    as: 'toId',
                    association: 'to',
                    attributes: ['login', 'address'],
                    include: [
                        {
                            model: Role,
                            attributes: ['role'],
                        },
                    ],
                },
                {
                    model: User,
                    as: 'fromId',
                    association: 'from',
                    attributes: ['login', 'address'],
                    include: [
                        {
                            model: Role,
                            attributes: ['role'],
                        },
                    ],
                },
            ],
            attributes: {
                exclude: ["id", "smartId", "status_from_id", "status_to_id", "toId", "fromId"],
            },
        });

        return historysFound;
    }

    public static async GetHistory(userAddress: string) : Promise<HistoryTokens[]> {

        const userFound = await this.GetUser(userAddress);

        if(!userFound) {
            throw new CustomError({
                status: HTTPStatus.NOT_FOUND,
                message: "Address not found.",
            });
        }

        const historFound = await this.GetHistoryAt(userFound.id);

        if(!historFound) {
            throw new CustomError({
                status: HTTPStatus.NOT_FOUND,
                message: "Address not found.",
            });
        }

        return historFound;
    }
    private static async GetUser(address: string) : Promise<User> {
        const userFound = await User.findOne({
            where: {
                address: address,
            },
        });

        return userFound;
    }

    private static async GetHistoryAt(userId: number) : Promise<HistoryTokens[]> {
        const historFound = await HistoryTokens.findAll({
            where: {
                [Op.or]: [
                    {
                        toId: userId,
                    },
                    {
                        fromId: userId 
                    }
                ],
            },
            include: [
                {
                    model: Contract,
                    include: [
                        {
                            model: User,
                            attributes: {
                                exclude: ["id", "password", "roleId", "createdAt", "updatedAt", "deletedAt"],
                            },
                        },
                    ],
                    attributes: {
                        exclude: ["id", "ownerId"],
                    },
                },
                {
                    model: Status,
                    as: 'status_from_id',
                    association: 'status_from',
                    attributes: {
                        exclude: ["id"],
                    },
                },
                {
                    model: Status,
                    as: 'status_to_id',
                    association: 'status_to',
                    attributes: {
                        exclude: ["id"],
                    },
                },
                {
                    model: User,
                    as: 'toId',
                    association: 'to',
                    attributes: ['login', 'address'],
                    include: [
                        {
                            model: Role,
                            attributes: ['role'],
                        },
                    ],
                },
                {
                    model: User,
                    as: 'fromId',
                    association: 'from',
                    attributes: ['login', 'address'],
                    include: [
                        {
                            model: Role,
                            attributes: ['role'],
                        },
                    ],
                },
            ],
            attributes: {
                exclude: ["id", "smartId", "status_from_id", "status_to_id", "toId", "fromId"],
            },
        });

        return historFound;
    }
}