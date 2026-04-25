"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRouter = void 0;
const express_1 = require("express");
const get_post_by_id_handler_1 = require("./handlers/get-post-by-id.handler");
const get_post_list_hadler_1 = require("./handlers/get-post-list.hadler");
const update_post_handler_1 = require("./handlers/update-post.handler");
const create_post_handler_1 = require("./handlers/create-post.handler");
const delete_post_handler_1 = require("./handlers/delete-post.handler");
const admin_guard_middleware_1 = require("../../auth/admin.guard-middleware");
const DocumentExistGuardMiddleware_1 = require("../middleware/DocumentExistGuardMiddleware");
const PostHasValidFieldsMiddleware_1 = require("../middleware/PostHasValidFieldsMiddleware");
exports.postsRouter = (0, express_1.Router)({});
exports.postsRouter
    .get('', get_post_list_hadler_1.getPostsListHandler)
    .get('/:id', get_post_by_id_handler_1.getPostByIdHandler)
    .post('', admin_guard_middleware_1.superAdminGuardMiddleware, PostHasValidFieldsMiddleware_1.PostHasValidFIeldsMiddleware, create_post_handler_1.createPostHandler)
    .put('/:id', admin_guard_middleware_1.superAdminGuardMiddleware, PostHasValidFieldsMiddleware_1.PostHasValidFIeldsMiddleware, DocumentExistGuardMiddleware_1.DocumentExistGuardMiddleware, update_post_handler_1.updatePostHandler)
    .delete('/:id', DocumentExistGuardMiddleware_1.DocumentExistGuardMiddleware, admin_guard_middleware_1.superAdminGuardMiddleware, delete_post_handler_1.deletePostHandler);
