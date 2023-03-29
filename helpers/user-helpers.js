var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const Promise=require('promise')
const { response } = require('express')
var objectId=require('mongodb').ObjectId

module.exports={
    doSignup:(userData)=>{
        
     return new Promise(async(resolve,reject)=>{
      let userCheck=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
        userData.password=await bcrypt.hash(userData.password,10)
        if(userCheck){
           
            let err='Email id already exist'
            reject(err)
           }
         else{
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                console.log(userData);
                resolve(userData)
               
            })
         }               
      
    })

 },
 doLogin:(userData)=>{
    return new Promise(async(resolve,reject)=>{
        let loginStatus=false
        let response={}
        let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
       
        if(user){
            bcrypt.compare(userData.password,user.password).then((status)=>{
                if(status){
                    console.log("Login success")
                    response.user=user
                    response.status=true
                    resolve(response)
                }else{
                    console.log("login fail")
                    resolve({status:false})
                }
            })
        }else{
            console.log("Login failed")
        }
    })
},

getAllUsers:()=>{
    return new Promise(async(resolve,reject)=>{
       let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()   
       console.log("Printing all users")
       console.log(users)
         resolve(users)       
        
      })
  },

  
deleteuser:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).deleteOne({_id:objectId(userId)}).then((response)=>{
            console.log("ID is")
            console.log(response)
            resolve(response)
        })
    })
},

doOtpLogin:(userData)=>{
    return new Promise(async(resolve,reject)=>{
        let loginStatus=false
        let response={}
        let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
       
        if(user){
            bcrypt.compare(userData.password,user.password).then((status)=>{
                if(status){
                    console.log("Login success")
                    response.user=user
                    response.status=true
                    resolve(response)
                }else{
                    console.log("login fail")
                    resolve({status:false})
                }
            })
        }else{
            console.log("Login failed")
        }
    })
},

blockUser:(userId)=>{
    return new Promise((resolve,reject)=>{
        console.log(objectId(userId))
        let query={_id:objectId(userId)};
        db.get().collection(collection.USER_COLLECTION).findOneAndUpdate(query,{$set:{block:true}}).then((response)=>{
            console.log(response)
            resolve(response)
        }).catch((err)=>{
            console.log(err)
        })
    })
},

unblockUser:(userId)=>{
    return new Promise((resolve,reject)=>{
        console.log(objectId(userId))
        let query={_id:objectId(userId)};
        db.get().collection(collection.USER_COLLECTION).findOneAndUpdate(query,{$set:{block:false}}).then((response)=>{
            console.log(response)
            resolve(response)
        }).catch((err)=>{
            console.log(err)
        })
    })
},

otpLogin: (phone) => {
    return new Promise(async (resolve, reject) => {
        console.log(phone)
        let userCheck = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: phone })
        
        let response = {}
        if (userCheck) {
            response.user = userCheck
            response.status = true
            resolve(response)
        } else {
            reject('The number is not registered')
        }

    })
},


addToCart:(proId,userId)=>{
    
    let proObj={
        item:objectId(proId),
        quantity:1
    }
    return new Promise(async(resolve,reject)=>{
        let userCart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        if(userCart){

        let proExist=userCart.products.findIndex(product=> product.item==proId)
        console.log(proExist);
        if(proExist!=-1){

            db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId),'products.item':objectId(proId)},
            {
                $inc:{'products.$.quantity':1}
            }
            ).then(()=>{
                resolve()
            })

        }else{

            db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
            {
    
                    $push:{products:proObj}          
                
            }
          
            ).then((response)=>{
                resolve()
            })

        }
      

        }else{
          let cartObj={
            user:objectId(userId),
            products:[proObj]
        }

        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
            resolve()
        })
        }
    })

},


getCartProducts:(userId)=>{
    
    return new Promise(async(resolve,reject)=>{
        let cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                     $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
 
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }

                },
                {
                    $lookup:{

                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$product',0]}
                    }
                }

        ]).toArray()
        console.log(cartItems)
        // console.log(cartItems[0].products)
        resolve(cartItems)

    })
},


