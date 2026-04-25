"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogsRouter = void 0;
const express_1 = require("express");
const videos_db_1 = require("../../db/videos.db");
const http_statuses_1 = require("../../core/types/http-statuses");
const videoInputDtoValidation_1 = require("../validation/videoInputDtoValidation");
const error_utils_1 = require("../../core/utils/error.utils");
const get_blog_list_hadler_1 = require("./handlers/get-blog-list.hadler");
exports.blogsRouter = (0, express_1.Router)({});
exports.blogsRouter
    .get('', get_blog_list_hadler_1.getBlogsListHandler)
    .get('/:id', (req, res) => {
    const id = req.params.id;
    const driver = videos_db_1.db.videos.find((d) => d.id === Number(id));
    if (!driver) {
        res
            .status(http_statuses_1.HttpStatus.NotFound)
            .send((0, error_utils_1.createErrorMessages)([{ field: 'id', message: 'Video not found' }]));
        return;
    }
    res.status(http_statuses_1.HttpStatus.Ok).send(driver);
})
    .post('', (req, res) => {
    var _a, _b;
    const errors = (0, videoInputDtoValidation_1.videoInputDtoValidation)(req.body);
    if (errors.length > 0) {
        res.status(http_statuses_1.HttpStatus.BadRequest).send((0, error_utils_1.createErrorMessages)(errors));
        return;
    }
    let date = Date.now();
    const newVideo = {
        id: videos_db_1.db.videos.length ? videos_db_1.db.videos[videos_db_1.db.videos.length - 1].id + 1 : 1,
        title: req.body.title,
        author: req.body.author,
        canBeDownloaded: (_a = req.body.canBeDownloaded) !== null && _a !== void 0 ? _a : false,
        minAgeRestriction: (_b = req.body.minAgeRestriction) !== null && _b !== void 0 ? _b : null,
        availableResolutions: req.body.availableResolutions,
        createdAt: new Date(date).toISOString(),
        publicationDate: (0, videoInputDtoValidation_1.resolvePublicationDate)(date),
    };
    videos_db_1.db.videos.push(newVideo);
    res.status(http_statuses_1.HttpStatus.Created).send(newVideo);
})
    .put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = videos_db_1.db.videos.findIndex((v) => v.id === id);
    if (index === -1) {
        res
            .status(http_statuses_1.HttpStatus.NotFound)
            .send((0, error_utils_1.createErrorMessages)([{ field: 'id', message: 'Video not found' }]));
        return;
    }
    const driver = videos_db_1.db.videos[index];
    const errors = (0, videoInputDtoValidation_1.videoInputDtoValidation)(Object.assign(Object.assign({}, req.body), { createdAt: driver.createdAt }));
    if (errors.length > 0) {
        res.status(http_statuses_1.HttpStatus.BadRequest).send((0, error_utils_1.createErrorMessages)(errors));
        return;
    }
    driver.title = req.body.title;
    driver.author = req.body.author;
    driver.canBeDownloaded = req.body.canBeDownloaded;
    driver.minAgeRestriction = req.body.minAgeRestriction;
    driver.publicationDate = req.body.publicationDate;
    driver.availableResolutions = req.body.availableResolutions;
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
})
    .delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = videos_db_1.db.videos.findIndex((v) => v.id === id);
    if (index === -1) {
        res
            .status(http_statuses_1.HttpStatus.NotFound)
            .send((0, error_utils_1.createErrorMessages)([{ field: 'id', message: 'Video not found' }]));
        return;
    }
    videos_db_1.db.videos.splice(index, 1);
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
});
