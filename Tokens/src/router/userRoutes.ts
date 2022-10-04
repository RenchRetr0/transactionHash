import express, { response } from "express";
import { Request, Response } from "express";
import { HTTPStatus } from "../utils";
import UserApi from "../api/user-api";
import CustomError from "../CustomError";

export default class UserRoutes {
    router = express.Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post('/user/signUp', this.signUp);
        this.router.post('/user/signIn', this.signIn);
    }

    private async signUp(req: Request, res: Response) {
        const {login, address, password} = req.body;

        if (!login || !address || !password) {
            throw new CustomError({
                status: HTTPStatus.BAD_REQUEST,
                message: "All parameters are required.",
            });
        };

        
        if (
            password.search(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\(\)\[\]\{\}\~?<>;:\\_\/`+=\-\|!@#\$%\^&\*\.])(?=.{8,})/i
            ) === -1
        ) {
            throw new CustomError({
                status: HTTPStatus.BAD_REQUEST,
                message:
                    "Password must be at least 8 characters, must contain 1 special character and number.",
            });
        };

        const response = await UserApi.signUp(login, address, password);
        res.json(response);
    }

    private async signIn(req: Request, res: Response) {
        try {
            
            const { login, password } = req.body;

            if (!login && !password) {
                throw new CustomError({
                    status: HTTPStatus.BAD_REQUEST,
                    message: "All parameters are required.",
                });
            }

            const response = await UserApi.signIn(login, password);
            res.json(response);
        } catch (e) {
            console.log(e);
            res.status(e?.status || 500).json(e);
        }
    }

}