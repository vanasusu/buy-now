var express = require("express");
const product = require("../db-functions/product");
var router = express.Router();
var userHelpers = require("../db-functions/user");
var cartHelpers = require("../db-functions/cart");
var orderHelpers = require("../db-functions/order");
var cloudinary = require("../uploader_cloudinary").v2;
var uploader = require("../uploader_multer");
var knex_populate = require("knex-populate");
const deliveries = require("../db-functions/deliveries");
const { STRIPE_SECRET_KEY } = require("../keys");
const {
  loginform,
  signupform,
  editform,
  deleteform,
} = require("../forms/user-forms");
const { paypending, checkout, buynow } = require("../forms/item-form");
var stripe = require("stripe")(STRIPE_SECRET_KEY);

const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/signin");
  }
};

router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }

  product.getAllProducts().then((products) => {
    res.render("userPanel/items/productDetails", {
      products,
      user,
      title: "Online Buy",
      cartCount,
    });
  });
});

router.get("/signin", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("userPanel/profile/signin", {
      title: "Online Buy | Signin",
      loginErr: req.session.userLoginErr,
    });
    req.session.userLoginErr = false;
  }
});
router.post("/signin", async (req, res) => {
  loginform.handle(req.body, {
    success: function (form) {
      res.setHeader("Content-Type", "application/json");
      userHelpers.doLogin(form.data).then((response) => {
        if (response.status) {
          req.session.user = response.user[0];
          req.session.userLoggedIn = true;
          res.redirect("/");
        } else {
          req.session.userLoginErr = "Invalid Email or Password";
          res.redirect("/signin");
        }
      });
    },
    error: function (form) {
      res.redirect("/signin");
    },
  });
});
router.get("/signout", (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect("signin");
});

router.get("/signup", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  }
  res.render("userPanel/profile/signup", {
    title: "Online Buy | Signup",
    signupErr: req.session.userSignupErr,
  });
  req.session.userSignupErr = false;
});

router.post("/signup", (req, res) => {
  signupform.handle(req.body, {
    success: function (form) {
      res.setHeader("Content-Type", "application/json");
      userHelpers.doSignup(form.data).then(async (response) => {
        if (response.status) {
          let userDetails = await userHelpers.getSessionUser(response.data[0]);
          req.session.user = userDetails[0];
          req.session.userLoggedIn = true;
          res.redirect("/");
        } else {
          req.session.userSignupErr = "Email already registered";
          res.redirect("/signup");
        }
      });
    },
    error: function (form) {
      res.redirect("/signup");
    },
  });
});
router.get("/account/:username", verifyLogin, async (req, res) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  res.render("userPanel/profile/userProfile", {
    user: req.session.user,
    title: req.session.user.username + " | Profile",
    cartCount,
  });
});

router.get("/edit-user-profile", verifyLogin, async (req, res) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  res.render("userPanel/profile/editUserProfile", {
    user: req.session.user,
    title: "Profile",
    cartCount,
  });
});
router.post("/edit-user-profile/:id", verifyLogin, (req, res) => {
  editform.handle(req.body, {
    success: function (form) {
      res.setHeader("Content-Type", "application/json");
      req.session.user.username = form.data.username;
      req.session.user.email = form.data.email;
      req.session.userLoggedIn = true;
      userHelpers.editProfile(req.params.id, form.data).then(() => {
        res.redirect("/account/" + req.session.user.username);
      });
    },
    error: function (form) {
      res.redirect(res.redirect("/edit-user-profile/" + req.params.id));
    },
  });
});

router.get("/remove-account", verifyLogin, async (req, res) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  res.render("userPanel/profile/accountDelete", {
    title: req.session.user.username + " | Delete",
    cartCount,
    user: req.session.user,
  });
});
router.post("/remove-account", verifyLogin, (req, res) => {
  deleteform.handle(req.body, {
    success: function (form) {
      res.setHeader("Content-Type", "application/json");
      userHelpers
    .deleteAccount({
      password: form.data.password,
      username: req.session.user.username,
      email: req.session.user.email,
    })
    .then((state) => {
      if (state.status == true) {
        req.session.user = null;
        req.session.userLoggedIn = false;
        res.json({ status: true });
      } else {
        res.json({ status: false });
      }
    });
    },
    error: function (form) {
      res.redirect(res.redirect("/remove-account"));
    },
  });
});

router.get("/edit-profile-photo", verifyLogin, async (req, res) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  res.render("userPanel/profile/editProfilePicture", {
    title: "Online Now | Edit Profile Photo",
    user: req.session.user,
    cartCount,
  });
});

