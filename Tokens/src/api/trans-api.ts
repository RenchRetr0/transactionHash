import dotenv from "dotenv";
import CustomError from "../CustomError";
import { Op, Sequelize } from "sequelize";
import sequelize from "../database/sequelize";
import hre from "hardhat";
import Contract from "../database/models/Contract";
import StatusApi from "./status-api";
const ethers = hre.ethers;
import TS from "../../artifacts/contracts/Tokens.sol/Tokens.json";
import User from "../database/models/User";
dotenv.config();

export default class TransApi {

    sequelize: Sequelize;

    constructor() {
        this.sequelize = sequelize;
    }

    public static async Mint(options: { token: any, tokens: string, smart: string }) : Promise<any> {
        try {
            const {token, tokens, smart} = options;

            if (!tokens || !token || !smart) {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }

            const address = token.verify.user.address;

            let rawBalance = await ethers.utils.formatEther(await ethers.provider.getBalance(address));
            if(+tokens > +rawBalance) {
                return {
                    status: 201,
                    message: "Insufficient funds."
                }
            };

            const contractFound = await this.FoundContract(smart);
            if(contractFound == null) {
                return {
                    status: 201,
                    message: "Tokens not found."
                }
            }

            // колличество токенов тип числовой
            const values = `${ethers.utils.parseEther(tokens)}`;

            const account = await ethers.getSigner(address);
            const accountFound = await this.FoundUser(account.address);
            
            let transferMint = await this.Contract(account, smart);

            const owner = await ethers.getSigner(await transferMint.GetOwner());
            const ownerFound = await this.FoundUser(owner.address);

            const DataBase = { accountFound, ownerFound, contractFound, tokens };

            transferMint = await this.Contract(owner, smart);

            const transfers = { account, owner, values};

            await StatusApi.BlockHash(transfers, transferMint, DataBase);
            // await StatusApi.TranshHash(transfers, transferMint);

            return {
                status: 201,
                message: "The funds have been sent. Replenishing your wallet will take time.",
            };
        }
        catch(e) {
            throw e;
        }
    }

    public static async Smart(options: {token: any, name: string, symbol: string}) : Promise<any> {
        try {
            const {token, name, symbol} = options;
            if (!token || !name || !symbol) {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }
            const address = token.verify.user.address;
            const account = await this.Account(address);

            const values: string = `${ethers.utils.parseEther('50')}`;


            const smart = await ethers.getContractFactory('Tokens', account.address);
            const contract = await smart.deploy(name, symbol, values, account.address);
            const deployTx = await contract.deployed();

            const userId = await this.GetUserId(token.verify.user.login);

            let createContract = await Contract.create({
                smart: deployTx.address,
                ownerId: userId.userId.id,
                name: name,
                symbol: symbol
            });

            if (!createContract) {
                throw new CustomError({
                    status: 500,
                    message:
                        "Internal server error: could not connect to database.",
                });
            }

            // const result = [createContract.smart, createContract.name, createContract.symbol];

            const transferMint = await this.Contract(account, deployTx.address);
            const bal = ethers.utils.formatEther(await transferMint.balanceOf(account.address));
            const result = [deployTx.address, name, symbol, bal];

            return {
                status: 201,
                message: "Contract was successfully created.",
                result,
            };
        }
        catch(e) {
            throw e;
        }
    }

    public static async ballance(options: { token: any, smart: any }) : Promise<any> {
        try {
            const {token, smart} = options;
            const address = token.verify.user.address;

            if (!token || !smart) {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }
            
            const account = await this.Account(address);
            const balances = await this.Contract(account, smart);

            const result = ethers.utils.formatEther(await balances.balanceOf(account.address));

            return {
                status: 201,
                message: `Ваш баланс: ${result}`,
            };
        }
        catch(e) {
            throw e;
        }
    }

    // ======================================================
    // =========== Вспомогательные ==========================
    // ======================================================

    private static async Account(address: string) : Promise<any> {
        let account = await ethers.getSigner(address);
        return account;
    }

    public static async Contract(address: any, smart: string) : Promise<any> {

        const contract = new ethers.Contract(
            smart,
            TS.abi,
            address
        );
        
        return contract;
    }

    private static async GetUserId(_login: string) : Promise<any> {
        const userId = await User.findOne({
            where: {
                login: _login,
            },
            attributes: ['id'],
        });
        return {
            userId,
        };
    }

    private static async FoundContract(_smart: string) : Promise<Contract> {
        const contractFound = await Contract.findOne({
            where: {
                smart: _smart,
            },
        });
        return contractFound;
    }

    private static async FoundUser(_addres: string) : Promise<User> {
        const userFound = await User.findOne({
            where: {
                address: _addres,
            },
        });
        return userFound;
    }
}
