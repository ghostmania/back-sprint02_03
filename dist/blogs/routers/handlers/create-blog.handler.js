"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlogHandler = createBlogHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const blogs_db_1 = require("../../../db/blogs.db");
function createBlogHandler(req, res) {
    const newBlog = {
        id: blogs_db_1.db.blogs.length ? blogs_db_1.db.blogs[blogs_db_1.db.blogs.length - 1].id + 1 : '1',
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
    };
    blogs_db_1.db.blogs.push(newBlog);
    res.status(http_statuses_1.HttpStatus.Created).send(newBlog);
}
