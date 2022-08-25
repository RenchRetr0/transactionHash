import sequelize from "../database/sequelize";
import CustomError from "../CustomError";
import User from "../database/models/User";
import hre, { network } from "hardhat";
const ether = hre.ethers;
import { Op, Sequelize } from "sequelize";
import HistoryTokens from "../database/models/HistoryTokens";
import Contract from "../database/models/Contract";
import Status from "../database/models/Status";
import Role from "../database/models/Role";
import TransApi from "./trans-api";
import { ethers, providers } from "ethers";

export default class SearchApi {
    sequelize: Sequelize;

    constructor() {
        this.sequelize = sequelize;
    }

    public static async GetHistorys(options: { token: any }) : Promise<any> {
        try {

            const { token } = options;

            if(!token) {
                throw new CustomError({
                    status: 400,
                    message: "User not authorized",
                });
            };

            if(token.verify.user.roleId == 3) {
                throw new CustomError({
                    status: 400,
                    message: "Access restricted.",
                });
            }

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

    public static async GetHistory(options: {token: any, address: string}) : Promise<any> {
        try {

            const { token, address } = options;

            if (!token || !address)  {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }

            if(token.verify.user.roleId == 3) {
                throw new CustomError({
                    status: 400,
                    message: "Access restricted.",
                });
            }

            const userId = await this.GetUser(address);
            const historFound = await this.AddresUser(userId);

            return {
                status: 201,
                historFound
            };

        }
        catch(e) {
            throw e;
        }
    }

    public static async GetHash(options: {token: any, hash: string}) : Promise<any> {
        try {
            const { token, hash } = options;

            if (!token || !hash)  {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }

            if(token.verify.user.roleId == 3) {
                throw new CustomError({
                    status: 400,
                    message: "Access restricted.",
                });
            }

            const t: any = network.provider;

            const provider = new ethers.providers.Web3Provider(t)

            const receipt = await provider.getTransactionReceipt(hash);
            
            return {
                status: 201,
                receipt
            }
        }
        catch(e) {
            throw e;
        }
    }

    private static async GetUser(address: string) : Promise<number> {
        const userFound = await User.findOne({
            where: {
                address: address,
            },
        });
        const userId = userFound.id;
        return userId;
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