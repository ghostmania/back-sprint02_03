"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogsRouter = void 0;
const express_1 = require("express");
const get_blog_list_hadler_1 = require("./handlers/get-blog-list.hadler");
const get_blog_by_id_handler_1 = require("./handlers/get-blog-by-id.handler");
const create_blog_handler_1 = require("./handlers/create-blog.handler");
const update_blog_handler_1 = require("./handlers/update-blog.handler");
const delete_blog_handler_1 = require("./handlers/delete-blog.handler");
exports.blogsRouter = (0, express_1.Router)({});
exports.blogsRouter
    .get('', get_blog_list_hadler_1.getBlogsListHandler)
    .get('/:id', get_blog_by_id_handler_1.getBlogByIdHandler)
    .post('', create_blog_handler_1.createBlogHandler)
    .put('/:id', update_blog_handler_1.updateBlogHandler)
    .delete('/:id', delete_blog_handler_1.deleteBlogHandler);
