import express from "express";
import { Application } from "express";
import https from "https";
import { readFileSync } from "fs";
import { homedir } from "os";

import swaggerUI from "swagger-ui-express";
import swaggerDocument from "./swagger/openapi.json";

export default class App {
    app: Application;
    port: number;

    constructor(config: { port: number; middlewares: any; routes: any }) {
        this.app = express();
        this.port = config.port;
        this.middlewares(config.middlewares);
        this.routes(config.routes);
        this.app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
    }

    private middlewares(middlewares: {
        forEach: (arg: (middleware: any) => void) => void;
    }): void {
        middlewares.forEach((middleware) => {
            this.app.use(middleware);
        });
    }

    private routes(routes: {
        forEach: (arg: (controller: any) => void) => void;
    }): void {
        routes.forEach((controller) => {
            this.app.use("/", controller.router);
        });
    }

    public listen(): void {
        if (process.env.HOSTNAME === "localhost") {
            const server = https.createServer(
                {
                    key: readFileSync(
                        process.env.HTTPS_KEY.replace("~", homedir())
                    ),
                    cert: readFileSync(
                        process.env.HTTPS_CERT.replace("~", homedir())
                    ),
                },
                this.app
            );
            server.listen(this.port, () =>
                console.log(
                    `App listening on the https://localhost:${this.port}`
                )
            );
        } else {
            this.app.listen(this.port, () => {
                console.log(
                    `App listening on the http://localhost:${this.port}`
                );
            });
        }
    }
}
