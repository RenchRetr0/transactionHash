import express from "express";
import { Request, Response } from "express";
import UserValidateJWT from "../api/UserValidateJWT";
import TransactionsApi from "../api/transactions-api";
import { HTTPStatus } from "../utils";
import CustomError from "../CustomError";

export default class TransactionsRoutes {
    router = express.Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post('/contract/transaction', UserValidateJWT, this.transaction);
        this.router.post('/contract/ballance', UserValidateJWT, this.ballance);
        this.router.post('/contract/create', UserValidateJWT, this.create);
    }

    private async transaction(req: Request, res: Response) {
        try {
            
            const {token, amountTokens, addresContract} = req.body;

            if (!amountTokens || !addresContract) {
                throw new CustomError({
                    status: HTTPStatus.BAD_REQUEST,
                    message: "All parameters are required.",
                });
            }

            const response = await TransactionsApi.Transaction(token, amountTokens, addresContract);
            res.json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

    private async ballance(req: Request, res: Response) {
        try {
            const {token, addresContract} = req.body;

            if (!addresContract) {
                throw new CustomError({
                    status: HTTPStatus.BAD_REQUEST,
                    message: "All parameters are required.",
                });
            };
            
            const response = await TransactionsApi.ballance(token, addresContract);
            res.json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

    private async create(req: Request, res: Response) {
        try {

            const {token, name, symbol} = req.body;

            if (!name || !symbol) {
                throw new CustomError({
                    status: HTTPStatus.BAD_REQUEST,
                    message: "All parameters are required.",
                });
            }

            const response = await TransactionsApi.creatrContract(token, name, symbol);
            res.json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

}