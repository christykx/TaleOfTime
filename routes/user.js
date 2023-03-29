const { response, application } = require('express');
var express = require('express');
const { USER_COLLECTION } = require('../config/collections');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const userHelpers=require('../helpers/user-helpers')


const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn)
  {
    next()

  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/',async function(req, res, next) {
  res.setHeader("cache-control","private,no-cache,no-store,must-revalidate");
  let user=req.session.user
  let categories = await productHelpers.getAllCategory()
  let cartCount=null
  if(req.session.user){

 cartCount= await userHelpers.getCartCount(req.session.user._id)

  }
  productHelpers.getAllProducts().then((products) => {
  res.render('user/view-products', {admin:false,products,categories, user,cartCount});
  console.log(products)
  })
});

router.get('/login', function(req, res, next) {
 res.setHeader("cache-control","private,no-cache,no-store,must-revalidate"); 
 if(req.session.loggedIn){
  res.redirect('/')
 }else{
  res.render('user/login', {admin:false,"loginerr":req.session.loginerr});
  req.session.loginerr=false

 }
});

router.post('/login', function (req,res) {
   res.setHeader("cache-control","private,no-cache,no-store,must-revalidate");
  
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
       req.session.loginerr=true;
      res.redirect('/login')
    }
  })

});

router.get('/signup', function(req, res, next) {
   res.setHeader("cache-control","private,no-cache,no-store,must-revalidate"); 
   if(req.session.loggedIn){
    res.redirect('/')
   }else{
    res.render('user/signup', {admin:false,"signupErr":req.session.signupErr});

    req.session.signupErr=false

   }

});


router.post('/signup', function(req, res, next) {
  userHelpers.doSignup(req.body).then((response)=>{  
      req.session.loggedIn=true
      req.session.user=response
      console.log("response.userdata")
      console.log(response.userdata)

      res.redirect('/')
  }).catch((err)=>{
    req.session.signupErr=err
    res.redirect('/signup')
  })
  // res.render('user/signup', {admin:false});
});


router.get('/singleproduct/:id' ,verifyLogin,async(req, res)=>{
 
  let user=req.session.user
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  res.render('user/singleproduct',{admin:false,product,user})

 });
 



router.get('/buy',verifyLogin,(req,res)=>{
  res.render('user/buy')
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let products= await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=0
  if(products.length>0){
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  }
  console.log(products)
  res.render('user/cart',{admin:false,products,user,totalValue})
})

router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call")
userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
  // res.redirect('/')
  res.json({status:true})
})
})


router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
  response.total=await userHelpers.getTotalAmount(req.body.user)
   res.json(response)
  })
})

router.post('/remove-cart-item',(req,res,next)=>{
  console.log("Remove cart items")
  console.log(req.body)
   userHelpers.removeCart(req.body).then(()=>{
    res.json(response)
   })
})


router.get('/place-order',verifyLogin,async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{admin:false,total,user:req.session.user})
});

router.post('/place-order',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
 userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
  res.json({status:true})
 })
console.log(req.body)
});

router.get('/order-success',verifyLogin,(req,res)=>{
 res.render('user/order-success',{admin:false,user:req.session.user})
});

router.get('/orders',verifyLogin,async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{admin:false,user:req.session.user,orders})
});

router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  console.log(products)
  res.render('user/view-order-products',{admin:false,user:req.session.user,products})
});

router.get('/edit-profile/:id',verifyLogin,(req,res)=>{
  res.render('user/edit-profile',{admin:false,user:req.session.user})
});


router.post('/edit-profile/:id',verifyLogin,async(req,res)=>{
  
  console.log(req.body)
  console.log(req.params.id)
  let id=req.params.id
  userHelpers.updateProfile(req.params.id,req.body).then(()=>{
     res.redirect('/edit-profile/:id')
    try
    {
      let Image = req.files.image
      Image.mv('./public/profile-images/' + id + '.jpg')
    
    }catch{
      
    }

  }) 
 
})


router.get('/cancel-order/:id',(req,res)=>{
  console.log("cancel orders")
  let orderId=req.params.id
   userHelpers.cancelOrder(orderId).then(()=>{
    res.redirect('/orders')

   })
})



router.get('/logout',(req,res)=>{
  req.session.destroy() 
  res.redirect('/')
});

module.exports = router;