router.post(
  "/edit-profile-photo",
  verifyLogin,
  uploader.single("image"),
  async (req, res) => {
    const upload = await cloudinary.uploader.upload(req.file.path);

    userHelpers
      .setProfilePicture(req.session.user.id, upload.secure_url)
      .then(() => {
        req.session.user.profile = upload.secure_url;
        res.redirect("/account/" + req.session.user.username);
      });
  }
);
router.get("/delete-profile-photo", verifyLogin, async (req, res) => {
  userHelpers.removeProfilePicture(req.session.user.id).then(() => {
    req.session.user.profile = "";
    res.redirect("/account/" + req.session.user.name);
  });
});

router.get("/cart", verifyLogin, async (req, res) => {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  if (cartCount == 0) {
    res.send(
      '<head><title>Online Buy | Cart</title><link rel="icon" href="https://png.pngtree.com/element_our/sm/20180415/sm_5ad31a9302828.jpg" /></head><div style="color:black;width:100%;display:flex;justify-content:center;height:100vh;flex-direction:column;align-items:center;font-family:sans-serif;"><h1>Your Cart is Empty</h1><a href="/" style="text-decoration:none;width:100px;padding:15px;border-radius:15px;background:#0d6efd;color:white;" >Add Products</a></div>'
    );
  } else {
    let carts = await cartHelpers.getCartProducts(req.session.user.id);
    let total = await cartHelpers.getTotalAmount(req.session.user.id);
    res.render("userPanel/items/shoppingCart", {
      title: "Online Buy | Cart",
      user,
      carts,
      cartCount,
      total,
    });
  }
});

router.get("/add-cart/:id", verifyLogin, (req, res) => {
  cartHelpers.addToCart(req.params.id, req.session.user.id).then((data) => {
    if (data == "yes") {
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  });
});
router.post("/alter-item-quantity", verifyLogin, (req, res, next) => {
  cartHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await cartHelpers.getTotalAmount(req.body.user);
    res.json(response);
  });
});
router.get("/remove-cart-item/:id", verifyLogin, (req, res) => {
  cartHelpers
    .removeCartProduct(req.params.id, req.session.user.id)
    .then((response) => {
      res.redirect("/cart");
    });
});

router.get("/confirm-order", verifyLogin, async (req, res) => {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  if (cartCount == 0) {
    res.send(
      '<head><title>Shopping Cart</title><link rel="icon" href="https://png.pngtree.com/element_our/sm/20180415/sm_5ad31a9302828.jpg" /></head><div style="color:black;width:100%;display:flex;justify-content:center;height:100vh;flex-direction:column;align-items:center;font-family:sans-serif;"><h1>Your Cart is Empty</h1><a href="/" style="text-decoration:none;width:100px;padding:15px;border-radius:15px;background:#0d6efd;color:white;" >Add Products</a></div>'
    );
  } else {
    let total = await cartHelpers.getTotalAmount(req.session.user.id);
    res.render("userPanel/items/checkoutOrderDetails", {
      title: "Confirm Order",
      total,
      user,
      cartCount,
    });
  }
});

router.post("/confirm-order", verifyLogin, async (req, res) => {
   checkout.handle(req.body, {
    success: async function (form) {
      
      res.setHeader("Content-Type", "application/json");
      let products = await cartHelpers.getCartProductList(form.data.userId);
      let total = await cartHelpers.getTotalAmount(form.data.userId);
    
      orderHelpers.placeOrder(form.data, products, total).then((orderId) => {
        if (form.data.paymentMethod === "Cash on Delivery") {
          res.json({ codSuccess: true });
        } else {
          res.json({ payment: "online", orderId: orderId, total: total });
        }
      });
    },
    error:function(form){
      res.redirect("/confirm-order")
    }})
  
});

router.post("/create-checkout-session", verifyLogin, async (req, res) => {
  try {
    var session = await stripe.checkout.sessions.create({
      success_url:
        req.protocol +
        "://" +
        req.headers.host +
        "/checkout-success?session_id={CHECKOUT_SESSION_ID}",
      payment_method_types: ["card"],
      cancel_url: req.protocol + "://" + req.headers.host + "/checkout-failed",
      line_items: [
        {
          price_data: {
            currency: "INR",
            product_data: {
              name: "#" + req.body.id,
            },
            unit_amount: parseInt(req.body.total) * 100,
          },
          quantity: 1,
        },
      ],

      mode: "payment",
    });
    res.send({ id: session.id });
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
});

router.get("/checkout-success", verifyLogin, async (req, res) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  if(req.query.session_id){
  const session = await stripe.checkout.sessions.listLineItems(
    req.query.session_id
  );
  let id = session.data[0].description.substr(1);
  await orderHelpers.changePaymentStatus(id);
  }


  res.render("userPanel/items/checkoutSucess", {
    title: "Online Buy",
    user: req.session.user,
    cartCount,
  });
});

