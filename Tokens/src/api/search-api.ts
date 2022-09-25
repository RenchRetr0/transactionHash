import sequelize from "../database/sequelize";
import CustomError from "../CustomError";
import User from "../database/models/User";
import { network } from "hardhat";
import { Op, Sequelize } from "sequelize";
import HistoryTokens from "../database/models/HistoryTokens";
import Contract from "../database/models/Contract";
import Status from "../database/models/Status";
import Role from "../database/models/Role";
import { ethers, providers } from "ethers";

export default class SearchApi {
    sequelize: Sequelize;

    constructor() {
        this.sequelize = sequelize;
    }

    public static async GetHistorys() : Promise<any> {
        try {
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

            return {
                status: 201,
                historysFound
            };
        } 
        catch(e) {
            throw e;
        }
    }

    public static async GetHistory(options: {userAddress: string}) : Promise<any> {
        try {

            const { userAddress } = options;

            if (!userAddress)  {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }

            const userFound = await this.GetUser(userAddress);

            if(!userFound) {
                throw new CustomError({
                    status: 400,
                    message: "Address not found.",
                });
            }

            const historFound = await this.AddresUser(userFound.id);

            if(!historFound) {
                throw new CustomError({
                    status: 400,
                    message: "Address not found.",
                });
            }

            return {
                status: 201,
                historFound
            };

        }
        catch(e) {
            throw e;
        }
    }

    public static async GetTransactionReceipt(options: {hashTransaction: string}) : Promise<any> {
        try {
            const { hashTransaction } = options;

            if (!hashTransaction)  {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }

            const EthereumProvider: any = network.provider;
            const provider = new ethers.providers.Web3Provider(EthereumProvider)
            const TransactionReceipt = await provider.getTransactionReceipt(hashTransaction);

            if(!TransactionReceipt) {
                throw new CustomError({
                    status: 400,
                    message: "Transaction not found.",
                });
            }
            
            return {
                status: 201,
                TransactionReceipt
            }
        }
        catch(e) {
            throw e;
        }
    }

    private static async GetUser(address: string) : Promise<any> {
        const userFound = await User.findOne({
            where: {
                address: address,
            },
        });

        return userFound;
    }

    private static async AddresUser(userId: number) : Promise<any> {
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