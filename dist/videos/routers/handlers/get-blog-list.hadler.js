"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogsListHandler = getBlogsListHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const blogs_db_1 = require("../../../db/blogs.db");
function getBlogsListHandler(req, res) {
    res.status(http_statuses_1.HttpStatus.Ok).send(blogs_db_1.db.blogs);
}
