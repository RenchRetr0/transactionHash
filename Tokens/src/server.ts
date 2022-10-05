import App from "./app";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import ContractRoutes from './router/contractRoutes';
import UserRoutes from "./router/userRoutes";
import HistoryRoutes from "./router/historyRoutes";

const app = new App({
    port: Number(process.env.PORT) || 3040,
    middlewares: [
        express.json({
            limit: "100mb",
        }),
        express.urlencoded({ extended: true }),
        cors(),
        morgan('dev'),
    ],
    routes: [
        new ContractRoutes(),
        new UserRoutes(),
        new HistoryRoutes()
    ]
});

app.listen();
