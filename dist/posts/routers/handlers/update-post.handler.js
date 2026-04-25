"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostHandler = updatePostHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const error_utils_1 = require("../../../core/utils/error.utils");
const posts_db_1 = require("../../../db/posts.db");
const blogs_db_1 = require("../../../db/blogs.db");
function updatePostHandler(req, res) {
    const id = req.params.id;
    const index = posts_db_1.db.posts.findIndex((v) => v.id === id);
    // if (index === -1) {
    //   res
    //     .status(HttpStatus.NotFound)
    //     .send(createErrorMessages([{ field: 'id', message: 'Post not found' }]));
    //   return;
    // }
    const post = posts_db_1.db.posts[index];
    // const errors = postInputDtoValidation({
    //   ...req.body,
    // });
    // if (errors.length > 0) {
    //   res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
    //   return;
    // }
    const blog = blogs_db_1.db.blogs.find((item) => item.id === req.body.blogId);
    if (!blog) {
        res
            .status(http_statuses_1.HttpStatus.BadRequest)
            .send((0, error_utils_1.createErrorMessages)([
            { field: 'blogId', message: 'Blog for post does not exist' },
        ]));
        return;
    }
    post.title = req.body.title;
    post.shortDescription = req.body.shortDescription;
    post.content = req.body.content;
    post.blogId = req.body.blogId;
    post.blogName = blog.name;
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
}
