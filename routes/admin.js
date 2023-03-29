var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers');

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn)
  {
    next()

  }else{
    res.redirect('/login')
  }
}
/* GET users listing. */
router.get('/', function (req, res, next) {
 
  res.render('admin/sales-report',{ admin: true });
});

router.get('/view-products', function (req, res, next) {

  productHelpers.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products});
  })

});


router.get('/add-product', function (req, res, next) {
  productHelpers.getAllCategory().then((categories)=>{
    console.log("category list")
    console.log(categories)
  // if(req.session.success){
  res.render('admin/add-product',{admin:true,categories})
  // req.session.success=false
  // }
  })
  
});

router.post('/add-product', function (req, res, next) {
  productHelpers.addProduct(req.body, (id) => {
    let Image = req.files.image
    Image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (err) {
        console.log("Error in adding product")
      } else {
        console.log("Successfully added")
        res.redirect('/admin/view-products')
      }
    })
    // res.render('admin/view-product', { admin: true })
  })
});

router.get('/delete-product/:id',(req,res)=>{

  let proId=req.params.id
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/view-products/')
  })
 
});
router.get('/edit-product/:id',async(req,res)=>{
  
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  productHelpers.getAllCategory().then((categories)=>{
    console.log("category list")
    console.log(categories)
    res.render('admin/edit-product',{admin:true,product,categories})
  })
  
});

router.post('/edit-product/:id',async(req,res)=>{
  
  let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/view-products')
    try
    {
      let Image = req.files.image
      Image.mv('./public/product-images/' + id + '.jpg')
    
    }catch{
      
    }

  }) 
 
})


router.get('/view-user',(req,res)=>{
 
  res.setHeader("cache-control","private,no-cache,no-store,must-revalidate");
 
    userHelpers.getAllUsers().then((users)=>{
      console.log("Entered users list")
     console.log(users)
  res.render('admin/view-user',{admin:true,users})
 })  

})


router.get('/delete-user/:id',(req,res)=>{
  let userId=req.params.id
  console.log("user id is")
  console.log(userId)
  userHelpers.deleteuser(userId).then((response)=>{ 
    res.redirect('/admin/view-user/')

  })
})

router.get('/view-category',(req,res)=>{
 
  res.setHeader("cache-control","private,no-cache,no-store,must-revalidate");
 
    productHelpers.getAllCategory().then((categories)=>{
    console.log("category list")
    console.log(categories)
  res.render('admin/view-category',{admin:true,categories})
  })  

})

router.get('/add-category', function (req, res, next) {

  res.render('admin/add-category', { admin: true ,"signupErr":req.session.signupErr});
  req.session.signupErr=false

});


router.post('/add-category', function (req, res) {
  
  
  console.log("Demo printing")
   console.log(req.body)
   console.log("Category body!!!")
   console.log(req.body.category)
  productHelpers.addcategory(req.body).then((result)=>{   

    res.redirect("/admin/view-category")
    }).catch((err)=>{
        req.session.signupErr=err
        res.redirect('/admin/add-category')
      })
});

router.get('/delete-category/:id',(req,res)=>{
  let ctgId=req.params.id
  console.log(ctgId)
  productHelpers.deletecategory(ctgId).then((response)=>{ 
    res.redirect('/admin/view-category')
  })
})


router.get('/edit-category/:id',async(req,res)=>{

  let category=await productHelpers.getCategoryDetails(req.params.id)
  console.log(category)
  res.render('admin/edit-category',{admin:true,category})

});

router.post('/edit-category/:id',async(req,res)=>{
  
  let id=req.params.id
  productHelpers.updatecategory(req.params.id,req.body).then(()=>{
    res.redirect('/admin/view-category')

  })
 
})


router.get('/user-block/:id',(req,res)=>{
  let userId=req.params.id;
  userHelpers.blockUser(userId).then((response)=>{
    res.redirect('/admin/view-user')
  })
})

router.get('/user-unblock/:id',(req,res)=>{
  let userId=req.params.id;
  userHelpers.unblockUser(userId).then((response)=>{
    res.redirect('/admin/view-user')
  })
})

router.get('/all-orders',async(req,res)=>{
 
  let orders=await userHelpers.getAllOrders()
  res.render('admin/all-orders',{admin:true,orders})
});

// router.get('/cancel-order/:id',(req,res)=>{
//  console.log("Hii")
// console.log(req.params.id)
//  let orderId=req.params.id
//   console.log(orderId)
//   userHelpers.cancelOrder(orderId).then((response)=>{
//     res.redirect('/admin/all-orders/')
//   })
 
// });

router.get('/cancel-order/:id',(req,res)=>{
  console.log("cancel orders")
  let orderId=req.params.id
   userHelpers.cancelOrder(orderId).then(()=>{
    res.redirect('/admin/all-orders/')

   })
})


router.post('/edit-status/:id',(req,res)=>{
  console.log("Edit Order status")
  console.log(req.body)
  console.log(req.params.id)
  // let orderId=req.params.id
   userHelpers.editStatus(req.params.id,req.body).then(()=>{
    res.redirect('/admin/all-orders')

   })
})


module.exports = router;
