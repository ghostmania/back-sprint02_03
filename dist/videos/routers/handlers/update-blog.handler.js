"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlogHandler = updateBlogHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const error_utils_1 = require("../../../core/utils/error.utils");
const blogs_db_1 = require("../../../db/blogs.db");
const blogInputDtoValidation_1 = require("../../validation/blogInputDtoValidation");
function updateBlogHandler(req, res) {
    const id = req.params.id;
    const index = blogs_db_1.db.blogs.findIndex((v) => v.id === id);
    if (index === -1) {
        res
            .status(http_statuses_1.HttpStatus.NotFound)
            .send((0, error_utils_1.createErrorMessages)([{ field: 'id', message: 'Video not found' }]));
        return;
    }
    const driver = blogs_db_1.db.blogs[index];
    const errors = (0, blogInputDtoValidation_1.blogInputDtoValidation)(Object.assign({}, req.body));
    if (errors.length > 0) {
        res.status(http_statuses_1.HttpStatus.BadRequest).send((0, error_utils_1.createErrorMessages)(errors));
        return;
    }
    driver.name = req.body.name;
    driver.description = req.body.description;
    driver.websiteUrl = req.body.websiteUrl;
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
}
