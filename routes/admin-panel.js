var express = require("express");
const admin = require("../db-functions/admin");
var router = express.Router();
var productHelpers = require("../db-functions/product");
const { signupform, loginform, addproduct } = require("../forms/admin-form");
var cloudinary = require("../uploader_cloudinary").v2;
var uploader = require("../uploader_multer");

const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/signin");
  }
};

router.get("/", verifyLogin, function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    res.render("adminPanel/all-products", {
      admin: req.session.admin,
      products,
      title: "Admin Panel",
    });
  });
});

router.get("/secret-signup", (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin");
  } else {
    res.render("adminPanel/signup", {
      title: "Add Admin Signup",
      admin: true,
      signupErr: req.session.userSignupErr,
      signupSuccess: req.session.userSignupSuccess,
    });
    req.session.userSignupErr = false;
    req.session.userSignupSuccess = false;
  }
});

router.post("/secret-signup", (req, res) => {
  signupform.handle(req.body, {
    success: function (form) {
      res.setHeader("Content-Type", "application/json");
      admin.doSignup(form.data).then(async (response) => {
        if (response.status) {
          req.session.userSignupSuccess =
            "New admin created successfully. Please login to continue";
          res.redirect("/admin/secret-signup");
        } else {
          req.session.userSignupErr = "Email already registered";
          res.redirect("/admin/secret-signup");
        }
      });
    },
    error: function (form) {
      res.redirect("/admin/secret-signup");
    },
  });
});

router.get("/signin", (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin");
  } else {
    res.render("adminPanel/signin", {
      title: "Admin Login",
      admin: true,
      loginErr: req.session.userLoginErr,
    });
    req.session.adminLoginErr = false;
  }
});

router.post("/signin", (req, res) => {
  loginform.handle(req.body, {
    success: function (form) {
      res.setHeader("Content-Type", "application/json");
      admin.doLogin(form.data).then((response) => {
        if (response.status) {
          req.session.admin = response.admin[0];
          req.session.adminLoggedIn = true;
          res.redirect("/admin/signin");
        } else {
          req.session.adminLoginErr = "Invalid Username or Password";
          res.redirect("/admin/signin");
        }
      });
    },
    error: function (form) {
      res.redirect("/admin/signin");
    },
  });
});

router.get("/logout", (req, res) => {
  req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect("/admin/signin");
});

router.get("/add-product", verifyLogin, function (req, res) {
  res.render("adminPanel/add-product", { admin: true, title: "Add Products" });
});

router.post(
  "/add-product",
  verifyLogin,
  uploader.single("image"),
  (req, res) => {
    productHelpers.addProduct(req.body, async (id) => {
      if (req.file) {
        const upload = await cloudinary.uploader.upload(req.file.path);
        productHelpers.updateProductImage(id, upload.secure_url);
      }
      res.redirect("/admin");
    });
   
  }
);

router.get("/delete-product/:id", verifyLogin, (req, res) => {
  let proId = req.params.id;
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin");
  });
});

router.get("/edit-product/:id", verifyLogin, async (req, res) => {
  let product = await productHelpers.getProductsDetails(req.params.id);
  res.render("adminPanel/edit-product", {
    admin: req.session.admin,
    title: "Edit Products",
    product: product[0],
  });
});

router.post(
  "/edit-product/:id",
  verifyLogin,
  uploader.single("image"),
  (req, res) => {
    productHelpers.updateProduct(req.params.id, req.body).then(async () => {
      if (req.file) {
        const upload = await cloudinary.uploader.upload(req.file.path);
        productHelpers.updateProductImage(req.params.id, upload.secure_url);
      }
      res.redirect("/admin");
    });
  }
);

router.get("/all-orders", verifyLogin, async (req, res) => {
  let orders = await admin.getAllOrders();
  res.render("adminPanel/all-orders", {
    admin: req.session.admin,
    title: "All Orders",
    orders,
  });
});

router.post("/shipped/:id", verifyLogin, (req, res) => {
  admin.postAOrderAsShipped(req.params.id).then(() => {
    res.json({ status: true });
  });
});

router.post("/cancel-shipped/:id", verifyLogin, (req, res) => {
  admin.cancelShipped(req.params.id).then(() => {
    res.json({ status: true });
  });
});

router.get("/refunded/:orderId", verifyLogin, (req, res) => {
  admin.refunded(req.params.orderId).then(() => {
    res.json({ status: true });
  });
});

router.get("/all-users", verifyLogin, async (req, res) => {
  let users = await admin.getAllUsers();
  res.render("adminPanel/all-users", {
    admin: req.session.admin,
    title: "All Users",
    users,
  });
});

// // Order details

// // router.get('/order-details/:id',verifyLogin,(req,res)=>{
// //   res.render('admin/order-details',{title:"Shopping Cart | Order details",admin:res.session.admin})
// // })

router.get("/order-details/:orderId/:userId", verifyLogin, async (req, res) => {
  let user = await admin.getUser(req.params.userId);
  let products = await admin.getOrderProducts(req.params.orderId);
  res.render("adminPanel/order-details", {
    admin: req.session.admin,
    title: "Shopping Cart | Order details",
    user: user[0],
    products,
  });
});

router.get("/product/:id", verifyLogin, async (req, res) => {
  let product = await productHelpers.getProduct(req.params.id);
  res.render("adminPanel/product", {
    title: product[0].name,
    product: product[0],
    admin: req.session.admin,
  });
});

router.get("/all-deliveries", verifyLogin, async (req, res) => {
  let delivery = await admin.getAllDeliveries();
  res.render("adminPanel/all-deliveries", {
    title: "Online Buy | All Deliveries",
    admin: req.session.admin,
    delivery: delivery,
  });
});

module.exports = router;
