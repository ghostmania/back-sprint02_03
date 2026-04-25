"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogInputDtoValidation = void 0;
const blogInputDtoValidation = (data) => {
    const errors = [];
    if (!data.name || typeof data.name !== 'string') {
        errors.push({ field: 'name', message: 'Invalid blog name' });
    }
    if (!data.description || typeof data.description !== 'string') {
        errors.push({ field: 'description', message: 'Invalid blog description' });
    }
    if (!data.websiteUrl || typeof data.websiteUrl !== 'string') {
        errors.push({ field: 'websiteUrl', message: 'Invalid blog websiteUrl' });
    }
    return errors;
};
exports.blogInputDtoValidation = blogInputDtoValidation;
