import dotenv from "dotenv";
import { Op, Sequelize } from "sequelize";
import sequelize from "../database/sequelize";
import EventEmitter from "events";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import User from "../database/models/User";
import HistoryTokens from "../database/models/HistoryTokens";
import Contract from "../database/models/Contract";
dotenv.config();

export default class ListenerApi extends EventEmitter {

    sequelize: Sequelize;

    constructor() {
        super();
        this.sequelize = sequelize;
    }

    public static async TransactionListener(
        BlocChain: 
        { 
            userSigner: SignerWithAddress, 
            ownerSigner: SignerWithAddress, 
            ether: string
        }, 
        SmartConstract: any, 
        DataBase: 
        { 
            userFoundDB: User, 
            ownerFoundDB: User, 
            contractFoundDB: Contract, 
            amountTokens: string
        }) {

        const s = new EventEmitter;

        s.on('event', async (BlocChain, SmartConstract, DataBase) => {

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

                await historyCreaty.update({
                    status_from_id: 2,
                    blockHash_from: transferContract.hash
                });
            }

            else {
                await historyCreaty.update({
                    status_to_id: 3,
                });
            }
        });

        await s.emit('event', BlocChain, SmartConstract, DataBase);

    }
};