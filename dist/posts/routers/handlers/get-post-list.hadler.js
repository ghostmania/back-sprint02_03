"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsListHandler = getPostsListHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const posts_db_1 = require("../../../db/posts.db");
function getPostsListHandler(req, res) {
    res.status(http_statuses_1.HttpStatus.Ok).send(posts_db_1.db.posts);
}
