var knex = require("../knex/knex");
var bcrypt = require("bcrypt");
const e = require("express");

module.exports = {
  delivering: (orderId) => {
    return new Promise(async (resolve, reject) => {
      knex
        .select()
        .from("orders")
        .where("id", orderId)
        .then((res) => {
          if (res.length) {
            knex("deliveries")
              .insert({
                delivery_mobileNumber: res[0].delivery_mobileNumber,
                delivery_pinCode: res[0].delivery_pinCode,
                delivery_address: res[0].delivery_address,
                total: res[0].total,
                order_status: "Delivered",
                user_id: res[0].user_id,
                mode_of_payment: res[0].mode_of_payment,
                order_date: res[0].created_at,
                products: res[0].products,
              })
              .then(() => {
                knex
                  .select()
                  .from("orders")
                  .where("id", orderId)
                  .del()
                  .then(() => {
                    resolve();
                  });
              });
          }
        });
    });
    // });
  },
  getDeliveries: (userId) => {
    return new Promise(async (resolve, reject) => {
      knex
        .select()
        .from("deliveries")
        .where("user_id", userId)
        .then((res) => {
          resolve(res);
        });
    });
  },
};
