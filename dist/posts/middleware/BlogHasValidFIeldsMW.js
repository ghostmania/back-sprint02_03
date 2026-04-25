"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogHasValidFIeldsMiddleware = void 0;
const http_statuses_1 = require("../../core/types/http-statuses");
const error_utils_1 = require("../../core/utils/error.utils");
const blogInputDtoValidation_1 = require("../../blogs/validation/blogInputDtoValidation");
const BlogHasValidFIeldsMiddleware = (req, res, next) => {
    const errors = (0, blogInputDtoValidation_1.blogInputDtoValidation)(Object.assign({}, req.body));
    if (errors.length > 0) {
        res.status(http_statuses_1.HttpStatus.BadRequest).send((0, error_utils_1.createErrorMessages)(errors));
        return;
    }
    next(); // Успешная авторизация, продолжаем
};
exports.BlogHasValidFIeldsMiddleware = BlogHasValidFIeldsMiddleware;
