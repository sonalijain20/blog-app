"use strict";

const config = require("../../knexfile");
const knex = require("knex")(config); // db configuration file
module.exports = {
  knex,
};
