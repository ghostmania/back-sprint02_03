"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupApp = void 0;
const express_1 = __importDefault(require("express"));
const blogs_router_1 = require("./blogs/routers/blogs.router");
const posts_router_1 = require("./posts/routers/posts.router");
const setup_swagger_1 = require("./core/swagger/setup-swagger");
const testing_router_1 = require("./testing/routers/testing.router");
const setupApp = (app) => {
    app.use(express_1.default.json()); // middleware для парсинга JSON в теле запроса
    // основной роут
    app.get('/', (req, res) => {
        res.status(200).send('Hello world!');
    });
    app.use('/blogs', blogs_router_1.blogsRouter);
    app.use('/posts', posts_router_1.postsRouter);
    app.use('/testing', testing_router_1.testingRouter);
    (0, setup_swagger_1.setupSwagger)(app);
    return app;
};
exports.setupApp = setupApp;
