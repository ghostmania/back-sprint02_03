"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostByIdHandler = getPostByIdHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const error_utils_1 = require("../../../core/utils/error.utils");
const posts_db_1 = require("../../../db/posts.db");
function getPostByIdHandler(req, res) {
    const id = req.params.id;
    const driver = posts_db_1.db.posts.find((d) => d.id === id);
    if (!driver) {
        res
            .status(http_statuses_1.HttpStatus.NotFound)
            .send((0, error_utils_1.createErrorMessages)([{ field: 'id', message: 'Post not found' }]));
        return;
    }
    res.status(http_statuses_1.HttpStatus.Ok).send(driver);
}
