
var forms = require('forms');
var fields = forms.fields;

let loginform=forms.create({
    email:fields.email({required:true}),
    password:fields.password({required:true}),

})

let signupform=forms.create({
    email:fields.email({required:true}),
    username:fields.string({required:true}),
    password:fields.password({required:true}),
})

let editform=forms.create({
    email:fields.email({required:true}),
    username:fields.string({required:true}),  
})
let deleteform=forms.create({
    password:fields.password({required:true}),  
})

module.exports={loginform,signupform,editform,deleteform}