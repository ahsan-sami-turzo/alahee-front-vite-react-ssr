const { query } = require("../db_config");
const { getDiscountByProductId } = require("./helpers");

const getProductDetailsByProductId = async (productId) => {
  try {
    return await query(`
      SELECT 
        id as product_id, 
        slug,
        product_name, 
        productPrice, 
        home_image, 
        image,
        DATEDIFF(CURRENT_TIMESTAMP, created_date) <= 15 AS newProduct 
      FROM 
        products
      WHERE 
        status='active' AND isApprove='authorize' AND softDelete=0 AND id=${productId}
    `);
  } catch (e) {
    return e;
  }
};

const getFeatureProductIdsByFeatureId = async (feature_id) => {
  try {
    let products = await query(`
        SELECT 
          feature_products
        FROM 
          feature_products 
        WHERE 
          feature_id=${feature_id} AND status=1
      `);

    products = JSON.parse(products[0].feature_products);
    
    products = products.sort((a,b)=> (a.productId < b.productId ? 1 : -1))

    return products.map((item) => item.productId * 1);
  } catch (e) {
    return e;
  }
};

const getFeatureProductsInfo = async (id, discountArr) => {
  try {
    let productIds = await getFeatureProductIdsByFeatureId(id);
    
    productIds = productIds.sort().reverse()
    
    console.log('productIds...', productIds) 
    
    let products = [];

    for (const productId of productIds) {
        
      let productDetails = await getProductDetailsByProductId(productId)
      
      const discountAmount = getDiscountByProductId(discountArr, productId)
      
      if(productDetails.length > 0){
        productDetails = [{ ...productDetails[0], discountAmount }]
        products = [...products, ...productDetails]
      }
    }

    return products;
  } catch (e) {
    return e;
  }
};


const getFeatureProductIdsByFeatureId_new = async (feature_id) => {
  try {
    let products = await query(`
        SELECT 
          feature_products
        FROM 
          feature_products 
        WHERE 
          feature_id=${feature_id} AND status=1
      `);
      
    products = JSON.parse(products[0].feature_products)
    let productIds = []
    
    products.forEach(product => {
        let sku = product.productName.slice(-16);
        productIds.push(getProductIdFromSku(sku));
    });
    
    return await Promise.all(productIds)
  } catch (e) {
    return e;
  }
};


const getProductIdFromSku = async (sku) => {
    try {
        let productId = await query(`SELECT id FROM products WHERE product_sku LIKE '%${sku}%'`)
        return JSON.parse(productId[0].id)
    } catch (e) {
        return e;
    }   
};

module.exports = {
  getFeatureProductIdsByFeatureId,
  getProductDetailsByProductId,
  getFeatureProductsInfo,
};
