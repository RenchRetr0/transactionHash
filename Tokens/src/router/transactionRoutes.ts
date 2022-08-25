import express from "express";
import { Request, Response } from "express";
import validateJWT from "../api/validateJWT";
import TransApi from "../api/trans-api";

export default class TransRoutes {
    router = express.Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post('/trans/mint', validateJWT, this.tocens);
        this.router.post('/trans/ballance', validateJWT, this.ballance);
        this.router.post('/trans/smart', validateJWT, this.smart);
    }

    private async tocens(req: Request, res: Response) {
        try {
            const response = await TransApi.Mint(req.body);
            res.status(response.status).json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

    private async ballance(req: Request, res: Response) {
        try {
            const response = await TransApi.ballance(req.body);
            res.status(response.status).json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

    private async smart(req: Request, res: Response) {
        try {
            const response = await TransApi.Smart(req.body);
            res.status(response.status).json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

}