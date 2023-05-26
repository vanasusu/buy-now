var knex = require("../knex/knex");
module.exports = {
  addProduct: (product, callback) => {
    product.price = parseInt(product.price);

    knex("products")
    .insert(product)
      .then(function (data) {
        console.log(data)
        callback(data[0]);
      });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      knex
        .select()
        .from("products")
        .then((products) => {
          resolve(products);
        });
    });
  },
  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      knex
        .select()
        .from("products")
        .where("id",proId).del()
        
        .then((response) => {
          resolve(response);
        });
    });
  },
  getProductsDetails: (proId) => {
    return new Promise((resolve, reject) => {
      knex
        .select()
        .from("products")
        .where("id",proId)
        .then((product) => {
          resolve(product);
        });
    });
  },
  updateProductImage: (productid, url) => {
    return new Promise((resolve, reject) => {
      knex
        .select()
        .from("products")
        .where("id", productid)
        .update({
          image: url,
        })
        .then(() => {
          resolve();
        });
    });
  },
  updateProduct: (proId, proDetails) => {
    proDetails.price = parseInt(proDetails.price);
    return new Promise((resolve, reject) => {
      knex
        .select()
        .from("products")
        .where("id",proId).update({
          name: proDetails.name,
          description: proDetails.description,
          price: proDetails.price,
          category: proDetails.category,
        }).then((response) => {
          resolve();
        });
    });
  },
  getProduct: (proId) => {
    return new Promise(async (resolve, reject) => {
      knex
        .select()
        .from("products")
        .where("id",proId)
        .then((product) => {
          resolve(product);
        });
    });    
  },
};
