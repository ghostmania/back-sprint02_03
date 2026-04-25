"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminGuardMiddleware = exports.ADMIN_PASSWORD = exports.ADMIN_USERNAME = void 0;
const http_statuses_1 = require("../core/types/http-statuses");
exports.ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
exports.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qwerty';
const superAdminGuardMiddleware = (req, res, next) => {
    const auth = req.headers['authorization']; // 'Basic xxxx'
    if (!auth) {
        res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
        return;
    }
    const [authType, token] = auth.split(' '); //admin:qwerty
    if (authType !== 'Basic') {
        res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
        return;
    }
    const credentials = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    if (username !== exports.ADMIN_USERNAME || password !== exports.ADMIN_PASSWORD) {
        res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
        return;
    }
    next(); // Успешная авторизация, продолжаем
};
exports.superAdminGuardMiddleware = superAdminGuardMiddleware;
