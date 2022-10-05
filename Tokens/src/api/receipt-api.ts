import { network } from "hardhat";
import { ethers } from "ethers";
import CustomError from "../CustomError";
import { HTTPStatus } from "../utils";

export default class ReceiptApi {

    public static async GetTransactionReceipt(hashTransaction: string) : Promise<ethers.providers.TransactionReceipt> {

        const EthereumProvider: any = network.provider;
        const provider = new ethers.providers.Web3Provider(EthereumProvider)
        const TransactionReceipt = await provider.getTransactionReceipt(hashTransaction);

        if(!TransactionReceipt) {
            throw new CustomError({
                status: HTTPStatus.NOT_FOUND,
                message: "Transaction not found.",
            });
        }
        
        return TransactionReceipt;
    }
}
