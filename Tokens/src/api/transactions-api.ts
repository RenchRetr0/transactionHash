import dotenv from "dotenv";
import CustomError from "../CustomError";
import { Op, Sequelize } from "sequelize";
import sequelize from "../database/sequelize";
import hre from "hardhat";
import Contract from "../database/models/Contract";
import ListenerApi from "./listener-api";
const ethers = hre.ethers;
import TS from "../../artifacts/contracts/Tokens.sol/Tokens.json";
import User from "../database/models/User";
dotenv.config();

export default class TransactionsApi {

    sequelize: Sequelize;

    constructor() {
        this.sequelize = sequelize;
    }

    public static async Transaction(options: { token: any, amountTokens: string, addresContract: string }) : Promise<any> {
        try {
            const {token, amountTokens, addresContract} = options;

            if (!amountTokens || !addresContract) {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }

            const userAddress = token.verify.user.address;

            let userBalance = await ethers.utils.formatEther(await ethers.provider.getBalance(userAddress));
            if(+amountTokens > +userBalance) {
                throw new CustomError({
                    status: 400,
                    message: "Insufficient funds.",
                });
            };

            const contractFoundDB = await this.GetContract(addresContract);
            if(contractFoundDB == null) {
                throw new CustomError({
                    status: 400,
                    message: "Contract not found.",
                });
            }

            // колличество токенов тип строковый
            const ether = `${ethers.utils.parseEther(amountTokens)}`;

            const userSigner = await this.GetSigner(userAddress);
            const userFoundDB = await this.GetUser(userSigner.address);

            const ownerSigner = await this.GetSigner(contractFoundDB.user.address);
            const ownerFoundDB = contractFoundDB.user;

            const DataBase = { userFoundDB, ownerFoundDB, contractFoundDB, amountTokens };

            const SmartConstract = await this.Contract(ownerSigner, addresContract);

            const BlocChain = { userSigner, ownerSigner, ether};

            await ListenerApi.TransactionListener(BlocChain, SmartConstract, DataBase);

            return {
                status: 201,
                message: "The funds have been sent.",
            };
        }
        catch(e) {
            throw e;
        }
    }

    public static async creatrContract(options: {token: any, name: string, symbol: string}) : Promise<any> {
        try {

            const {token, name, symbol} = options;

            if (!name || !symbol) {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }

            const addressOwner = token.verify.user.address;
            const ownerSigner = await this.GetSigner(addressOwner);

            const ether: string = `${ethers.utils.parseEther('50')}`;

            const contractFactory = await ethers.getContractFactory('Tokens', ownerSigner.address);
            const contractCreate = await contractFactory.deploy(name, symbol, ether, ownerSigner.address);
            await contractCreate.deployed();

            const ownerFoundDB = await this.GetUser(token.verify.user.address);

            let createContractDB = await Contract.create({
                smart: contractCreate.address,
                ownerId: ownerFoundDB.id,
                name: name,
                symbol: symbol
            });

            if (!createContractDB) {
                throw new CustomError({
                    status: 500,
                    message:
                        "Internal server error: could not connect to database.",
                });
            };

            const contract = await this.Contract(ownerSigner, contractCreate.address);
            const ballance = ethers.utils.formatEther(await contract.balanceOf(ownerSigner.address));
            const result = [contractCreate.address, name, symbol, ballance];

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

    public static async ballance(options: { token: any, addresContract: any }) : Promise<any> {
        try {
            const {token, addresContract} = options;
            const userAddress = token.verify.user.address;

            if (!addresContract) {
                throw new CustomError({
                    status: 400,
                    message: "All parameters are required.",
                });
            }
            
            const userSigner = await this.GetSigner(userAddress);
            const contract = await this.Contract(userSigner, addresContract);

            const balance = ethers.utils.formatEther(await contract.balanceOf(userSigner.address));

            return {
                status: 201,
                message: `Your balance: ${balance}`,
            };
        }
        catch(e) {
            throw e;
        }
    }

    // ======================================================
    // =========== Вспомогательные ==========================
    // ======================================================

    private static async GetSigner(address: string) : Promise<any> {
        let account = await ethers.getSigner(address);
        return account;
    }

    public static async Contract(userSigner: any, contractAddress: string) : Promise<any> {

        const contract = new ethers.Contract(
            contractAddress,
            TS.abi,
            userSigner
        );
        
        return contract;
    }

    private static async GetContract(_smart: string) : Promise<Contract> {
        const contractFoundDB = await Contract.findOne({
            where: {
                smart: _smart,
            },
            include: [
                {
                    model: User,
                },
            ]
        });
        return contractFoundDB;
    }

    private static async GetUser(_addres: string) : Promise<User> {
        const userFoundDB = await User.findOne({
            where: {
                address: _addres,
            },
        });
        return userFoundDB;
    }
}
