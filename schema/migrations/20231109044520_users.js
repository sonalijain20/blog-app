"use-strict";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("users", function (table) {
        table.increments("id").primary();
        table.string("email").notNullable().unique();
        table.string("firstName", 255);
        table.string("lastName", 255);
        table.string("password", 255).notNullable();
        table.timestamp("createdAt").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("users");
};
