/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.increments();
    table.string("username").notNullable();
    table.string("email").notNullable();
    table.string("password").notNullable();
    table.string("profile");
    table.timestamp("created_at").defaultTo(knex.fn.now())
  }).createTable("admin", function (table) {
    table.increments();
    table.string("username").notNullable();
    table.string("email").notNullable();
    table.string("password").notNullable();
    table.string("profile");
    table.timestamp("created_at").defaultTo(knex.fn.now())
  }).createTable("products",function (table){
    table.increments();
    table.string("name").notNullable();
    table.string("category").notNullable();
    table.integer("price").notNullable();
    table.string("description").notNullable();
    table.string("image").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now())
  }).createTable("cart",function(table){
    table.increments();
    table.integer('user_id',10).unsigned().references("users.id");
    table.integer('product_id',10).unsigned().references("products.id");
    table.integer('quantity').notNullable();
  })
  .createTable("orders",function(table){
    table.increments();
    table.string("delivery_mobileNumber").notNullable();
    table.string("delivery_pinCode").notNullable();
    table.string("delivery_address").notNullable();
    table.integer('user_id',10).unsigned().references("users.id");
    table.string("mode_of_payment").notNullable();
    table.string("order_status").notNullable();
    table.integer("total").notNullable();
    table.text("products").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now())
  }).createTable("deliveries",function(table){
    table.increments();
    table.string("delivery_mobileNumber").notNullable();
    table.string("delivery_pinCode").notNullable();
    table.string("delivery_address").notNullable();
    table.string("mode_of_payment").notNullable();
    table.text("products").notNullable();
    table.string("order_status").notNullable();
    table.integer('user_id',10).unsigned().references("users.id");
    table.timestamp('order_date').notNullable();
    table.integer("total").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now())
  })

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("cart").dropTable("users").dropTable("products").dropTable("orders").dropTable("deliveries").dropTable('admin')
};
