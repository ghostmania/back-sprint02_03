"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostHandler = createPostHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const error_utils_1 = require("../../../core/utils/error.utils");
const posts_db_1 = require("../../../db/posts.db");
const blogs_db_1 = require("../../../db/blogs.db");
function createPostHandler(req, res) {
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
    const newPost = {
        id: posts_db_1.db.posts.length ? posts_db_1.db.posts[posts_db_1.db.posts.length - 1].id + 1 : '1',
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: req.body.blogId,
        blogName: blog.name,
    };
    posts_db_1.db.posts.push(newPost);
    res.status(http_statuses_1.HttpStatus.Created).send(newPost);
}
