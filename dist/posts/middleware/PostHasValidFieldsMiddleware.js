"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostHasValidFIeldsMiddleware = void 0;
const http_statuses_1 = require("../../core/types/http-statuses");
const error_utils_1 = require("../../core/utils/error.utils");
const postInputDtoValidation_1 = require("../validation/postInputDtoValidation");
const blogs_db_1 = require("../../db/blogs.db");
const PostHasValidFIeldsMiddleware = (req, res, next) => {
    const errors = (0, postInputDtoValidation_1.postInputDtoValidation)(req.body);
    if (errors.length > 0) {
        res.status(http_statuses_1.HttpStatus.BadRequest).send((0, error_utils_1.createErrorMessages)(errors));
        return;
    }
    // validate blog exists and get data
    const blog = blogs_db_1.db.blogs.find((d) => d.id === req.body.blogId);
    if (!blog) {
        res
            .status(http_statuses_1.HttpStatus.BadRequest)
            .send((0, error_utils_1.createErrorMessages)([
            { field: 'blogId', message: 'Blog for post does not exist' },
        ]));
        return;
    }
    next(); // Успешная авторизация, продолжаем
};
exports.PostHasValidFIeldsMiddleware = PostHasValidFIeldsMiddleware;
