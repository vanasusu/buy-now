var knex = require("../knex/knex");
var bcrypt = require("bcrypt");
const e = require("express");

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      knex
        .select()
        .from("users")
        .where("email", userData.email)
        .then(async (user) => {
          if (user.length == 0) {
            knex("users")
              .insert({
                username: userData.username,
                email: userData.email,
                password: (userData.password = await bcrypt.hash(
                  userData.password,
                  10
                )),
                profile: "",
              })
              .then((data) => {
                response.data = data;
                response.status = true;
                resolve(response);
              });
          } else {
            resolve({ status: false });
          }
        });
    });
  },
  getSessionUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      knex
        .select()
        .from("users")
        .where("id", userId)
        .then((user) => {
          resolve(user);
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      knex
        .select()
        .from("users")
        .where("email", userData.email)
        .then((user) => {
          if (user.length > 0) {
            bcrypt
              .compare(userData.password, user[0].password)
              .then((status) => {
                if (status) {
                  response.user = user;
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
  editProfile: (userId, details) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      knex
        .select()
        .from("users")
        .where("id", userId)
        .update({
          username: details.username,
          email: details.email,
        })
        .then(() => {
          resolve();
        });
    });
  },
  deleteAccount: (account) => {
    return new Promise(async (resolve, reject) => {
      knex
        .select()
        .from("users")
        .where("email", account.email)
        .then((user) => {
          if (user.length > 0) {
            bcrypt
              .compare(account.password, user[0].password)
              .then((status) => {
                if (status) {
                  knex("users")
                    .where("email", account.email)
                    .del()
                    .then((details) => {
                      console.log(details);
                      resolve({ status: true });
                    });
                } else {
                  resolve({ status: false });
                }
              });
          }
        });
    });
  },
  setProfilePicture: (userId, url) => {
    return new Promise((resolve, reject) => {
      knex
        .select()
        .from("users")
        .where("id", userId)
        .update({
          profile: url,
        })
        .then(() => {
          resolve();
        });
    });
  },
  removeProfilePicture: (userId) => {
    return new Promise((resolve, reject) => {
      knex
        .select()
        .from("users")
        .where("id", userId)
        .update({
          profile: "",
        })
        .then(() => {
          resolve();
        });
    });
  },
};
