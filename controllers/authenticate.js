"use-strict";
const emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { knex } = require("../schema/utils/knex");
const saltRounds = process.env.SALT_ROUNDS || 10;

/**
 * Controller function to register a new user
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const register = async function (req, res) {
    try {
        //validate the request body
        const validationErrors = validatePayload(req.body);

        //return if there is any validation error
        if (validationErrors.errors.length) {
            return res.status(400).json(validationErrors);
        }
        else {
            //check if user already exists with given email 
            const userExists = await knex('users').select(`*`).where({
                email: req.body.email,
            });

            //return if exists
            if (userExists.length) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "User already exists with provided email",
                });
            } else {
                const { email, firstName, lastName } = req.body;

                //encrypt the password
                const hash = await bcrypt.hash(req.body.password, saltRounds);

                //create a user 
                await knex('users')
                    .insert({
                        email,
                        firstName,
                        lastName,
                        password: hash,
                    })
                return res.status(200).json({
                    statusCode: 200,
                    message: "Registered successfully! Please Login to continue",
                });
            }
        }
    } catch (error) {
        console.error("Error happened while registeration: ", error);
        return res.status(500).json({
            statusCode: 500,
            message: error.message || "Something went wrong"
        })
    }
}

/**
 * Controller function to handle login and generate a access token
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const login = async function (req, res) {
    try {
        //validate the request body
        const validationErrors = validatePayload(req.body);

        //return if there is any validation error
        if (validationErrors.errors.length) {
            return res.status(400).json(validationErrors); //validation errors, return 400
        }
        else {
            //fetch the user information from database
            const userInfo = await knex('users').select(`*`).where({
                email: req.body.email,
            });

            //return if user not found
            if (!userInfo.length) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "User does not exists",
                });
            } else {
                //compare the hash saved in database with password provided in requesrt
                const passwordMatch = await bcrypt.compare(
                    req.body.password,
                    userInfo[0].password
                );
                //generate JWT if password matches
                if (passwordMatch) {
                    const accessToken = await generateJWToken(userInfo[0]); // generate JWT token
                    if (accessToken) {
                        const user = {
                            email: userInfo[0].email,
                            id: userInfo[0].id,
                            accessToken,
                            issuedAt: new Date(),
                        };
                        return res.status(200).json({
                            message: "Login Successful!",
                            statusCode: 200,
                            user,
                        });
                    }
                } else {
                    return res.json({
                        statusCode: 401,
                        message: "Incorrect password",
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error while login: ", error);
    }
}
/**
 * Function to validate the payload of register and login
 * @param {*} dto 
 * @returns 
 */
const validatePayload = function (dto) {
    const validationErrors = {
        errors: [],
    };

    //validate email address
    if (!dto.email) {
        validationErrors.errors.push({
            field: "email",
            error: "Email address is mising",
        });
    } else if (!emailValidator.validate(dto.email)) {
        validationErrors.errors.push({
            field: "email",
            error: "Email address is not valid",
        });
    }

    //validate password
    if (!dto.password) {
        validationErrors.errors.push({
            field: "password",
            error: "password is mising",
        });
    } else if (dto.password.length < 8) {
        validationErrors.errors.push({
            field: "password",
            error: "password length should be atleast 8 characters",
        });
    }

    //validate first name
    if (dto.firstName && typeof dto.firstName !== "string") {
        validationErrors.errors.push({
            field: "First name",
            error: "Invalid first name",
        });
    }

    //validate last name
    if (dto.lastName && typeof dto.lastName !== "string") {
        validationErrors.errors.push({
            field: "Last name",
            error: "Invalid last name",
        });
    }
    return validationErrors;
}

const generateJWToken = async function (userInfo) {
    try {
        return await jwt.sign({ userInfo }, process.env.JWT_SECRET_KEY, {
            expiresIn: "8h",
        });
    } catch (error) {
        console.error("Error while generating token: ", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Internal Server error",
        });
    }
}

module.exports = { register, login }