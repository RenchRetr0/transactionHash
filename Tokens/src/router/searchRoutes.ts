import express from "express";
import { Request, Response } from "express";
import validateJWT from "../api/validateJWT";
import TransApi from "../api/trans-api";
import SearchApi from "../api/search-api";

export default class SearchRoutes {
    router = express.Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.get('/search', validateJWT, this.historys);
        this.router.post('/search/address', validateJWT, this.history);
        this.router.post('/search/hash', validateJWT, this.blockhash);
    }

    private async historys(req: Request, res: Response) {
        try {
            const response = await SearchApi.GetHistorys(req.body);
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
            const response = await SearchApi.GetHash(req.body);
            res.status(response.status).json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }
}