getCartCount:(userId)=>{

    return new Promise(async(resolve,reject)=>{
        let count=0
        let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        if(cart){
            count=cart.products.length
        }
        resolve(count)
    })
},

changeProductQuantity:(details)=>{

    details.count=parseInt(details.count)
    details.quantity=parseInt(details.quantity)
    console.log("details")
    console.log(details)
    return new Promise((resolve,reject)=>{

        if(details.count==-1 && details.quantity==1){

        db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
        {
            $pull:{products:{item:objectId(details.product)}}
        }
        ).then((response)=>{
            console.log(response)
            resolve({removeProduct:true})
        })

        }else{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
            {
                $inc:{'products.$.quantity':details.count}
            }
            ).then((response)=>{
                resolve({status:true})
            })
        }   
 
    })
    
},

removeCart:(details)=>{
    return new Promise((resolve,reject)=>{
    db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
    {
        $pull:{products:{item:objectId(details.product)}}
    }
    ).then((response)=>{
        console.log(response)
        resolve({removeProduct:true})
    })
    })
},


getTotalAmount:(userId)=>{
    // details.products.offer_price=parseInt(details.products.offer_price)
    // details.quantity=parseInt(details.quantity)
    return new Promise(async(resolve,reject)=>{
    
        let total= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                     $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }

                },
                {
                    $lookup:{

                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.offer_price']}}
                    }
                }

        ]).toArray()
        // console.log(total[0].total)
        // console.log(cartItems[0].products)
        resolve(total[0].total)

    })

},


placeOrder:(order,products,total)=>{
return new Promise((resolve,reject)=>{
   console.log(order,products,total)
   let status=order['payment-method']==='cod'?'placed':'pending'
   let orderObj={
    deliveryDetails:{     
      address:order.address,
      phone:order.phone,
      city:order.city,
      pincode:order.pincode
    },
    userId:objectId(order.userId),
    useremail:order.useremail,
    paymentMethod:order['payment-method'],
    products:products,
    totalAmount:total,
    date:new Date(),
    status:status
    
   }
   db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
    db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)}) 
    resolve()   
   })

})
},


getCartProductList:(userId)=>{
return new Promise(async(resolve,reject)=>{
    let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
    resolve(cart.products)

})
},

getUserOrders:(userId)=>{

    return new Promise(async(resolve,reject)=>{
        let orders= await db.get().collection(collection.ORDER_COLLECTION)
        .find({userId:objectId(userId)}).toArray()
        resolve(orders)
    })
},

getOrderProducts:(orderId)=>{

    return new Promise(async(resolve,reject)=>{
        let orderItems= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                     $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
 
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }

                },
                {
                    $lookup:{

                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$product',0]}
                    }
                }

        ]).toArray()
        console.log(orderItems)
        resolve(orderItems)

    })

},

getAllOrders:()=>{    
    return new Promise(async(resolve,reject)=>{
        // var mysort={product_name:1}
        let orders= await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
   
     resolve(orders)       
    })
  },


cancelOrder:(orderId)=>{
    return new Promise((resolve,reject)=>{
   
        db.get().collection(collection.ORDER_COLLECTION).deleteOne({_id:objectId(orderId)}).then((response)=>{
          console.log(response)
            resolve(response)
        })
        
    })
},


updateProfile:(userId,userDetails)=>{
                   
    return new Promise(async(resolve,reject)=>{

        userDetails.password=await bcrypt.hash(userDetails.password,10) 
        db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:objectId(userId)},{
        $set:{

          username:userDetails.username,
          email:userDetails.email,
          phone:userDetails.phone,       
          address:userDetails.address,
          password:userDetails.password
        }

        }).then((response)=>{
            resolve(response)
        })
    

    })
 },

 editStatus:(orderId,orderStatus)=>{
                   
    return new Promise(async(resolve,reject)=>{

        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({_id:objectId(orderId)},{
        $set:{

          status:orderStatus.status
        }

        }).then((response)=>{
            resolve(response)
        })
    

    })
 }


}