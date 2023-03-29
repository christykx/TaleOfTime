var db=require('../config/connection')
var collection=require('../config/collections')
var objectId=require('mongodb').ObjectId
module.exports={
    addProduct:async(product,callback)=>{
        console.log(product)
    let category= await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:product.category})
    console.log(category)
    product.offer_price=  parseInt(product.offer_price)
     product.available_quantity= parseInt(product.available_quantity)
     product.price= parseInt(product.price)
     product.percentage_discount= parseInt(product.percentage_discount)  
     product.categoryId=category._id
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            
            callback(data.insertedId)
        })
    },
    getAllProducts:()=>{    
        return new Promise(async(resolve,reject)=>{
            // var mysort={product_name:1}
            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
       
         resolve(products)       
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
       
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
              console.log(response)
                resolve(response)
            })
            
        })
    },

    getProductDetails:(proId)=>{
        console.log("proId")
        console.log(proId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                console.log("proId")
                
                resolve(product)
            })
        })
    },

    updateProduct:(proId,proDetails)=>{

        return new Promise(async(resolve,reject)=>{    
            let category= await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:proDetails.category})
            console.log(category)    
            proDetails.categoryId=category._id    
            
           proDetails.available_quantity=parseInt(proDetails.available_quantity)
            proDetails.offer_price=parseInt(proDetails.offer_price)
            proDetails.price=parseInt(proDetails.price)
            proDetails.percentage_discount=parseInt(proDetails.percentage_discount)

         db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
         {
            $set:{
 
                product_name:proDetails.product_name,
                category:proDetails.category,
                product_description:proDetails.product_description,
                available_quantity:proDetails.available_quantity,
                offer_price:proDetails.offer_price,
                price:proDetails.price,
                percentage_discount:proDetails.percentage_discount,

            }
        
        }).then((response)=>{
  
            resolve()
        })
    })

},

addcategory:(categoryList)=>{
    
    return new Promise(async(resolve,reject)=>{
        let category=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:categoryList.category})
    console.log(categoryList)   
    if(category){
        let err='Category already exist'
        reject(err)
       } else{
       
         db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryList).then((data)=>{
             resolve(data)
         })
       } 
 
     })    

},

getAllCategory:()=>{    
    return new Promise(async(resolve,reject)=>{
        let categories= await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
     resolve(categories)
    })
},

deletecategory:(ctgId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(ctgId)}).then((response)=>{
            console.log("ID is")
            console.log(response)
            resolve(response)
        })
    })
},


updatecategory:(ctgId,ctgDetails)=>{
                   
    return new Promise(async(resolve,reject)=>{
        let ctgCheck=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:ctgDetails.category})
       if(ctgCheck){
        let err='Category already exist'
        reject(err)
       } else{
        
        db.get().collection(collection.CATEGORY_COLLECTION)
        .updateOne({_id:objectId(ctgId)},{
        $set:{

          category:ctgDetails.category

        }

        }).then((response)=>{
            resolve(response)
        })
    }

    })
 },


 getCategoryDetails:(ctgId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(ctgId)}).then((category)=>{
            resolve(category)
        })
    })
},






}