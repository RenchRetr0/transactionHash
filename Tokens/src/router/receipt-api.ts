import express from "express";
import CustomError from "../CustomError";
import { Request, Response } from "express";
import AuthValidateJWT from "../api/AuthValidateJWT";
import { HTTPStatus } from "../utils";
import ReceiptApi from "../api/receipt-api";

export default class ReceiptRoutes {
    router = express.Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post('/transactionreceipt', AuthValidateJWT, this.blockhash);
    }

    private async blockhash(req: Request, res: Response) {
        try {
            const { hashTransaction } = req.body;
    
            if (!hashTransaction)  {
                throw new CustomError({
                    status: HTTPStatus.BAD_REQUEST,
                    message: "All parameters are required.",
                });
            }

            const response = await ReceiptApi.GetTransactionReceipt(hashTransaction);
            res.json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }
}