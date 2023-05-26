var knex = require("../knex/knex");

const bcrypt = require("bcrypt");
module.exports = {
  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      knex.select().from('orders').then((res)=>resolve(res))
    });
  },
  postAOrderAsShipped: (orderId) => {
    return new Promise((resolve, reject) => {
      knex.select().from('orders').where("id",orderId).update({
        order_status:"Shipped"
      }).then((response) => {
        resolve();
      });
    });
  },
  cancelShipped: (orderId) => {
    return new Promise((resolve, reject) => {

      knex.select().from('orders').where("id",orderId).update({
        order_status:"Placed"
      }).then((response) => {
        resolve();
      });
    });
  },
  refunded: (orderId) => {
    return new Promise((resolve, reject) => {
      knex.select().from('orders').where("id",orderId).update({
        order_status:"Refunded"
      }).then((response) => {
        resolve();
      });
    });
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      knex.select().from('users').then((res)=>resolve(res))
    });
  },
  doSignup: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      knex
        .select()
        .from("admin")
        .where("email", adminData.email)
        .then(async (user) => {
          if (user.length == 0) {
            knex("admin")
              .insert({
                username: adminData.username,
                email: adminData.email,
                password: (adminData.password = await bcrypt.hash(
                  adminData.password,
                  10
                )),
                profile: "",
              })
              .then((data) => {
                response.data = data;
                console.log(data)
                response.status = true;
                resolve(response);
              });
          } else {
            resolve({ status: false });
          }
        });
    });
  },
  doLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      knex
        .select()
        .from("admin")
        .where("email", adminData.email)
        .then((res) => {
          if (res.length) {
            bcrypt
              .compare(adminData.password, res[0].password)
              .then((status) => {
                if (status) {
                  response.admin = res;
                  response.status = true;
                  resolve(response);
                } else {
                  resolve({ status: false });
                }
              });
          } else {
            resolve({ status: false });
          }
        });
    });
  },
  getUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      knex.select().from('users').where("id",userId).then((res)=>{
        
        resolve(res)})
     
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
  getAllDeliveries: () => {
    return new Promise(async (resolve, reject) => {
      knex.select().from('deliveries').then((res)=>{
        
        console.log(res)
        resolve(res)})
    });
  },
};
