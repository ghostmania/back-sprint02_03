"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentExistGuardMiddleware = void 0;
const posts_db_1 = require("../../db/posts.db");
const error_utils_1 = require("../../core/utils/error.utils");
const http_statuses_1 = require("../../core/types/http-statuses");
const DocumentExistGuardMiddleware = (req, res, next) => {
    const id = req.params.id;
    const index = posts_db_1.db.posts.findIndex((v) => v.id === id);
    if (index === -1) {
        res
            .status(http_statuses_1.HttpStatus.NotFound)
            .send((0, error_utils_1.createErrorMessages)([{ field: 'id', message: 'Post not found' }]));
        return;
    }
    next(); // Успешная авторизация, продолжаем
};
exports.DocumentExistGuardMiddleware = DocumentExistGuardMiddleware;
