import express from "express";
import { Request, Response } from "express";
import UserValidateJWT from "../api/UserValidateJWT";
import TransactionsApi from "../api/transactions-api";

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
            const response = await TransactionsApi.Transaction(req.body);
            res.status(response.status).json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

    private async ballance(req: Request, res: Response) {
        try {
            const response = await TransactionsApi.ballance(req.body);
            res.status(response.status).json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

    private async create(req: Request, res: Response) {
        try {
            const response = await TransactionsApi.creatrContract(req.body);
            res.status(response.status).json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

}