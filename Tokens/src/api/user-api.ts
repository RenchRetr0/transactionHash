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

export default class UserApi {

    sequelize: Sequelize;

    constructor() {
        this.sequelize = sequelize;
    }

    public static async signUp(options: {login: string, address: string, password:string;}) : Promise<any> {
        try{

            const {login, address, password} = options;

            if (!login && !address && !password) {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }

            if (
                password.search(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\(\)\[\]\{\}\~?<>;:\\_\/`+=\-\|!@#\$%\^&\*\.])(?=.{8,})/i
                ) === -1
            ) {
                throw new CustomError({
                    status: 400,
                    message:
                        "Password must be at least 8 characters, must contain 1 special character and number.",
                });
            }

            const passwordHash = await bcrypt.hash(
                password,
                Number(process.env.SALT_ROUNDS) || 10
            );

            const createdUser = await User.create({
                login: login,
                address: address,
                password: passwordHash,
                roleId: 3
            });

            if (!createdUser) {
                throw new CustomError({
                    status: 500,
                    message:
                        "Internal server error: could not connect to database.",
                });
            }
            
            return {
                status: 201,
                message: "User was successfully created.",
            };

        } catch (e) {
            throw e;
        }
    }

    public static async signIn(options: {
        login: string;
        password: string;
    }): Promise<any> {
        try {
            const { login, password } = options;

            if (!login && !password) {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }

            let userFound = await User.findOne({
                include: [Role],
                where: {
                    login: login,
                }
            });

            if (!userFound) {
                throw new CustomError({
                    status: 404,
                    message: "Cannot find user with current login",
                });
            }
            
            const hashCompare = await bcrypt.compare(password, userFound.password);
            if (!hashCompare) {
                throw new CustomError({
                    status: 400,
                    message: "Invalid login or password.",
                });
            };

            const user = [userFound.login, userFound.address, userFound.role.role];

            const token = jwt.sign(
                {
                    data: {
                        id: userFound.id,
                        login: userFound.login,
                        addresx: userFound.address,
                        role: userFound.role.role,
                        createdAt: userFound.createdAt,
                        updatedAt: userFound.updatedAt,
                    },
                },
                process.env.TOKEN_SECRET,
                {
                    expiresIn: "86400000",
                }
            );

            return {
                status: 200,
                message: "OK",
                user,
                token,
            };
        } catch (e) {
            throw e;
        }
    }

    public static async UserValidateJwt(options: { token: string }) {
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

// const tickets = async () => {
//     await sequelize.sync({alter:true});
// }
// tickets().then().catch(e => console.log(e))