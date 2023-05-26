
var forms = require('forms');
var fields = forms.fields;


let paypending=forms.create({
    orderId:fields.string(),
    total:fields.string(),
    paymentMethod:fields.string({required:true}),
})

let buynow=forms.create({
    userId:fields.string(),
    productId:fields.string(),
    total:fields.string(),
    mobile:fields.number({required:true}),
    address:fields.string({required:true}),
    pincode:fields.number({required:true}),
    paymentMethod:fields.string({required:true}),
})

let checkout=forms.create({
    userId:fields.string(),
    mobile:fields.number({required:true}),
    address:fields.string({required:true}),
    pincode:fields.number({required:true}),
    paymentMethod:fields.string({required:true}),
})


module.exports={paypending,buynow,checkout}



