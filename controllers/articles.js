"use-strict";
const { knex } = require("../schema/utils/knex");

/**
 * Controller function to get all the articles
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getArticles = async function (req, res) {
    try {
        const { pageNo = 1, pageSize = 20 } = req.query;

        if (pageNo < 1 || pageSize < 1)
            return { success: false, message: "Page size and page no should be greater than 1" }

        const articles = await knex('articles').select(`*`)
            .limit(pageSize).offset((pageNo - 1) * pageSize);

        return res.status(200).json(articles);

    } catch (error) {
        console.error("Error while fetching articles: ", error);
        return res.status(500).json({
            statusCode: 500,
            message: error.message || "Something went wrong"
        })
    }
}

/**
 * Controller function to create an article
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createArticle = async function (req, res) {
    try {
        //validate the request body
        const validationErrors = validatePayload(req.body);

        //return if validation errors found
        if (validationErrors.errors.length) {
            return res.status(400).json(validationErrors); //validation errors, return 400
        }

        //save the article info in database
        const articleInfo = await knex('articles').insert({
            content: req.body.content.trim(),
            userId: req.user.id
        }).returning(`*`);

        return res.status(200).json({
            statusCode: 200,
            data: articleInfo[0]
        });
    } catch (error) {
        console.error("Error happened while creating article: ", error);
        return res.status(500).json({
            statusCode: 500,
            message: error.message || "Something went wrong"
        })
    }
}

/**
 * Controller function to delete an article
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const deleteArticle = async function (req, res) {
    try {
        const { articleId } = req.params;
        //check if article belongs to the logged in user
        const articleInfo = await knex('articles').select(`*`).where({
            id: articleId,
            userId: req.user.id
        });
        //return if does not belongs to the user
        if (!articleInfo.length) {
            return res.status(404).json({
                statusCode: 404,
                message: "Article not found or you don't have access to it."
            })
        }

        //delete the article
        await knex('articles').where({
            id: articleId,
            userId: req.user.id
        }).del();

        return res.status(200).json({
            statusCode: 200,
            message: "Articles deleted!"
        })
    } catch (error) {
        console.error("Error while deleting article: ", error);
        return res.status(500).json({
            statusCode: 500,
            message: error.message || "Something went wrong"
        })
    }
}

/**
 * Controller function to update an article
 * @param {*} req 
 * @param {*} res 
 */
const updateArticle = async function (req, res) {
    //validate the request body
    const validationErrors = validatePayload(req.body, 'update', req.params);

    //return if validation errors found
    if (validationErrors.errors.length) {
        return res.status(400).json(validationErrors); //validation errors, return 400

    }
    const articleInfo = await knex('articles').where({
        id: req.params.articleId,
        userId: req.user.id
    })

    if (!articleInfo.length) {
        return res.status(404).json({
            statusCode: 404,
            message: "Article not found or you don't have access to it."
        })
    }

    await knex('articles').where({
        id: req.params.articleId
    }).update({
        content: req.body.content.trim()
    })

    return res.status(200).json({
        statusCode: 200,
        message: "Article updated!"
    })
}


const validatePayload = function (dto, action, params) {
    const validationErrors = {
        errors: [],
    };

    if (!dto.content || typeof dto.content !== 'string') {
        validationErrors.errors.push({
            field: "content",
            error: "Content is mising or must be string",
        });
    } else if (dto.content.trim().length > 700 || dto.content.trim().length < 1) {
        validationErrors.errors.push({
            field: "content",
            error: "Content must be upto 700 characters",
        });
    }

    if (action == 'update') {
        if (!params.articleId) {
            validationErrors.errors.push({
                field: "articleId",
                error: "articleId is required in case of update"
            })
        }
    }

    return validationErrors;

}

module.exports = { getArticles, createArticle, deleteArticle, updateArticle };