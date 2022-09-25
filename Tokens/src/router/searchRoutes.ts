import express from "express";
import { Request, Response } from "express";
import AuthValidateJWT from "../api/AuthValidateJWT";
import SearchApi from "../api/search-api";

export default class SearchRoutes {
    router = express.Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.get('/search', AuthValidateJWT, this.historys);
        this.router.post('/search/addressUser', AuthValidateJWT, this.history);
        this.router.post('/search/transactionreceipt', AuthValidateJWT, this.blockhash);
    }

    private async historys(req: Request, res: Response) {
        try {
            const response = await SearchApi.GetHistorys();
            res.status(response.status).json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

    private async history(req: Request, res: Response) {
        try {
            const response = await SearchApi.GetHistory(req.body);
            res.status(response.status).json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

    private async blockhash(req: Request, res: Response) {
        try {
            const response = await SearchApi.GetTransactionReceipt(req.body);
            res.status(response.status).json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }
}