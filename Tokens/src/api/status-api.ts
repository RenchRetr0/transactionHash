import dotenv from "dotenv";
import { Op, Sequelize } from "sequelize";
import sequelize from "../database/sequelize";
import EventEmitter from "events";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import User from "../database/models/User";
import HistoryTokens from "../database/models/HistoryTokens";
import Contract from "../database/models/Contract";
dotenv.config();

export default class StatusApi extends EventEmitter {

    sequelize: Sequelize;

    constructor() {
        super();
        this.sequelize = sequelize;
    }

    public static async BlockHash(transfers: { account: SignerWithAddress, owner: SignerWithAddress, values: string}, transferMint: any, DataBase: { accountFound: User, ownerFound: User, contractFound: Contract, tokens: string}) {

        const s = new EventEmitter;

        s.on('event', async (transfers, transferMint, DataBase) => {

            const {account, owner, values} = transfers;
            const {accountFound, ownerFound, contractFound, tokens} = DataBase;

            let historyCreaty = await HistoryTokens.create({
                toId: ownerFound.id,
                fromId: accountFound.id,
                smartId: contractFound.id,
                value: +tokens,
                status_from_id: 1,
                status_to_id: 1
            });

            const tx = {
                to: owner.address,
                value: values
            }
            const txSend = await account.sendTransaction(tx);
            const tes = await txSend.wait();

            if(tes.status == 1) {
                await historyCreaty.update({
                    status_to_id: 2,
                    blockHash_from: txSend.transactionHash
                });

                const histor2 = await transferMint.transfer(account.address, values);

                await historyCreaty.update({
                    status_from_id: 2,
                    blockHash_to: histor2.hash
                });
            }

            else {
                await historyCreaty.update({
                    status_to_id: 3,
                    blockHash_from: txSend.blockHash
                });
            }
        });

        await s.emit('event', transfers, transferMint, DataBase);

    }
};