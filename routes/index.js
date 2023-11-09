"use strict";

const express = require("express");
const router = express.Router();
const AuthTokenMiddleware = require("../middleware/authToken");
const { register, login } = require("../controllers/authenticate");
const { userProfile } = require("../controllers/users");
const { getArticles, createArticle, updateArticle, deleteArticle } = require("../controllers/articles");

router.post("/register", async function (req, res) {
    return await register(req, res);
});

router.post("/login", async function (req, res) {
    return await login(req, res);
});

router.get(
    "/get-profile",
    AuthTokenMiddleware.verifyUser,
    async function (req, res) {
        return await userProfile(req, res);
    }
);

router.get("/articles", async function (req, res) {
    return await getArticles(req, res);
});

router.post(
    "/article",
    AuthTokenMiddleware.verifyUser,
    async function (req, res) {
        return await createArticle(req, res);
    }
);

router.put(
    "/article/:articleId",
    AuthTokenMiddleware.verifyUser,
    async function (req, res) {
        return await updateArticle(req, res);
    }
);

router.delete(
    "/article/:articleId",
    AuthTokenMiddleware.verifyUser,
    async function (req, res) {
        return await deleteArticle(req, res);
    }
);

module.exports = router;
