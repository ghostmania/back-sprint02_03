"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogsRouter = void 0;
const express_1 = require("express");
const get_blog_list_hadler_1 = require("./handlers/get-blog-list.hadler");
const get_blog_by_id_handler_1 = require("./handlers/get-blog-by-id.handler");
const create_blog_handler_1 = require("./handlers/create-blog.handler");
const update_blog_handler_1 = require("./handlers/update-blog.handler");
const delete_blog_handler_1 = require("./handlers/delete-blog.handler");
const admin_guard_middleware_1 = require("../../auth/admin.guard-middleware");
const BlogHasValidFIeldsMW_1 = require("../../posts/middleware/BlogHasValidFIeldsMW");
exports.blogsRouter = (0, express_1.Router)({});
exports.blogsRouter
    .get('', get_blog_list_hadler_1.getBlogsListHandler)
    .get('/:id', get_blog_by_id_handler_1.getBlogByIdHandler)
    .post('', admin_guard_middleware_1.superAdminGuardMiddleware, BlogHasValidFIeldsMW_1.BlogHasValidFIeldsMiddleware, create_blog_handler_1.createBlogHandler)
    .put('/:id', admin_guard_middleware_1.superAdminGuardMiddleware, BlogHasValidFIeldsMW_1.BlogHasValidFIeldsMiddleware, update_blog_handler_1.updateBlogHandler)
    .delete('/:id', admin_guard_middleware_1.superAdminGuardMiddleware, delete_blog_handler_1.deleteBlogHandler);
