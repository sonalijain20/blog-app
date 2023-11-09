"use-strict";

const { knex } = require("../schema/utils/knex");

/**
 * Controller function to get the user profile
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const userProfile = async function (req, res) {
    try {
        const userInfo = await knex('users').select(`email`, `firstName`, `lastName`).where({
            id: req.user.id,
        });
        return res.status(200).json(userInfo[0]);
    } catch (error) {
        console.error("Error while fetching the profile information: ", error);
        return res.status(500).json({
            statusCode: 500,
            message: error.message || "Something went wrong"
        })
    }
}



module.exports = { userProfile }