"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postInputDtoValidation = void 0;
const postInputDtoValidation = (data) => {
    const errors = [];
    if (!data.title ||
        (data.title && typeof data.title !== 'string') ||
        (data.title && data.title.trim().length < 1) ||
        (data.title && data.title.trim().length > 30)) {
        errors.push({ field: 'title', message: 'Invalid post title' });
    }
    if (!data.shortDescription ||
        (data.shortDescription && typeof data.shortDescription !== 'string') ||
        (data.shortDescription && data.shortDescription.trim().length < 1) ||
        (data.shortDescription && data.shortDescription.trim().length > 100)) {
        errors.push({
            field: 'shortDescription',
            message: 'Invalid post shortDescription',
        });
    }
    if (!data.content ||
        (data.content && typeof data.content !== 'string') ||
        (data.content && data.content.trim().length < 1) ||
        (data.content && data.content.trim().length > 1000)) {
        errors.push({ field: 'content', message: 'Invalid post content' });
    }
    if (!data.blogId ||
        (data.blogId && typeof data.blogId !== 'string') ||
        (data.blogId && data.blogId.trim().length < 0)) {
        errors.push({ field: 'blogId', message: 'Invalid post blogId' });
    }
    return errors;
};
exports.postInputDtoValidation = postInputDtoValidation;
