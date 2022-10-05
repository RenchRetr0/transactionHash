import dotenv from "dotenv";
import CustomError from "../CustomError";
import { Sequelize } from "sequelize";
import sequelize from "../database/sequelize";
import hre from "hardhat";
import ContractDB from "../database/models/Contract";
import EventEmitter from "events";
import { HTTPStatus } from "../utils";
const ethers = hre.ethers;
import TS from "../../artifacts/contracts/Tokens.sol/Tokens.json";
import User from "../database/models/User";
import { Contract } from "ethers";
import HistoryTokens from "../database/models/HistoryTokens";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
dotenv.config();

export default class ContractApi {

    sequelize: Sequelize;

    constructor() {
        this.sequelize = sequelize;
    }

    public static async Transaction(token: any, amountTokens: string, addresContract: string ) : Promise<object> {
        const userAddress = token.verify.user.address;

        let userBalance = await ethers.utils.formatEther(await ethers.provider.getBalance(userAddress));
        if(+amountTokens > +userBalance) {
            throw new CustomError({
                status: HTTPStatus.NOT_ACCEPTABLE,
                message: "Insufficient funds.",
            });
        };

        const contractFoundDB = await this.GetContractAndOwner(addresContract);
        if(contractFoundDB == null) {
            throw new CustomError({
                status: HTTPStatus.NOT_FOUND,
                message: "Contract not found.",
            });
        }

        const ether = `${ethers.utils.parseEther(amountTokens)}`;

        const userSigner = await this.GetSigner(userAddress);
        const userFoundDB = await this.GetUser(userSigner.address);

        const ownerSigner = await this.GetSigner(contractFoundDB.user.address);
        const ownerFoundDB: User = contractFoundDB.user;

        const DataBase = { userFoundDB, ownerFoundDB, contractFoundDB, amountTokens };

        const SmartConstract = await this.Contract(ownerSigner, addresContract);

        const BlocChain = { userSigner, ownerSigner, ether};

        await this.ListenerTransaction(BlocChain, SmartConstract, DataBase);

        return {
            message: "The funds have been sent."
        };
    }

    public static async creatrContract(token: any, name: string, symbol: string) : Promise<string[]> {

        const addressOwner = token.verify.user.address;
        const ownerSigner = await this.GetSigner(addressOwner);

        const ether: string = `${ethers.utils.parseEther('50')}`;

        const contractFactory = await ethers.getContractFactory('Tokens', ownerSigner);
        const contractCreate = await contractFactory.deploy(name, symbol, ether, ownerSigner.address);
        await contractCreate.deployed();

        const ownerFoundDB = await this.GetUser(token.verify.user.address);

        const createContractDB = await ContractDB.create({
            smart: contractCreate.address,
            ownerId: ownerFoundDB.id,
            name: name,
            symbol: symbol
        });

        if (!createContractDB) {
            throw new CustomError({
                status: HTTPStatus.INTERNAL,
                message:
                    "Internal server error: could not connect to database.",
            });
        };

        const contract = await this.Contract(ownerSigner, contractCreate.address);
        const ballance = ethers.utils.formatEther(await contract.balanceOf(ownerSigner.address));
        const result = [contractCreate.address, name, symbol, ballance];

        return result;
    }

    public static async ballance(token: any, addresContract: string ) : Promise<object> {

        const userAddress = token.verify.user.address;
        
        const userSigner = await this.GetSigner(userAddress);
        const contract = await this.Contract(userSigner, addresContract);

        const Balance = await contract.balanceOf(userSigner.address);
        const BalanceFormatEther = ethers.utils.formatEther(Balance);

        return {
            message: `Your balance: ${BalanceFormatEther}`
        };
    }

    private static async ListenerTransaction(
        BlocChain: {
            userSigner: SignerWithAddress, 
            ownerSigner: SignerWithAddress, 
            ether: string
        }, 
        SmartConstract: Contract, 
        DataBase: {
            userFoundDB: User, 
            ownerFoundDB: User, 
            contractFoundDB: ContractDB, 
            amountTokens: string
        }
        ) {

        const listener = new EventEmitter;

        listener.on('event', async (BlocChain, SmartConstract, DataBase) => {

            const {userSigner, ownerSigner, ether} = BlocChain;
            const {userFoundDB, ownerFoundDB, contractFoundDB, amountTokens} = DataBase;

            const historyCreaty = await HistoryTokens.create({
                toId: ownerFoundDB.id,
                fromId: userFoundDB.id,
                smartId: contractFoundDB.id,
                value: +amountTokens,
                status_from_id: 1,
                status_to_id: 1
            });

            const info = {
                to: ownerSigner.address,
                value: ether
            }
            const infoSend = await userSigner.sendTransaction(info);
            const transactionEnd = await infoSend.wait();

            if(transactionEnd.status == 1) {
                await historyCreaty.update({
                    status_to_id: 2,
                    blockHash_to: transactionEnd.transactionHash
                });

                const transferContract = await SmartConstract.transfer(userSigner.address, ether);

                const historyUpdate = await historyCreaty.update({
                    status_from_id: 2,
                    blockHash_from: transferContract.hash
                });
            }

            else {
                const historyUpdate = await historyCreaty.update({
                    status_to_id: 3,
                });
            }
        });

        await listener.emit('event', BlocChain, SmartConstract, DataBase);
    }

    private static async GetSigner(address: string) : Promise<SignerWithAddress> {
        const userSigner = await ethers.getSigner(address);
        return userSigner;
    }

    private static async Contract(userSigner: SignerWithAddress, contractAddress: string) : Promise<Contract> {

        const contract = new ethers.Contract(
            contractAddress,
            TS.abi,
            userSigner
        );
        
        return contract;
    }

    private static async GetContractAndOwner(_smart: string) : Promise<ContractDB> {
        const contractFoundDB = await ContractDB.findOne({
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
