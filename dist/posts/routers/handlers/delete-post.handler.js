"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePostHandler = deletePostHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const posts_db_1 = require("../../../db/posts.db");
function deletePostHandler(req, res) {
    const id = req.params.id;
    const index = posts_db_1.db.posts.findIndex((v) => v.id === id);
    // if (index === -1) {
    //   res
    //     .status(HttpStatus.NotFound)
    //     .send(createErrorMessages([{ field: 'id', message: 'Post not found' }]));
    //   return;
    // }
    posts_db_1.db.posts.splice(index, 1);
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
}
