"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogByIdHandler = getBlogByIdHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const error_utils_1 = require("../../../core/utils/error.utils");
const blogs_db_1 = require("../../../db/blogs.db");
function getBlogByIdHandler(req, res) {
    const id = req.params.id;
    const driver = blogs_db_1.db.blogs.find((d) => d.id === id);
    if (!driver) {
        res
            .status(http_statuses_1.HttpStatus.NotFound)
            .send((0, error_utils_1.createErrorMessages)([{ field: 'id', message: 'Blog not found' }]));
        return;
    }
    res.status(http_statuses_1.HttpStatus.Ok).send(driver);
}
