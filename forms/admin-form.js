
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



module.exports={loginform,signupform}