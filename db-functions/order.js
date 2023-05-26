var knex = require("../knex/knex");
var bcrypt = require("bcrypt");

module.exports = {
  placeOrder: (order, products, total) => {
    return new Promise(async (resolve, reject) => {
      let status =
        order.paymentMethod === "Cash on Delivery" ? "Placed" : "Pending";

      knex("orders")
        .insert({
          delivery_mobileNumber: order.mobile,
          delivery_pinCode: order.pincode,
          delivery_address: order.address,
          user_id: order.userId,
          products: JSON.stringify(products),
          mode_of_payment: order.paymentMethod,
          order_status: status,
          total: total,
        })
        .then((response) => {
          knex
            .select()
            .from("cart")
            .where("user_id", order.userId)
            .del()
            .then(() => {
              resolve(response);
            });
        });
    });
  },

  buyNow: (order, details) => {
    return new Promise(async (resolve, reject) => {
      order.total = parseInt(order.total);
      let status =
        order.paymentMethod === "Cash on Delivery" ? "Placed" : "Pending";
      knex("orders")
        .insert({
          delivery_mobileNumber: order.mobile,
          delivery_pinCode: order.pincode,
          delivery_address: order.address,
          user_id: order.userId,
          products: JSON.stringify([
            {
              quantity: 1,
              product_id: order.productId,
              user_id: order.userId,
              name: details.name,
              image: details.image,
              description: details.description,
              category: details.category,
              price: order.total,
            },
          ]),
          mode_of_payment: order.paymentMethod,
          order_status: status,
          total: order.total,
        })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAllOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      knex
        .select()
        .from("orders")
        .where("user_id", userId)
        .then((res) => {
          resolve(res);
        });
    });
  },
  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      knex
        .select(["products"])
        .from("orders")
        .where("id", orderId)
        .then((res) => {
          if (res.length) {
            resolve(JSON.parse(res[0].products));
          } else {
            resolve([]);
          }
        });
    });
  },

  cancelOrder: (orderId, method, status) => {
    return new Promise((resolve, reject) => {
      if (method == "Cash on Delivery") {
        knex
          .select()
          .from("orders")
          .where("id", orderId)
          .del()
          .then(() => {
            resolve();
          });
      } else if (status == "Pending") {
        knex
          .select()
          .from("orders")
          .where("id", orderId)
          .del()
          .then(() => {
            resolve();
          });
      } else {
        knex
          .select()
          .from("orders")
          .where("id", orderId)
          .update({
            order_status: "Cancelled",
          })
          .then(() => {
            resolve();
          });
      }
    });
  },
  yesIGotRefund: (orderId) => {
    return new Promise((resolve, reject) => {
      knex
        .select()
        .from("orders")
        .where("id", orderId).del()
        .then((res) => {
          resolve();
        });
    });
  },
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      knex
        .select()
        .from("orders")
        .where("id", orderId)
        .update({ order_status: "Placed" })
        .then(() => {
          resolve();
        });
    });
  },
  changePaymentMode: (orderId) => {
    return new Promise((resolve, reject) => {
      knex
        .select()
        .from("orders")
        .where("id", orderId)
        .update({ mode_of_payment: "Cash on Delivery",order_status: "Placed" })
        .then(() => {
          resolve();
        });
    });
  },
  getTotalOfOrder: (orderId, userId) => {
    return new Promise(async (resolve, reject) => {
      knex
        .select()
        .from("orders")
        .where("id", orderId)
        .where("user_id", userId)
        .then((res) => {
          resolve(res[0].total);
        });
    });
  },
};
