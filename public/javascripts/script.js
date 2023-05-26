var stripe = Stripe(
"pk_test_51NA7ibAAvQkZ8Rhr3GqVDLl5dg1JGll5tzQspzT53im2BvdZB73cdAYbcLy3TScVFdLLQ6EzDvx0RwoKeagKA5gF001gaX9yxF"
);

function addToCart(proId) {
  $.ajax({
    url: "/add-cart/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
      }
      if (response.status == false) {
        alert("Quantity of the product incremented");
      }
    },
  });
}

function changeQuantity(cartId, proId, count, userId) {
  let quantity = parseInt(document.getElementById(proId).innerHTML);
  count = parseInt(count);
  $.ajax({
    url: "/alter-item-quantity",
    data: {
      user: userId,
      cart: cartId,
      product: proId,
      count: count,
      quantity: quantity,
    },
    method: "post",
    success: (response) => {
      if (response.removeProduct) {
        alert("Product Removed from Cart");
        location.reload();
      } else {
        document.getElementById(proId).innerHTML = quantity + count;
        document.getElementById("total").innerHTML = "₹" + response.total;
      }
    },
  });
}

$("#checkout").submit((e) => {
  console.log("ds")
  e.preventDefault();
  $.ajax({
    url: "/confirm-order",
    method: "post",
    data: $("#checkout").serialize(),
    success: (response) => {
      if (response.codSuccess) {
        location.href = "/checkout-success";
      } else if (response.payment == "online") {
        $.ajax({
          url: "/create-checkout-session",
          method: "post",
          data: {total:response.total,id:response.orderId[0]},
          success: function (data, textStatus, xhr) {
      
            return stripe.redirectToCheckout({ sessionId: data.id });
          },
        });
      }
    },
  });
});

function shipped(orderId) {
  $.ajax({
    url: "/admin/shipped/" + orderId,
    method: "post",
    success: (response) => {
      if (response.status) {
        location.reload();
      }
    },
  });
}
function cancelShipped(orderId) {
  $.ajax({
    url: "/admin/cancel-shipped/" + orderId,
    method: "post",
    success: (response) => {
      if (response.status) {
        location.reload();
      }
    },
  });
}
function refunded(orderId) {
  $.ajax({
    url: "/admin/refunded/" + orderId,
    method: "get",
    success: (response) => {
      if (response.status) {
        location.reload();
      }
    },
  });
}
$("#checkout-buy-now").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/buy-now",
    method: "post",
    data: $("#checkout-buy-now").serialize(),
    success: (response) => {
      if (response.codSuccess) {
        location.href = "/checkout-success";
      } else if (response.payment == "online") {
        $.ajax({
          url: "/create-checkout-session",
          method: "post",
          data: {total:response.total,id:response.orderId[0]},
          success: function (data, textStatus, xhr) {
    
            return stripe.redirectToCheckout({ sessionId: data.id });
          },
        });
      }
    },
  });
});
$("#delete-account").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/remove-account",
    method: "post",
    data: $("#delete-account").serialize(),
    success: (response) => {
      console.log(response);
      if (response.status == true) {
        alert("Your account is successfully deleted");
        location.href = "/";
      } else {
        alert("Entered password is incorrect");
        location.reload();
      }
    },
  });
});

function orderChecking(status, orderId) {
  // console.log(status)
  if (status == "Shipped") {
    document.getElementById(orderId + "c").style.display = "none";
    document.getElementById(orderId + "r").style.display = "none";
    document.getElementById(orderId + "rb").style.display = "none";
    document.getElementById(orderId + "pp").style.display = "none";
  } else if (status == "Placed") {
    document.getElementById(orderId + "y").style.display = "none";
    document.getElementById(orderId + "r").style.display = "none";
    document.getElementById(orderId + "rb").style.display = "none";
    document.getElementById(orderId + "pp").style.display = "none";
  } else if (status == "Cancelled") {
    document.getElementById(orderId + "y").style.display = "none";
    document.getElementById(orderId + "c").style.display = "none";
    document.getElementById(orderId + "rb").style.display = "none";
    document.getElementById(orderId + "pp").style.display = "none";
  } else if (status == "Refunded") {
    document.getElementById(orderId + "y").style.display = "none";
    document.getElementById(orderId + "c").style.display = "none";
    document.getElementById(orderId + "r").style.display = "none";
    document.getElementById(orderId + "pp").style.display = "none";
  } else if (status == "Pending") {
    document.getElementById(orderId + "y").style.display = "none";
    document.getElementById(orderId + "r").style.display = "none";
    document.getElementById(orderId + "rb").style.display = "none";
  }
}

function adminOrderChecking(status, orderId) {
  if (status == "Shipped") {
    document.getElementById(orderId + "as").style.display = "none";
    document.getElementById(orderId + "ar").style.display = "none";
    document.getElementById(orderId + "rb").style.display = "none";
  } else if (status == "Placed") {
    document.getElementById(orderId + "acs").style.display = "none";
    document.getElementById(orderId + "ar").style.display = "none";
  } else if (status == "Cancelled") {
    document.getElementById(orderId + "as").style.display = "none";
    document.getElementById(orderId + "acs").style.display = "none";
  } else if (status == "Refunded") {
    document.getElementById(orderId + "as").style.display = "none";
    document.getElementById(orderId + "acs").style.display = "none";
    document.getElementById(orderId + "ar").style.display = "none";
  } else if (status == "Pending") {
    document.getElementById(orderId + "as").style.display = "none";
    document.getElementById(orderId + "acs").style.display = "none";
    document.getElementById(orderId + "ar").style.display = "none";
  }
}
function cancelOrder(orderId, method, status) {
  $.ajax({
    url: "/order-cancel/" + orderId + "/" + method + "/" + status,
    methode: "get",
    success: (response) => {
      if (response.status) {
        location.reload();
      }
    },
  });
}

function delivered(orderId) {
  $.ajax({
    url: "/delivering/" + orderId,
    methode: "get",
    success: (response) => {
      if (response.status) {
        location.href = "/deliveries-list";
      }
    },
  });
}

function gotRefund(orderId) {
  $.ajax({
    url: "/got-refund/" + orderId,
    methode: "get",
    success: (response) => {
      if (response.status) {
        location.href = "/order";
      }
    },
  });
}


$("#pay-pending-checkout").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/pay-due",
    method: "post",
    data: $("#pay-pending-checkout").serialize(),
    success: (response) => {
      if (response.codSuccess) {
        location.href = "/checkout-success";
      } else if (response.payment == "online") {
        $.ajax({
          url: "/create-checkout-session",
          method: "post",
          data: {total:response.total,id:response.orderId},
          success: function (data, textStatus, xhr) {
      
            return stripe.redirectToCheckout({ sessionId: data.id });
          },
        });
      }
    },
  });
});

