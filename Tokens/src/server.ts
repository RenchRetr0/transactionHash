import App from "./app";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import TransactionsRoutes from './router/transactionsRoutes';
import UserRoutes from "./router/userRoutes";
import SearchRoutes from "./router/searchRoutes";

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
        new TransactionsRoutes(),
        new UserRoutes(),
        new SearchRoutes()
    ]
});

app.listen();
