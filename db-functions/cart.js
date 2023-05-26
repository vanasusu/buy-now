var knex = require("../knex/knex");

module.exports = {
  addToCart: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      knex
        .select()
        .from("cart")
        .where("user_id", userId)
        .where("product_id", proId)
        .then((usercart) => {
          if (usercart.length) {
            knex
              .select()
              .from("cart")
              .where("user_id", userId)
              .where("product_id", proId)
              .increment("quantity", 1)
              .then((response) => {
                  resolve("no");
              });
          } else {
            knex("cart")
              .insert({
                user_id: userId,
                product_id: proId,
                quantity: 1,
              })
              .then((response) => {
                  resolve("yes");
              });
          }
        });
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      knex
        .select()
        .from("cart")
        .where("user_id", userId)
        .innerJoin("products", "cart.product_id", "=", "products.id")
        .then((response) => {
          if (response.length) {
            resolve(response);
          }
        });
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      knex
        .select()
        .from("cart")
        .where("user_id", userId)
        .then((usercart) => {
          if (usercart.length) {
            count = usercart.length;
          }
          resolve(count);
        });
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        knex
          .select()
          .from("cart")
          .where("product_id", details.product)
          .where("user_id", details.user)
          .del()
          .then(() => {
                resolve({ removeProduct: true });
          
          });
      } else {
        knex
          .select()
          .from("cart")
          .where("product_id", details.product)
          .where("user_id", details.user)
          .increment("quantity", details.count)
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  removeCartProduct: (cartId, userId) => {
    return new Promise((resolve, reject) => {
      knex
        .select()
        .from("cart")
        .where("product_id", cartId)
        .where("user_id", userId)
        .del()
        .then((response) => {
              resolve(response);
            });
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      knex
        .select()
        .from("cart")
        .where("user_id", userId)
        .innerJoin("products", "cart.product_id", "=", "products.id")
        .then((response) => {
          var total = 0;
          if (response.length) {
            var g = 0;
            for (const element of response) {
              let price = element.price;
              let quantity = element.quantity;
              g = g + price * quantity;
              // console.log(price*quantity)
            }
            total = g;
          }
          // console.log(total)
          resolve(total);
        });
    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      knex
        .select()
        .from("cart")
        .where("user_id", userId)
        .innerJoin("products", "cart.product_id", "=", "products.id")
        .then((response) => {
          if (response.length) {
            resolve(response);
          }
        });
    });
  },
};
