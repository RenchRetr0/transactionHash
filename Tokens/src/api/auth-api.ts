import dotenv from "dotenv";
import CustomError from "../CustomError";
import User from "../database/models/User";
import jwt from "jsonwebtoken";
import { Op, Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../database/sequelize";
import Role from "../database/models/Role";
dotenv.config();

interface GenericResponse {
    status: number;
    message: string;
}

export interface ValidateJWTResponse extends GenericResponse {
    verify: {
        user: User;
        iat: number;
        exp: number;
    };
}

export enum Roles {
    SuperAdmin = 1, 
    Admin = 2,
    User = 3
}

export default class AuthApi {

    sequelize: Sequelize;

    constructor() {
        this.sequelize = sequelize;
    }

    public static async AuthValidateJwt(options: { token: string }) {
        try {
            const { token } = options;

            if (!token) {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }

            if (!options) {
                throw new CustomError({
                    status: 400,
                    message: "Parameters is required.",
                });
            }

            const verify = await jwt.verify(token, process.env.TOKEN_SECRET);

            if (typeof verify === "string") {
                throw new CustomError({
                    status: 500,
                    message: "Internal server error",
                });
            }

            if (!verify) {
                throw new CustomError({
                    status: 401,
                    message: "Unauthorized.",
                });
            }

            const user = await User.findByPk(verify.data.id, {
                attributes: {
                    exclude: ["id", "password", "createdAt", "updatedAt", "deletedAt"],
                },
            });

            if (!user) {
                throw new CustomError({
                    status: 404,
                    message: "User does not exist.",
                });
            }
            
            if (user.roleId == Roles.User) {
                console.log("404");
                throw new CustomError({
                    status: 404,
                    message: "You don't have enough rights",
                });
            }

            return {
                status: 200,
                message: "OK",
                verify: {
                    user,
                    iat: verify.iat,
                    exp: verify.exp,
                },
            };
        } catch (e) {
            throw e;
        }
    }
}