router.get("/checkout-failed", verifyLogin, async (req, res) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  res.render("userPanel/items/checkoutFail", {
    title: "Online Buy",
    user: req.session.user,
    cartCount,
  });
});

router.get("/order", verifyLogin, async (req, res) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }

  let orders = await orderHelpers.getAllOrders(req.session.user.id);
  res.render("userPanel/items/order", {
    title: "Orders",
    user: req.session.user,
    cartCount,
    orders,
  });
});

router.get("/order-details/:id", verifyLogin, async (req, res) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  let products = await orderHelpers.getOrderProducts(req.params.id);
  res.render("userPanel/items/orderDetails", {
    user: req.session.user,
    title: "Ordered Products",
    cartCount,
    products,
    id: req.params.id,
  });
});

router.get("/item/:id", async (req, res) => {
  let productitem = await product.getProduct(req.params.id);
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  res.render("userPanel/items/product", {
    title: productitem[0].name,
    productitem: productitem[0],
    cartCount,
    user: req.session.user,
  });
});

router.get("/buy/:name/:id", verifyLogin, async (req, res) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  let details = await product.getProduct(req.params.id);
  // console.log(details)
  res.render("userPanel/items/buyNow", {
    title: "Buy",
    cartCount,
    user: req.session.user,
    details: details[0],
  });
});

router.post("/buy-now", verifyLogin, async (req, res) => {
  buynow.handle(req.body, {
       success: async function (form) {
        console.log(req.body)
      res.setHeader("Content-Type", "application/json");
        let details = await product.getProduct(form.data.productId);
        orderHelpers.buyNow(form.data, details[0]).then((orderId) => {
          if (form.data.paymentMethod === "Cash on Delivery") {
            console.log("4")
            res.json({ codSuccess: true });
          } else {
            res.json({ payment: "online", orderId: orderId, total: form.data.total });
          }
        });
       },
         error:function(form){
          res.redirect("/")
         }})
  
});

router.get(
  "/order-cancel/:orderId/:method/:status",
  verifyLogin,
  (req, res) => {
    orderHelpers
      .cancelOrder(req.params.orderId, req.params.method, req.params.status)
      .then(() => {
        res.json({ status: true });
      });
  }
);

router.get("/deliveries-list", verifyLogin, async (req, res) => {
  let delivery = await deliveries.getDeliveries(req.session.user.id);
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  res.render("userPanel/items/deliveriesList", {
    title: "Online Buy | Deliveries",
    user: req.session.user,
    delivery,
    cartCount,
  });
});

router.get("/delivering/:orderId", verifyLogin, (req, res) => {
  deliveries.delivering(req.params.orderId).then(() => {
    res.json({ status: true });
  });
});

router.get("/got-refund/:orderId", verifyLogin, (req, res) => {
  orderHelpers.yesIGotRefund(req.params.orderId).then(() => {
    res.json({ status: true });
  });
});

router.get("/pay-due/:orderId", verifyLogin, async (req, res) => {
  let total = await orderHelpers.getTotalOfOrder(
    req.params.orderId,
    req.session.user.id
  );
  let cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelpers.getCartCount(req.session.user.id);
  }
  res.render("userPanel/items/pendingPay", {
    title: "Online Buy | Pay Due",
    user: req.session.user,
    cartCount,
    total,
    orderId: req.params.orderId,
  });
});

router.post("/pay-due", verifyLogin, (req, res) => {
  paypending.handle(req.body, {
    success: function (form) {
      
      res.setHeader("Content-Type", "application/json");
      if (form.data.paymentMethod === "Cash on Delivery") {
        orderHelpers.changePaymentMode(form.data.orderId).then(() => {
          res.json({ codSuccess: true });
        });
      } else {
        res.json({
          payment: "online",
          orderId: form.data.orderId,
          total: form.data.total,
        });
      }
    },
    error:function(form){
      res.redirect("/pay-due/"+form.data.orderId)
    }})
  // }
});

module.exports = router;
//  loginform.handle(req.body, {
//     success: function (form) {
// 
// res.setHeader("Content-Type", "application/json");
// },
//     error:function(form){}})