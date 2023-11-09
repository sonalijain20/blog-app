"use-strict";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("articles", function (table) {
        table.increments("id").primary();
        table.string("content", 700);
        table
            .integer("userId")
            .unsigned()
            .notNullable()
            .references("users.id");
        table.timestamp("createdAt").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("articles");
};
