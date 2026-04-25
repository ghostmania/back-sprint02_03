"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoInputDtoValidation = void 0;
exports.resolvePublicationDate = resolvePublicationDate;
const video_1 = require("../types/video");
const videoInputDtoValidation = (data) => {
    const errors = [];
    if (!data.title ||
        typeof data.title !== 'string' ||
        data.title && data.title.trim().length > 40) {
        errors.push({ field: 'title', message: 'Invalid title' });
    }
    if (!data.author ||
        typeof data.author !== 'string' ||
        data.author && data.author.trim().length > 20) {
        errors.push({ field: 'author', message: 'Invalid author' });
    }
    if (data.canBeDownloaded && typeof data.canBeDownloaded !== 'boolean') {
        errors.push({
            field: 'canBeDownloaded',
            message: 'Invalid canBeDownloaded',
        });
    }
    if ((data.minAgeRestriction && typeof data.minAgeRestriction === 'number' &&
        (data.minAgeRestriction > 18 || data.minAgeRestriction < 1))) {
        errors.push({
            field: 'minAgeRestriction',
            message: 'Invalid minAgeRestriction',
        });
    }
    if (data.publicationDate && typeof data.publicationDate !== 'string' || data.publicationDate &&
        Number(data.createdAt) > Number(resolvePublicationDate(new Date(data.publicationDate).getTime()))) {
        console.log('invalid publicationDate');
        errors.push({
            field: 'publicationDate',
            message: 'Invalid publicationDate',
        });
    }
    if (!data.availableResolutions || !Array.isArray(data.availableResolutions) ||
        !data.availableResolutions.length) {
        errors.push({
            field: 'availableResolutions',
            message: 'availableResolutions must be array',
        });
    }
    else if (data.availableResolutions.length) {
        const existingResolutions = Object.values(video_1.Resolution);
        if (data.availableResolutions.length > existingResolutions.length ||
            data.availableResolutions.length < 1) {
            errors.push({
                field: 'availableResolutions',
                message: 'Invalid availableResolutions',
            });
        }
        for (const resolution of data.availableResolutions) {
            if (!existingResolutions.includes(resolution)) {
                errors.push({
                    field: 'availableResolutions',
                    message: 'Invalid resolution:' + resolution,
                });
                break;
            }
        }
    }
    return errors;
};
exports.videoInputDtoValidation = videoInputDtoValidation;
function resolvePublicationDate(date) {
    let addition = 24 * 60 * 60 * 1000;
    let oneDayLater = date + addition;
    return new Date(oneDayLater).toISOString();
}
