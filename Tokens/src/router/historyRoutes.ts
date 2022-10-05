import express from "express";
import { HTTPStatus } from "../utils";
import { Request, Response } from "express";
import AuthValidateJWT from "../api/AuthValidateJWT";
import HistroryApi from "../api/history-api";
import CustomError from "../CustomError";

export default class HistoryRoutes {
    router = express.Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.get('/history', AuthValidateJWT, this.historys);
        this.router.post('/history/addressUser', AuthValidateJWT, this.history);
    }

    private async historys(req: Request, res: Response) {
        try {
            const response = await HistroryApi.GetHistorys();
            res.json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

    private async history(req: Request, res: Response) {
        try {
            const { userAddress } = req.body;

            if (!userAddress)  {
                throw new CustomError({
                    status: HTTPStatus.BAD_REQUEST,
                    message: "All parameters are required.",
                });
            }

            const response = await HistroryApi.GetHistory(userAddress);
            res.json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

}