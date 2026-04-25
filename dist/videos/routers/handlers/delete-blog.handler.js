"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlogHandler = deleteBlogHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const error_utils_1 = require("../../../core/utils/error.utils");
const blogs_db_1 = require("../../../db/blogs.db");
function deleteBlogHandler(req, res) {
    const id = req.params.id;
    const index = blogs_db_1.db.blogs.findIndex((v) => v.id === id);
    if (index === -1) {
        res
            .status(http_statuses_1.HttpStatus.NotFound)
            .send((0, error_utils_1.createErrorMessages)([{ field: 'id', message: 'Blog not found' }]));
        return;
    }
    blogs_db_1.db.blogs.splice(index, 1);
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
}
