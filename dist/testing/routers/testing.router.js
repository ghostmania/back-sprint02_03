"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testingRouter = void 0;
const express_1 = require("express");
const http_statuses_1 = require("../../core/types/http-statuses");
const blogs_db_1 = require("../../db/blogs.db");
const posts_db_1 = require("../../db/posts.db");
exports.testingRouter = (0, express_1.Router)({});
exports.testingRouter.delete('/all-data', (req, res) => {
    blogs_db_1.db.blogs = [];
    posts_db_1.db.posts = [];
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
});
