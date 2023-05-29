const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
var session = require("express-session");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const fileUpload = require("express-fileupload");
var path = require("path");
var unique = require("array-unique");
const app = express();
const util = require("util");
var cookieParser = require("cookie-parser");
var async = require("async");
var cors = require("cors");
const pad = require("pad");
const nodemailer = require("nodemailer");
var isNullOrEmpty = require("is-null-or-empty");
const https = require("https");
const crypto = require("crypto");
const compress_images = require("compress-images");

const routes = require("express").Router();

const ekep = require('ekshop-ep-nodejs-package');

const dbConnection = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'alahee_ecommerce',
    password: '%6bm-4UtpGKd',
    database: 'alahee_ecommerce',
    dateStrings: true,
});

dbConnection.getConnection((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to database...");
});

const query = util.promisify(dbConnection.query).bind(dbConnection);

// VERIFY TOKEN
function verifyToken(req, res, next) {
  const secretJwtHeader = req.headers["authorization"]; // GET AUTH VALUE
  // CHECK secretJwt IS NOT UNDEFINED
  if (typeof secretJwtHeader !== undefined) {
    const secretJwt = secretJwtHeader.split(" "); // SPLIT AT THE SPACE
    const secretJwtToekn = secretJwt[1]; // GET TOKEN FROM THE ARRAY
    req.token = secretJwtToekn; // SET THE TOKEN
    next(); // NEXT MIDDLEWARE
  } else {
    res.sendStatus(403);
  }
}

// SLUGIFY
function slugify(str, id) {
  str = str.replace(/^\s+|\s+$/g, ""); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to = "aaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes

  return str + "-" + id;
}

routes.get("/", (req, res) => {
  res.status(200).json({ message: "api call success !!" });
});

routes.get("/check", (req, res) => {
  res.status(200).json({ message: "api call success 2 !!" });
});

/*
** START
** Product -> Specificaton -> Weight Type
*/

routes.get("/getWeightType", verifyToken, async function (req, res) {
  jwt.verify(req.token, "secretkey", async function (err, authData) {
    if (err) {
      res
        .status(403)
        .send({ success: false, message: "jwt expired", status: "403" });
    } else {
      try {
        const weightTypes = await query(
          "SELECT * FROM weight_type WHERE softDel = 0 AND status = 1"
        );
        return res.send({ success: true, data: weightTypes });
      } catch (e) {
        console.log(e);
        return res.send({ success: true, data: [] });
      }
    }
  });
});

routes.post("/saveWeightType", verifyToken, async function (req, res) {
  jwt.verify(req.token, "secretkey", async function (err, authData) {
    if (err) {
      res
        .status(403)
        .send({ success: false, message: "jwt expired", status: "403" });
    } else {
      try {
        const insert_into_weight_type = await query(
          "INSERT INTO weight_type (name, softDel, status) VALUES (" +
            JSON.stringify(req.body.name) +
            ", 0, 1)"
        );
        return res.send({ success: true, message: "Inserted successfully !!" });
      } catch (e) {
        console.log("Error : ", e);
        return res.send({
          success: false,
          message: "Could Not Save Weight Type !!",
        });
      }
    }
  });
});

routes.get("/getWeightTypeForUpdate", verifyToken, async function (req, res) {
  jwt.verify(req.token, "secretkey", async function (err, authData) {
    if (err) {
      res
        .status(403)
        .send({ success: false, message: "jwt expired", status: "403" });
    } else {
      try {
        const weightTypes = await query(
          "SELECT name FROM weight_type WHERE softDel = 0 AND status = 1 AND id = " +
            req.query.id
        );
        return res.send({ success: true, data: weightTypes[0].name });
      } catch (e) {
        return res.send({ success: false, data: [], message: "DB Error" });
      }
    }
  });
});

routes.post("/editWeightType", verifyToken, async function (req, res) {
  jwt.verify(req.token, "secretkey", async function (err, authData) {
    if (err) {
      res
        .status(403)
        .send({ success: false, message: "jwt expired", status: "403" });
    } else {
      try {
        const weightTypes = await query(
          "UPDATE weight_type SET name = " +
            JSON.stringify(req.body.name) +
            " WHERE id = " +
            req.body.weightId
        );
        return res.send({
          success: true,
          message: "Data Updated Succesfully !!",
        });
      } catch (e) {
        console.log("Error : ", e);
        return res.send({
          success: false,
          message: "Could Not Save Weight Type !!",
        });
      }
    }
  });
});

routes.get("/deleteWeightType", verifyToken, async function (req, res) {
  jwt.verify(req.token, "secretkey", async function (err, authData) {
    if (err) {
      res
        .status(403)
        .send({ success: false, message: "jwt expired", status: "403" });
    } else {
      try {
        const get_weight_infos = await query(
          "SELECT * FROM weight_infos WHERE weight_type_id = " + req.query.id
        );
        if (get_weight_infos.length == 0) {
          const updateWeightTypes = await query(
            "UPDATE weight_type SET softDel = 1, status = 0 WHERE id = " +
              req.query.id
          );
          return res.send({
            success: true,
            message: "Data Deleted Succesfully",
          });
        } else {
          return res.send({
            success: false,
            message:
              "Can Not Delete. This Weight Already Has Associated Info !!",
          });
        }
      } catch (e) {
        return res.send({ success: false, message: "Data Deletion Failed" });
      }
    }
  });
});

/*
** END
** Product -> Specificaton -> Weight Type
*/

/*
** START
** Product -> Specificaton -> Weight Info
*/

routes.post("/saveWeightInfo", verifyToken, async function (req, res) {
  jwt.verify(req.token, "secretkey", async function (err, authData) {
    if (err) {
      res
        .status(403)
        .send({ success: false, message: "jwt expired", status: "403" });
    } else {
      try {
        const insert_into_weight_infos = await query(
          "INSERT INTO weight_infos (weight, weight_type_id, softDel, status) VALUES (" +
            JSON.stringify(req.body.weight) +
            ", " +
            JSON.stringify(req.body.weightType) +
            ", 0, 1)"
        );
        return res.send({ success: true, message: "Inserted successfully" });
      } catch (e) {
        return res.send({ success: false, message: "DB Error" });
      }
    }
  });
});

routes.get("/getWeightInfos", verifyToken, async function (req, res) {
  try {
    const get_weight_infos = await query(
      "SELECT weight_infos.id AS id, weight_infos.weight AS weight, weight_infos.weight_type_id AS weight_type_id, weight_type.name FROM weight_infos JOIN weight_type ON weight_infos.weight_type_id = weight_type.id WHERE weight_infos.softDel = 0 AND weight_infos.status = 1 AND weight_type.softDel = 0 AND weight_type.status = 1"
    );
    return res.send({ success: true, data: get_weight_infos });
  } catch (e) {
    return res.send({ success: true, data: [] });
  }
});

routes.get("/getWeightInfoForUpdate", verifyToken, async function (req, res) {
  jwt.verify(req.token, "secretkey", async function (err, authData) {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const get_weight_infos = await query(
          "SELECT weight_infos.weight AS weight, weight_type.id AS weight_type_id FROM weight_infos JOIN weight_type ON weight_infos.weight_type_id = weight_type.id WHERE weight_infos.softDel = 0 AND weight_infos.status = 1 AND weight_type.softDel = 0 AND weight_type.status = 1 AND weight_infos.id = " +
            req.query.id
        );
        return res.send({ success: true, data: get_weight_infos[0] });
      } catch (e) {
        return res.send({ success: false, data: [], message: "DB Error" });
      }
    }
  });
});

routes.post("/editWeightInfos", verifyToken, async function (req, res) {
  jwt.verify(req.token, "secretkey", async function (err, authData) {
    if (err) {
      res
        .status(403)
        .send({ success: false, message: "jwt expired", status: "403" });
    } else {
      try {
        const update_weight_infos = await query(
          "UPDATE weight_infos SET weight = " +
            JSON.stringify(req.body.weight) +
            ", weight_type_id = " +
            JSON.stringify(req.body.weightType) +
            " WHERE id = " +
            req.body.weightId
        );
        return res.send({ success: true, message: "Data Updated Succesfully" });
      } catch (e) {
        return res.send({ success: false, message: "DB Error" });
      }
    }
  });
});

routes.get("/deleteWeightInfo", verifyToken, async function (req, res) {
  jwt.verify(req.token, "secretkey", async function (err, authData) {
    if (err) {
      res
        .status(403)
        .send({ success: false, message: "jwt expired", status: "403" });
    } else {
      try {
        const update_weight_infos = await query(
          "UPDATE weight_infos SET softDel = 1, status = 0 WHERE id = " +
            req.query.id
        );
        return res.send({ success: true, message: "Data Deleted Succesfully" });
      } catch (e) {
        return res.send({ success: false, message: "Data Deletion Failed" });
      }
    }
  });
});

/*
** END
** Product -> Specificaton -> Weight Info
*/

/*
** START
** Product -> Specificaton
*/

routes.get("/product_specification_names", (req, res) => {
  dbConnection.query(
    "SELECT product_specification_names.id AS id, product_specification_names.specification_name AS specification_name, product_specification_names.specification_type AS specification_type, product_specification_names.category_id AS category_id, product_specification_names.type AS type, category.category_name AS category_name FROM product_specification_names JOIN category ON product_specification_names.category_id = category.id WHERE product_specification_names.status = 1 AND product_specification_names.softDel = 0 ORDER BY product_specification_names.id DESC",
    function (error, results, fields) {
      console.log(results);
      if (error) throw error;
      return res.send({
        error: error,
        data: results,
        message: "sepecification name list.",
      });
    }
  );
});


routes.post("/saveSpecification_01-09-2021", verifyToken, function (req, res) {  
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.status(403).send({ success: false, message: "jwt expired", status: "403" });
    } else {
      try {
        let serverResponse;
        if (req.body.isUpdateClicked == true) {   // update          
          if (req.body.specification == "Color") {  // color
            var sql_query ="UPDATE product_specification_names SET specification_name = '" +req.body.specification +"', category_id = '" +req.body.categoryId +"', specification_type = '" +req.body.specification +"', type = 0, status = 1 WHERE id = " +req.body.editID;
            dbConnection.query(sql_query, function (err, result) {
              return result ? res.send({ success: true, server_message: result }) : res.send({ success: false, error: err });
            });
          } else {  // weight or size
            var sql_query = "UPDATE product_specification_names SET specification_name = '" + req.body.specificationName + "', category_id = '" + req.body.categoryId + "', specification_type = '" + req.body.specification + "', type = '" + req.body.specificationType + "', status = 1 WHERE id = " + req.body.editID;
            dbConnection.query(sql_query, function (err, result) {
              return result ? res.send({ success: true, server_message: result }) : res.send({ success: false, error: err });
            });
          }
        } else {    // Insert 
          if (req.body.categoryId == 0) {   // All Category
            const productsActualCategory = JSON.parse(JSON.stringify(req.body.productsActualCategory));
            productsActualCategory.forEach((cat) => {
              if (req.body.specification == "Color") {  // color
                var sql_query = "INSERT INTO product_specification_names (specification_name, category_id, specification_type, type, status) VALUES ('" + req.body.specification + "', '" + cat.id + "', '" + req.body.specification + "', 0, '1' )";
                dbConnection.query(sql_query, function (err, result) {
                  serverResponse = result ? result : err;
                  // result ? console.log(result) : console.log('all cat - color error : ',err);
                  // return result ? res.send({ success: true, server_message: result }) : res.send({ success: false, error: err });
                });
              } else {  // weight or size
                var sql_query = "INSERT INTO product_specification_names (specification_name, category_id, specification_type, type, status) VALUES ('" + req.body.specificationName + "', '" + cat.id + "', '" + req.body.specification + "', '" + req.body.specificationType + "', '1' )";
                dbConnection.query(sql_query, function (err, result) {
                  serverResponse = result ? result : err;
                  // result ? console.log(result) : console.log('all cat - size / weight error : ', err);
                  // return result ? res.send({ success: true, server_message: result }) : res.send({ success: false, error: err });
                });
              }
            });
          } else {  // Multiple Selected Category
            const selectedProductCategoryIds = JSON.parse(JSON.stringify(req.body.selectedProductCategoryIds));
            for(let i = 0; i < selectedProductCategoryIds.length; i++){
              if (req.body.specification == "Color") {  // color
                var sql_query = "INSERT INTO product_specification_names (specification_name, category_id, specification_type, type, status) VALUES ('" + req.body.specification + "', '" + selectedProductCategoryIds[i] + "', '" + req.body.specification + "', 0, '1' )";
                dbConnection.query(sql_query, function (err, result) {
                  serverResponse = result ? result : err;
                  // result ? console.log(result) : console.log('selected cat - color error : ',err);
                  // return result ? res.send({ success: true, server_message: result }) : res.send({ success: false, error: err });
                });
              } else {  // weight or size
                var sql_query = "INSERT INTO product_specification_names (specification_name, category_id, specification_type, type, status) VALUES ('" + req.body.specificationName + "', '" + selectedProductCategoryIds[i] + "', '" + req.body.specification + "', '" + req.body.specificationType + "', '1' )";
                dbConnection.query(sql_query, function (err, result) {
                  serverResponse = result ? result : err;
                  // result ? console.log(result) : console.log('selected cat - size / weight error : ', err);
                  // return result ? res.send({ success: true, server_message: result }) : res.send({ success: false, error: err });
                });
              }
            }            
          }
        }
        res.send({ success: true, server_message: serverResponse })
      }
      catch(error){
        console.log(error);
        return res.send({ success: false, message:"Error has occured at the time of insert data to product_specification_names table", status: "500"});      
      }
    }
  });
});


routes.post("/saveSpecification", verifyToken, function (req, res) {  
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) res.status(403).send({ success: false, message: "jwt expired", status: "403" });
    
    try {
        let serverResponse;
        if (req.body.isUpdateClicked == true) {          
            if (req.body.specification == "Color") {  
                var sql_query ="UPDATE product_specification_names SET specification_name = '" +req.body.specification +"', category_id = '" +req.body.categoryId +"', specification_type = '" +req.body.specification +"', type = 0, status = 1 WHERE id = " +req.body.editID;
                dbConnection.query(sql_query, function (err, result) {
                    serverResponse = result ? result : err;
                });
            } else {
                var sql_query = "UPDATE product_specification_names SET specification_name = '" + req.body.specificationName + "', category_id = '" + req.body.categoryId + "', specification_type = '" + req.body.specification + "', type = '" + req.body.specificationType + "', status = 1 WHERE id = " + req.body.editID;
                dbConnection.query(sql_query, function (err, result) {
                    serverResponse = result ? result : err;
                });
            }
        } else { 
            
            if (req.body.categoryId == 0) {  // insert all
                const productsActualCategory = JSON.parse(JSON.stringify(req.body.productsActualCategory))
                
                let specification = JSON.stringify(req.body.specification)
                let specificationName = (req.body.specificationName == "") ? JSON.stringify("Color") : JSON.stringify(req.body.specificationName)
                let specificationType = (req.body.specification == "Color") ? 0 : parseInt( req.body.specificationType )
                
                productsActualCategory.forEach((cat) => { // cat.id
                    let sql_query = `INSERT INTO product_specification_names (specification_type, specification_name, category_id, type, status) 
                    VALUES ( ${specification}, ${specificationName}, ${cat.id}, ${specificationType}, 1 )`;
                    
                    let lookup_query = `SELECT COUNT(id) as count FROM product_specification_names WHERE category_id = ${cat.id} AND type = ${specificationType} AND softDel = 0`
                    
                    dbConnection.query(lookup_query, function (e, rows) {
                        let res = Object.values(JSON.parse(JSON.stringify(rows)))
                        if( parseInt(res[0].count) == 0){
                            dbConnection.query(sql_query, function (err, result) {
                                serverResponse = result ? result : err;
                            });
                        }
                    });
                });
            } else {  // insert selected
                const selectedProductCategoryIds = JSON.parse(JSON.stringify(req.body.selectedProductCategoryIds))
                
                let specification = JSON.stringify(req.body.specification)
                let specificationName = (req.body.specificationName == "") ? JSON.stringify("Color") : JSON.stringify(req.body.specificationName)
                let specificationType = (req.body.specification == "Color") ? 0 : parseInt( req.body.specificationType )

                selectedProductCategoryIds.forEach(element => {
                    let sql_query = `INSERT INTO product_specification_names (specification_type, specification_name, category_id, type, status) 
                    VALUES ( ${specification}, ${specificationName}, ${element}, ${specificationType}, 1 )`;
                    
                    let lookup_query = `SELECT COUNT(id) as count FROM product_specification_names WHERE category_id = ${element} AND type = ${specificationType} AND softDel = 0`
                    
                    dbConnection.query(lookup_query, function (e, rows) {
                        let res = Object.values(JSON.parse(JSON.stringify(rows)))
                        if( parseInt(res[0].count) == 0){
                            dbConnection.query(sql_query, function (err, result) {
                                serverResponse = result ? result : err;
                            });
                        }
                    });
                });
                
            }
        }
        res.send({ success: true, server_message: serverResponse })
    }
    catch(error){
        console.log(error);
        return res.send({ success: false, message:"Error has occured at the time of insert data to product_specification_names table", status: "500"});      
    }
    
  });
});

routes.get("/deleteProductSpecificationName", verifyToken, async function ( req, res) {
  jwt.verify(req.token, "secretkey", async function (err, authData) {
    if (err) {
      res
        .status(403)
        .send({ success: false, message: "jwt expired", status: "403" });
    } else {
      try {
        const delete_product_specification_names = await query(
          'UPDATE product_specification_names SET softDel = 1, status = "deactive" WHERE id = ' +
            req.query.id
        );
        return res.send({ success: true, message: "Data Deleted Succesfully" });
      } catch (e) {
        console.log(e);
        return res.send({ success: false, message: "Data Deletion Failed" });
      }
    }
  });
});

/*
** END
** Product -> Specificaton
*/

// Purchase

routes.post("/saveProductPurchase", async function (req, res) {
  console.log("Product Purchase : ", req.body);
  if (req.body.isUpdateClicked == false) {
    try {
      const insert_at_purchase = await query(
        "INSERT INTO inv_purchase (billNo, chalanNo, vat_registration, supplierId, storedBy, purchaseDate, totalQuantity, totalAmount, status) VALUES ( " +
          JSON.stringify(req.body.currentBillNo) +
          ", " +
          JSON.stringify(req.body.chalanNo) +
          ", " +
          JSON.stringify(req.body.vat_registration) +
          ", " +
          JSON.stringify(req.body.vendorId) +
          ", " +
          JSON.stringify(req.body.storedBy) +
          ", " +
          JSON.stringify(req.body.currentDate) +
          ", " +
          JSON.stringify(req.body.grandTotalQuantity) +
          ", " +
          JSON.stringify(req.body.grandTotalPrice) +
          ", 1 )"
      );
      purchaseElements = req.body.PurchaseList;
      for (var i = 0; i < purchaseElements.length; i++) {
        var colorValue = purchaseElements[i].colorValue ? JSON.stringify(purchaseElements[i].colorValue) : 0;
        var sizeValue = purchaseElements[i].sizeValue ? JSON.stringify(purchaseElements[i].sizeValue) : 0;
        
        const insert_at_purchase_details = await query(
          "INSERT INTO inv_purchase_details (purchaseId, billNo, productId, colorId, sizeId, quantity, price, totalPrice) VALUES (" +
            JSON.stringify(insert_at_purchase.insertId) +
            ", " +
            JSON.stringify(req.body.currentBillNo) +
            ", " +
            JSON.stringify(purchaseElements[i].id) +
            ", " +
            colorValue +
            ", " +
            sizeValue +
            ", " +
            JSON.stringify(purchaseElements[i].productQuantity) +
            ", " +
            JSON.stringify(purchaseElements[i].productPrice) +
            ", " +
            JSON.stringify(purchaseElements[i].totalPrice) +
            ")"
        );
      }
      return res.send({
        success: true,
        message: "Successfully inserted into inv_purchase_details table",
      });
    } catch (e) {
      console.log("Error : ", e);
      return res.send({ success: false, error: e });
    }
  } else {
    console.log("Update working");
    try {
      const update_at_purchase = await query(
        "UPDATE inv_purchase SET totalQuantity= " +
          JSON.stringify(req.body.grandTotalQuantity) +
          ", totalAmount = " +
          JSON.stringify(req.body.grandTotalPrice) +
          " WHERE softDel = 0 AND status = 1 AND id = " +
          req.body.purchaseId
      );
      purchaseElements = req.body.PurchaseList;
      const update_all_details_to_inactive = await query(
        "UPDATE inv_purchase_details SET status = 0 WHERE purchaseId = " +
          req.body.purchaseId
      );
      for (var i = 0; i < purchaseElements.length; i++) {
        const select_from_purchase_details = await query(
          "SELECT COUNT(id) AS counter FROM inv_purchase_details WHERE purchaseId = " +
            req.body.purchaseId +
            " AND productId = " +
            purchaseElements[i].id +
            " AND colorId = " +
            purchaseElements[i].colorValue +
            " AND sizeId = " +
            purchaseElements[i].sizeValue +
            " AND quantity = " +
            purchaseElements[i].productQuantity +
            " AND price = " +
            purchaseElements[i].productPrice +
            " AND totalPrice = " +
            purchaseElements[i].totalPrice
        );
        if (select_from_purchase_details[0].counter > 0) {
          const update_all_details_to_active = await query(
            "UPDATE inv_purchase_details SET status = 1 WHERE purchaseId = " +
              req.body.purchaseId +
              " AND productId = " +
              purchaseElements[i].id +
              " AND colorId = " +
              purchaseElements[i].colorValue +
              " AND sizeId = " +
              purchaseElements[i].sizeValue +
              " AND quantity = " +
              purchaseElements[i].productQuantity +
              " AND price = " +
              purchaseElements[i].productPrice +
              " AND totalPrice = " +
              purchaseElements[i].totalPrice
          );
        } else {
          const insert_at_purchase_details = await query(
            "INSERT INTO inv_purchase_details (purchaseId, billNo, productId, colorId, sizeId, quantity, price, totalPrice) VALUES (" +
              JSON.stringify(req.body.purchaseId) +
              ", " +
              JSON.stringify(req.body.currentBillNo) +
              ", " +
              JSON.stringify(purchaseElements[i].id) +
              ", " +
              JSON.stringify(purchaseElements[i].colorValue) +
              ", " +
              JSON.stringify(purchaseElements[i].sizeValue) +
              ", " +
              JSON.stringify(purchaseElements[i].productQuantity) +
              ", " +
              JSON.stringify(purchaseElements[i].productPrice) +
              ", " +
              JSON.stringify(purchaseElements[i].totalPrice) +
              ")"
          );
        }
      }
      return res.send({
        success: true,
        message: "Successfully inserted into inv_purchase_details table",
      });
    } catch (e) {
      console.log("Error : ", e);
      return res.send({ success: false, error: e });
    }
  }
});

routes.get("/getPurchaseInfoForUpdate", async function (req, res) {
  try {
    const get_info_from_purchase = await query(
      "SELECT * FROM inv_purchase WHERE softDel = 0 AND id = " + req.query.id
    );
    const get_info_from_purchase_details = await query(
      "SELECT * FROM inv_purchase_details WHERE status = 1 AND purchaseId = " +
        req.query.id
    );
    const get_product = await query(
      "SELECT products.id, products.product_name, products.product_sku, color_infos.name, size_infos.size, inv_purchase_details.colorId, inv_purchase_details.sizeId, inv_purchase_details.quantity, inv_purchase_details.price, inv_purchase_details.totalPrice FROM inv_purchase_details INNER JOIN color_infos ON inv_purchase_details.colorId = color_infos.id INNER JOIN size_infos ON inv_purchase_details.sizeId = size_infos.id INNER JOIN products ON inv_purchase_details.productId = products.id WHERE inv_purchase_details.status = 1 AND inv_purchase_details.purchaseId = " +
        req.query.id
    );
    const supplierName = await query(
      "SELECT name FROM vendor WHERE id = " +
        get_info_from_purchase[0].supplierId
    );

    return res.send({
      success: true,
      data: [
        get_info_from_purchase[0],
        get_info_from_purchase_details,
        supplierName[0].name,
        get_product,
      ],
      message: "data for purchase update",
    });
  } catch (e) {
    console.log("Error at the time fetching data for purchase update....");
    console.log(e);
    return res.send({
      success: false,
      data: [],
      message: "data for purchase update",
    });
  }
});

// Purchase Return

routes.get('/purchase_return_list', async function (req, res) {
  if (req.query.id == 0) {
    const purchase_return_list = await query ('SELECT * FROM inv_purchase_return WHERE status = 1');
    return res.send({data: purchase_return_list, message: 'data' });
  }
  else {
    const purchase_return_list = await query ('SELECT * FROM inv_purchase_return WHERE status = 1 AND returnedBy = '+req.query.id);
    return res.send({data: purchase_return_list, message: 'data' });
  }
});

routes.post("/saveProductPurchaseReturn", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res
        .status(403)
        .send({ success: false, message: "jwt expired", status: "403" });
    } else {
      var purchase_table_id = 0;
      var purchaseListArray = [];
      promise = new Promise(function (resolve, reject) {
        try {
          var insert_sql_query =
            "INSERT INTO inv_purchase_return (purchaseReturnBillNo, supplierId, returnedBy, purchaseReturnDate, totalQuantity, totalAmount, status) VALUES ('" +
            req.body.purchaseReturnNo +
            "', '" +
            req.body.vendorIdForPurchase +
            "', '" +
            req.body.returnedBy +
            "', '" +
            req.body.purchaseReturnDate +
            "', '" +
            req.body.grandTotalQuantity +
            "', '" +
            req.body.grandTotalPrice +
            "', '1')";
          dbConnection.query(insert_sql_query, function (err, result) {
            if (result) {
              resolve(result.insertId);
            } else {
              console.log("Error to inseret at user : ", err);
              return res.send({ success: false, error: err });
            }
          });
        } catch (error) {
          if (error)
            return res.send({
              success: false,
              error:
                "Error has occured at the time of insert data to PRODUCTS table",
              request: req.body,
            });
        }
      })
        .then(function (resolve) {
          console.log("returned value form previous state : ", resolve);
          console.log(
            "purchase_table_id form previous state : ",
            purchase_table_id
          );
          purchaseElements = req.body.PurchaseList;
          console.log("ASYNC LOOP OUTSIDE");
          async.forEachOf(
            purchaseElements,
            function (purchaseElement, i, inner_callback) {
              console.log("ASYNC LOOP INSIDE", purchaseElement);
              var insert_sql_query =
                "INSERT INTO inv_purchase_return_details (purchaseReturnId, purchaseReturnBillNo, productId, colorId, sizeId, quantity, price, totalPrice, status) VALUES ('" +
                resolve +
                "', '" +
                req.body.purchaseReturnNo +
                "', '" +
                purchaseElement.id +
                "', '" +
                purchaseElement.colorValue +
                "', '" +
                purchaseElement.sizeValue +
                "', '" +
                purchaseElement.productQuantity +
                "', '" +
                purchaseElement.productPrice +
                "', '" +
                purchaseElement.totalPrice +
                "', '1')";
              console.log(insert_sql_query);
              dbConnection.query(insert_sql_query, function (
                err,
                results,
                fields
              ) {
                if (!err) {
                  console.log("Query Results : ", results);
                  inner_callback(null);
                } else {
                  console.log("Error while performing Query");
                  inner_callback(err);
                }
              });
            },
            function (err) {
              if (err) {
                console.log("ASYNC loop error !");
                return res.send({ success: false, error: err });
              } else {
                console.log(
                  "Successfully inserted into inv_purchase_details table"
                );
                return res.send({
                  success: true,
                  message:
                    "Successfully inserted into inv_purchase_details table",
                });
              }
            }
          );
        })
        .catch(function (reject) {
          console.log("Promise rejected", reject);
          return res.send({ success: false, error: err });
        });
    }
  });
});

routes.get('/getPurchaseReturnInfoForUpdate', verifyToken, async function(req, res) {

  jwt.verify(req.token, 'secretkey', async function (err, authData) {
    if (err) {
      res.sendStatus(403);
    }
    else {

      try {
        console.log('Requested For : ', req.query.id);

        const get_info_from_purchase = await query ('SELECT * FROM inv_purchase_return WHERE status = 1 AND id = '+req.query.id);

        const get_info_from_purchase_details = await query('SELECT * FROM inv_purchase_return_details WHERE status = 1 AND purchaseReturnId = '+req.query.id);

        const get_product = await query ('SELECT products.id, products.product_name, products.product_sku, color_infos.name, size_infos.size, inv_purchase_return_details.colorId, inv_purchase_return_details.sizeId, inv_purchase_return_details.quantity, inv_purchase_return_details.price, inv_purchase_return_details.totalPrice FROM inv_purchase_return_details INNER JOIN color_infos ON inv_purchase_return_details.colorId = color_infos.id INNER JOIN size_infos ON inv_purchase_return_details.sizeId = size_infos.id INNER JOIN products ON inv_purchase_return_details.productId = products.id WHERE inv_purchase_return_details.status = 1 AND inv_purchase_return_details.purchaseReturnId = '+req.query.id);

        const supplierName = await query('SELECT name FROM vendor WHERE id = '+get_info_from_purchase[0].supplierId);

        console.log('Purchase Update Info : ', get_info_from_purchase[0]);
        console.log('Purchase Update Info : ', get_info_from_purchase_details);
        console.log('Purchase Update Info : ', supplierName[0].name);
        console.log('Purchase Update Info : ', get_product);

        return res.send({ success: true, data: [get_info_from_purchase[0], get_info_from_purchase_details, supplierName[0].name, get_product], message: 'data for purchase update' });
      } catch (e) {
        console.log('Error at the time fetching data for purchase update....');
        console.log(e);

        return res.send({ success: false, data: [], message: 'data for purchase update' });
      }

    }
  });

});


// ADD PRODUCT

routes.post("/saveProduct", verifyToken, async function (req, res) {
  jwt.verify(req.token, "secretkey", async function (err, authData) {
    if (err) {
      res.status(403).send({ success: false, message: "jwt expired", status: "403" });
    } else {              
      try {
        if (req.files != null) {

          if (!req.body.productFiles) {
            var productFilesArray = [];
            productFilesArray = req.body.productResizedImages;
            if (Array.isArray(productFilesArray)) {
              productFilesArray.map(function (file, index) {                
                var imageName = req.body.fileNameExclude[index] + '.png';
                var productFiles = file;
                var matches = productFiles.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/), response = {};
                response.type = matches[1];
                response.data = Buffer.from(matches[2], 'base64');
                fs.writeFile(`${__dirname}/../../upload/product/compressedProductImages/${imageName}`, response.data, (err) => {
                  if (err) throw err;
                });
              })
            }
            else {              
              var imageName = req.body.fileNameExclude + '.png';              
              var productFiles = req.body.productResizedImages;
              var matches = productFiles.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/), response = {};              
              response.type = matches[1];
              response.data = Buffer.from(matches[2], 'base64');
              fs.writeFile(`${__dirname}/../../upload/product/compressedProductImages/${imageName}`, response.data, (err) => {
                if (err) throw err;               
              });              
            }
          }

          if (!req.body.productDescriptionFiles) {
            if (req.files.productDescriptionFiles) {
              if (Array.isArray(req.files.productDescriptionFiles)) {
                req.files.productDescriptionFiles.map(function (file, index) {
                  file.mv(`${__dirname}/../../upload/product/productDescriptionImages/${file.name}`, err => {
                    if (err) throw err;
                  });
                })
              }
              else {
                let productDescriptionFiles = req.files.productDescriptionFiles;
                productDescriptionFiles.mv(`${__dirname}/../../upload/product/productDescriptionImages/${productDescriptionFiles.name}`, err => {
                  if (err) throw err;
                });
              }
            }
          }

          if (!req.body.colorFiles) {
            var productFilesArray = [];
            productFilesArray = req.files.colorFiles;
            if (Array.isArray(productFilesArray)) {
              productFilesArray.map(function (file, index) {
                file.mv(`${__dirname}/../../upload/product/compressedProductImages/${file.name}`, err => {
                  if (err) throw err;                  
                });
              })
            }
            else {
              let productFiles = req.files.colorFiles;
              productFiles.mv(`${__dirname}/../../upload/product/compressedProductImages/${productFiles.name}`, err => {
                if (err) throw err;                
              });
            }
          }

        }


        var specificationValues = '';
        var specificationKey = '';
        var specificationArray = [];        
        var fullStateData = JSON.parse(req.body.specificationDetailsFullState);
        var specificationBoxFun = JSON.parse(req.body.productSpecificationBoxFun);
        var specificationBoxFun1 = JSON.parse(req.body.productSpecificationBoxFun1);
        var colorImageObjects = JSON.parse(req.body.colorImageObjects);
        var specifiationOBJ = {};

        if (specificationBoxFun1.length > 0 && colorImageObjects.length > 0) {
          specifiationOBJ.color = colorImageObjects;
          // specifiationOBJ.size = specificationBoxFun;
          // specifiationOBJ = { ...specifiationOBJ, ...specificationBoxFun };           
        }
        else if (specificationBoxFun1.length > 0 && colorImageObjects.length == 0) {
          specifiationOBJ.color = specificationBoxFun1;
          // specifiationOBJ.size = specificationBoxFun;
          // specifiationOBJ = { ...specifiationOBJ, ...specificationBoxFun };          
        }
        else if (specificationBoxFun1.length == 0 && colorImageObjects.length > 0) {
          specifiationOBJ.color = colorImageObjects;
          // specifiationOBJ.size = specificationBoxFun;
          // specifiationOBJ = { ...specifiationOBJ, ...specificationBoxFun };          
        }

        const productSpecificationWeight = JSON.parse(req.body.productSpecificationWeight);
        const productSpecificationSize = JSON.parse(req.body.productSpecificationSize);
        const productSpecObj = productSpecificationWeight.concat(productSpecificationSize);
        console.log('productSpecObj : ', productSpecObj);  
        // return;

        // specifiationOBJ = { ...specifiationOBJ, ...specificationBoxFun };
        specifiationOBJ = { ...specifiationOBJ, ...productSpecObj };
        console.log('specifiationOBJ ... : ', specifiationOBJ);  
        // return;
       
        
        if(Object.values(fullStateData).length > 0) {
          var loopCounter = Object.values(fullStateData).length + 1;
          for (var i = 0; i < loopCounter; i++) {
            if (i < Object.values(fullStateData).length) {
              let testObject = {};
              specificationValues = Object.values(Object.values(fullStateData)[i]);
              specificationKey = Object.keys(fullStateData)[i];
              testObject.specificationDetailsName = specificationKey;
              testObject.specificationDetailsValue = specificationValues[0];
              specificationArray.push(testObject);
            }            
          }
        }

        var metaTags = JSON.parse(req.body.metaTags);
        var tags = [];
        for (var i = 0; i < metaTags.length; i++) {
          tags.push(metaTags[i].displayValue);
        }


        const lastInsertId = await query(`SELECT id FROM products ORDER BY id DESC LIMIT 1`);  
        // console.log('lastInsertId[0] ===== ', lastInsertId[0]);
        // const productIdForSlug = (!Array.isArray(lastInsertId[0]) || !lastInsertId[0].length) ? lastInsertId[0].id + 1 : 1;
        const productIdForSlug = lastInsertId[0] ? lastInsertId[0].id + 1 : 1;

        let brandName = (req.body.productBrand) ? req.body.productBrand[0] : "";

        const insert_product = await query(
          `INSERT INTO products (
            product_name, category_id, product_sku, productPrice, brand_name, 
            image, home_image, product_full_description, 
            vendor_id, entry_by, entry_user_type, 
            qc_status, status, isApprove,
            product_specification_name,
            product_specification_details_description, 
            metaTags            
          ) 
          VALUES (
            '${req.body.productName}' , '${req.body.categoryIdValue}' , '${req.body.productSKUcode}' , '${req.body.productPrice}' , '${brandName}' ,
            '${req.body.productImagesJson}' , '${req.body.homeImage}' , '${req.body.productDescriptionFull}' ,
            '${req.body.vendor_id}' , '${req.body.entry_by}' , '${req.body.entry_user_type}' ,
            '1' , '1' , '2',
            '${JSON.stringify(specifiationOBJ)}', 
            '${JSON.stringify(specificationArray)}',
            '${JSON.stringify(tags)}'                   
          )`
        );
        console.log(insert_product);
        let slug = JSON.stringify(slugify(req.body.productName, productIdForSlug));
        const update_product_slug = await query(`Update products set slug = ${slug} WHERE id = ${productIdForSlug}`);
        console.log(update_product_slug);

        return res.send({success: true, message: 'success'});       
      } catch (error) {
        console.log("ERROR : ", error);
        return res.send({success: false, message: "Error has occured at the time of insert data to PRODUCTS table"});          
      }
    }
  });
});


// STOCK

routes.get('/confirmPurchase', verifyToken, async function (req, res) {
  jwt.verify(req.token, 'secretkey', async function (err, authData) {
    if (err) {
      res.status(403).send({success: false, message: 'jwt expired', status: '403'});
    }
    else {
      try {
        const updatePurchase = await query('UPDATE inv_purchase SET isConfirmed = 2 WHERE id = '+req.query.id);

        var currentdate = new Date();
        var datetime = currentdate.getFullYear() + "-" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate();

        var selectFromPurchaseDatails = await query ('SELECT inv_purchase_details.productId, inv_purchase_details.colorId, inv_purchase_details.sizeId, inv_purchase_details.quantity, inv_purchase.supplierId, inv_purchase.storedby FROM inv_purchase_details JOIN inv_purchase ON inv_purchase_details.purchaseId = inv_purchase.id WHERE inv_purchase_details.status = 1 AND inv_purchase_details.purchaseId = '+ req.query.id);

        console.log('Purchase ID : ', req.query.id);

        for (var i = 0; i < selectFromPurchaseDatails.length; i++) {
          console.log('selected products purchase : ', selectFromPurchaseDatails[i]);
          let entry_by = selectFromPurchaseDatails[i].storedby; 
          let entry_user_type = selectFromPurchaseDatails[i].storedby == 0 ? 'admin' : 'vendor';
          
          selectFromPurchaseDatails[i].colorId = 0;
          selectFromPurchaseDatails[i].sizeId = 0;
          
          const insert_at_stock = await query ('INSERT INTO stock (productId, vendorId, entry_by, entry_user_type, colorId, sizeId, quantity, softDel, status, createdBy, createdAt) VALUES ('+JSON.stringify(selectFromPurchaseDatails[i].productId)+', '+JSON.stringify(selectFromPurchaseDatails[i].supplierId)+', '+JSON.stringify(entry_by)+', '+JSON.stringify(entry_user_type)+', '+selectFromPurchaseDatails[i].colorId+', '+JSON.stringify(selectFromPurchaseDatails[i].sizeId)+', '+JSON.stringify(selectFromPurchaseDatails[i].quantity)+', '+'0'+', '+'1'+', '+req.query.employee_id+', '+datetime+')')
        }

        return res.send({ success: true, data: [], message: 'Purchase confirmed Succesfully !' });

      } catch (e) {
        console.log('Error occured at the time of purchase confirmation', e);
        return res.send({ success: false, data: [], message: 'Purchase Confirmation Failed !' });
      }
    }
  });

});

routes.get('/confirmPurchaseReturn', verifyToken, async function (req, res) {
  jwt.verify(req.token, 'secretkey', async function (err, authData) {
    if (err) {
      res.status(403).send({success: false, message: 'jwt expired', status: '403'});
    }
    else {
      try {

        const updatePurchase = await query('UPDATE inv_purchase_return SET isConfirmed = 2 WHERE id = '+req.query.id);

        var currentdate = new Date();
        var datetime = currentdate.getFullYear() + "-"
                        + (currentdate.getMonth()+1)  + "-"
                        + currentdate.getDate();

        var selectFromPurchaseDatails = await query ('SELECT inv_purchase_return_details.productId, inv_purchase_return_details.colorId, inv_purchase_return_details.sizeId, inv_purchase_return_details.quantity, inv_purchase_return.supplierId, inv_purchase_return.returnedBy FROM inv_purchase_return_details JOIN inv_purchase_return ON inv_purchase_return_details.purchaseReturnId = inv_purchase_return.id WHERE inv_purchase_return_details.status = 1 AND inv_purchase_return_details.purchaseReturnId = '+ req.query.id);

        console.log('Purchase ID : ', req.query.id);
        console.log('selectedPurchasedProduct : ', selectFromPurchaseDatails );

        for (var i = 0; i < selectFromPurchaseDatails.length; i++) {
          console.log('selected products purchase : ', selectFromPurchaseDatails[i]);
          var quantity = Number(selectFromPurchaseDatails[i].quantity) * Number(-1);
          console.log('Quantity : ', quantity);
          let entry_by = selectFromPurchaseDatails[i].returnedBy; 
          let entry_user_type = selectFromPurchaseDatails[i].returnedBy == 0 ? 'admin' : 'vendor';
          
          selectFromPurchaseDatails[i].colorId = 0;
          selectFromPurchaseDatails[i].sizeId = 0;
          
          const insert_at_stock = await query ('INSERT INTO stock (productId, vendorId, entry_by, entry_user_type, colorId, sizeId, quantity, softDel, status, createdBy, createdAt) VALUES ('+JSON.stringify(selectFromPurchaseDatails[i].productId)+', '+JSON.stringify(selectFromPurchaseDatails[i].supplierId)+', '+JSON.stringify(entry_by)+', '+JSON.stringify(entry_user_type)+', '+selectFromPurchaseDatails[i].colorId+', '+JSON.stringify(selectFromPurchaseDatails[i].sizeId)+', '+JSON.stringify(quantity)+', '+'0'+', '+'1'+', '+req.query.employee_id+', '+datetime+')')
        }

        return res.send({ success: true, data: [], message: 'Purchase confirmed Succesfully !' });

      } catch (e) {
        console.log('Error occured at the time of purchase confirmation');
        console.log(e);

        return res.send({ success: false, data: [], message: 'Purchase Confirmation Failed !' });
      }
    }
  });

});


routes.get('/product_specification_names', (req, res) => {
  dbConnection.query('SELECT product_specification_names.id AS id, product_specification_names.specification_name AS specification_name, product_specification_names.category_id AS category_id, product_specification_names.type AS type, product_specification_names.specification_type AS specification_type, category.category_name AS category_name FROM product_specification_names JOIN category ON product_specification_names.category_id = category.id WHERE product_specification_names.status = 1 AND product_specification_names.softDel = 0 ORDER BY product_specification_names.id DESC', function (error, results, fields) {
    console.log(results);
    if (error) throw error;
    return res.send({ error: error, data: results, message: 'sepecification name list.' });
  });
});


// SALES RETURN

routes.post('/saveSalesReturn', verifyToken, (req, res) => {
  console.log('Sales Return Request : ', req.body);
  
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    }
    else {
      var purchase_table_id = 0;
      var purchaseListArray = [];

      promise = new Promise (function (resolve, reject) {

        try {
          var insert_sql_query = "INSERT INTO sales_return (salesReturnBillNo, salesBillId, customerId, salesDate, salesReturnDate, totalSalesReturnQuantity, totalSalesReturnAmount, totalSalesPayAmount, salesReturnPayAmount, reason, status) VALUES ('"+req.body.purchaseReturnNo+"', '"+req.body.sales_bill_id+"', '"+req.body.customer_id+"', '"+req.body.sales_date+"', '"+req.body.purchaseReturnDate+"',        '"+req.body.grandTotalQuantity+"', '"+req.body.grandTotalPrice+"', '"+req.body.sales_pay_amount+"', '"+req.body.totalReturnAmount+"', '"+req.body.reason+"', '1')";

          dbConnection.query(insert_sql_query, function (err, result) {
            console.log('user insert result : ', result.insertId);
            console.log('user error result : ', err);
            if (result) {
              console.log("1 record inserted to user");
              // return res.send({success: true, server_message: result});
              resolve(result.insertId);
            }
            else {
              console.log('Error to inseret at user : ', err);
              return res.send({success: false, error: err});
            }
          });
        }
        catch (error) {
          if (error) return res.send({success: false, error: 'Error has occured at the time of insert data to PRODUCTS table', request : req.body});
        }

      }).then( function (resolve) {

        purchaseElements = req.body.PurchaseList;

        async.forEachOf(purchaseElements, function (purchaseElement, i, inner_callback){

          var insert_sql_query = "INSERT INTO sales_return_details (salesReturnId, salesReturnDate, productId, salesReturnQuantity, totalAmount, status) VALUES ('"+resolve+"', '"+req.body.purchaseReturnDate+"', '"+purchaseElement.id+"', '"+purchaseElement.productQuantity+"', '"+purchaseElement.totalPrice+"', '1')";

          dbConnection.query(insert_sql_query, function(err, results, fields){
            if(!err){
              console.log("Query Results : ", results);
              inner_callback(null);
            } else {
              console.log("Error while performing Query");
              inner_callback(err);
            };
          });
        }, function(err){
          if(err){
            console.log('ASYNC loop error !');
            return res.send({success: false, error: err});
          }else{
            console.log('Successfully inserted into inv_purchase_details table');
            return res.send({success: true, message: 'Successfully inserted into inv_purchase_details table'});
          }
        });

      }).catch(function (reject) {
        console.log('Promise rejected', reject);
        return res.send({success: false, error: err});
      });

      // return res.send({success: false, message: 'Successfully inserted into inv_purchase_details table'});
    }
  });

});



// SEARCH PRODUCTS FOR PURCHASE

routes.get("/search_products_for_purchase", verifyToken, (req, res) => {
  console.log("Vendor Values : ", req.query.vendorId);
  console.log("Vendor Values : ", req.query.id);

  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      dbConnection.query(
        'SELECT * FROM products WHERE entry_user_type = "' +
          req.query.user_type +
          '" AND vendor_id = "' +
          req.query.vendorId +
          '" AND ( LOWER(product_name) LIKE "%' +
          req.query.id +
          '%" OR  LOWER(product_sku) LIKE "%' +
          req.query.id +
          '%") ',
        function (error, results, fields) {
          if (error) throw error;
          return res.send({ data: results, message: "data" });
        }
      );
    }
  });
});


routes.get("/search_purchase_products", verifyToken, (req, res) => {
  console.log("Vendor Values : ", req.query.vendorId);
  console.log("Vendor Values : ", req.query.id);

  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var searchedProducts = [];

      new Promise(function (resolve, reject) {
        dbConnection.query(
          'SELECT id FROM products WHERE entry_by = "' +
            req.query.vendorId +
            '" AND ( LOWER(product_name) LIKE "%' +
            req.query.id +
            '%" OR LOWER(product_sku) LIKE "%' +
            req.query.id +
            '%" ) ',
          function (error, results, fields) {
            console.log(results);
            if (error) throw error;
            (results.length > 0) ? resolve(results) : reject("rejected");            
          }
        );
      })
        .then(function (purchaseElements) {
          console.log('purchaseElements : ', purchaseElements);

          async.forEachOf(
            purchaseElements,
            function (purchaseElement, i, inner_callback) {
              var select_sql =
                "SELECT products.id AS id, products.product_name AS product_name, products.product_sku AS product_sku FROM products JOIN inv_purchase_details ON products.id = inv_purchase_details.productId WHERE products.id='" +
                purchaseElement.id +
                "' AND inv_purchase_details.productId='" +
                purchaseElement.id +
                "' ";

              dbConnection.query(select_sql, function (err, results, fields) {
                if (!err) {
                  if (results.length > 0) {
                    searchedProducts.push(results);
                  }

                  inner_callback(null);
                } else {
                  console.log("Error while performing Query");
                  inner_callback(err);
                }
              });
            },
            function (err) {
              if (err) {
                //handle the error if the query throws an error
                console.log("Error at ASYNC");
                return res.send({ data: [], message: "data" });
              } else {
                //whatever you wanna do after all the iterations are done
                console.log("Success at ASYNC");
                return res.send({ data: searchedProducts, message: "data" });
              }
            }
          );
        })
        .catch(function (reject) {
          console.log("Rejected");
          return res.send({ data: [], message: "data" });
        });

      // return res.send({ success: 'true', data: req.query.id, message: 'data' });
    }
  });
});


// PRODUCT WISE SPECIFICATION 

routes.get('/getSpecificationNamesValues', verifyToken, async function (req, res) {
  console.log('Vendor Values : ', req.query.vendorId);
  console.log('Vendor Values : ', req.query.id);

  jwt.verify(req.token, 'secretkey', async function (err, authData) {
    if (err) {
      res.sendStatus(403);
    }
    else {
      try {
        const get_specification_list = await query ('SELECT product_specification_name FROM products WHERE id = '+req.query.id);

        let parse_specification_values = JSON.parse(get_specification_list[0].product_specification_name);
        // console.log("parse_specification_values : ", parse_specification_values);

        let colorList = [];
        if (parse_specification_values.hasOwnProperty("color")) {
          let colorListParse = parse_specification_values["color"];
          for (let i = 0; i < colorListParse.length; i++) {
            const color_name = await query(
              "SELECT name FROM color_infos WHERE id = " +
                colorListParse[i].colorId
            );
            let colorOBJ = {};
            colorOBJ.id = colorListParse[i].colorId;
            colorOBJ.name = color_name[0].name;
            colorList.push(colorOBJ);
          }
        }
        console.log('colorList : ', colorList);

        let sizeList = [];
        if (parse_specification_values[0]) {
          sizeList = parse_specification_values[0].hasOwnProperty("Number")
            ? parse_specification_values[0].Number
            : parse_specification_values[0].Roman_Number;
        }      
        console.log('sizeList : ', sizeList);

        return res.send({ success : true, data : get_specification_list, colorList : colorList, sizeList : sizeList });
      } catch (e) {
        console.log('Error : ', e);
        return res.send({ success : false, error: e, data : [], colorList : [], sizeList : [] });
      }
    }
  });
});


routes.get("/getSizeInfos", async function (req, res) {
  try {
    const get_size_infos = await query(
      "SELECT size_infos.id AS id, size_infos.size AS size, size_infos.size_type_id AS size_type_id, size_type.name FROM size_infos JOIN size_type ON size_infos.size_type_id = size_type.id WHERE size_infos.softDel = 0 AND size_infos.status = 1 AND size_type.softDel = 0 AND size_type.status = 1"
    );

    return res.send({ success: true, data: get_size_infos });
  } catch (e) {
    console.log("Error : ", e);
    return res.send({ success: true, data: [] });
  }
});


// SALES REPORT

routes.get("/vendor_sales_info", async function (req, res) {
  try {
    const get_salaes_info = await query(
      "SELECT sales.id AS id, sales.sales_bill_no AS sales_bill_no, sales.sales_type, sales.sales_date AS sales_date, sales_details.sales_product_quantity AS total_sales_quantity, sales_details.total_amount AS total_sales_amount, sales_details.discounts_amount AS discount_amount, sales.isConfirmed AS isConfirmed, sales.isEMI AS isEMI FROM sales JOIN sales_details ON sales.id = sales_details.salesBillId JOIN products ON sales_details.productId = products.id WHERE sales.softDel = 0 AND sales.status = 1 AND sales.isConfirmed = 2 AND products.entry_by = " +
        req.query.id
    );

    return res.send({ success: true, sales: get_salaes_info });
  } catch (e) {
    return res.send({
      success: false,
      message: "Something went wrong!",
      error: e,
    });
  }
});

routes.get('/sales_details_info', async function (req,res){
  try {
       console.log('Sales Id : ', req.query.id);

      var product_info = [];

      var get_salaes_details_info = ''

      const get_salaes_info = await query ('SELECT * FROM sales WHERE softDel = 0 AND status = 1 AND id = '+ req.query.id);

      const get_customer_info = await query ('SELECT * FROM customers_address WHERE status = 1 AND id = '+get_salaes_info[0].customer_id);

      // console.log('req.query.userId : ', req.query.userId);

      if (req.query.userId == 0) {
          get_salaes_details_info = await query ('SELECT * FROM sales_details WHERE status = 1 AND salesBillId = '+ req.query.id);
      }
      else {
          console.log('for vendor ...');
          // WE NEED TO JOIN PRODUCT TABLE TO GET VENDOR WISE INFO
          get_salaes_details_info = await query ('SELECT sales_details.id AS id, sales_details.productId AS productId, sales_details.colorId AS colorId, sales_details.sizeId AS sizeId, sales_details.salesBillId AS salesBillId, sales_details.sales_product_quantity AS sales_product_quantity, sales_details.unitPrice AS unitPrice, sales_details.total_amount AS total_amount, sales_details.customer_payable_amount AS customer_payable_amount, sales_details.deliveryCharge AS deliveryCharge, sales_details.chalan_no AS chalan_no, sales_details.discounts_amount AS discounts_amount, sales_details.isAcceptedByVendor AS isAcceptedByVendor, sales_details.delivery_status AS delivery_status FROM sales_details JOIN products ON sales_details.productId = products.id WHERE sales_details.status = 1 AND sales_details.salesBillId = '+ req.query.id+' AND products.entry_by = '+req.query.userId);
      }

      // console.log('Slaes Details table info : ', get_salaes_details_info);

      for (var i = 0; i < get_salaes_details_info.length; i++) {
          var product_obj = {};

          const get_product_info = await query ('SELECT product_name, brand_name, entry_by, entry_user_type FROM products WHERE softDelete = 0 AND status = 1 AND id = '+ get_salaes_details_info[i].productId);
          // console.log('Product Info : ', get_product_info);

          const get_color_info = await query ('SELECT name FROM color_infos WHERE id = '+ get_salaes_details_info[i].colorId);
          const get_size_info = await query ('SELECT size FROM size_infos WHERE id = '+ get_salaes_details_info[i].sizeId);

          // console.log(get_color_info);
          // console.log(get_size_info);

          const customer_info = await query ('SELECT name, email, address FROM customers_address WHERE status = 1 AND id = '+get_salaes_info[0].customer_id);
           
           console.log('get_salaes_info == ', get_salaes_info[0] );
           console.log('get_customer_info == ', get_customer_info[0] );
           console.log('customer_info == ', customer_info[0]);

          product_obj.product_name = get_product_info[0].product_name;
          product_obj.brand = get_product_info[0].brand_name;
          product_obj.user_type = get_product_info[0].entry_user_type;
          product_obj.vendor_id = get_product_info[0].entry_by;
          product_obj.color = get_color_info.length > 0 ? get_color_info[0].name : '';
          product_obj.size = get_size_info.length > 0 ? get_size_info[0].size : '';
          product_obj.salesId = get_salaes_details_info[i].salesBillId;
          product_obj.salesDetailsId = get_salaes_details_info[i].id;
          product_obj.sales_product_quantity = get_salaes_details_info[i].sales_product_quantity;
          product_obj.unitPrice = get_salaes_details_info[i].unitPrice;
          product_obj.total_amount = get_salaes_details_info[i].total_amount;
          product_obj.customer_payable_amount = get_salaes_details_info[i].customer_payable_amount;
          product_obj.deliveryCharge = get_salaes_details_info[i].deliveryCharge;
          product_obj.chalan_no = get_salaes_details_info[i].chalan_no;
          product_obj.discounts_amount = get_salaes_details_info[i].discounts_amount;
          product_obj.is_accepted = get_salaes_details_info[i].isAcceptedByVendor;
          product_obj.delivery_status = get_salaes_details_info[i].delivery_status;
          product_obj.sales_type = get_salaes_info[0].sales_type;
          product_obj.isEMI = get_salaes_info[0].isEMI;
          
        //   product_obj.customer_name = get_salaes_info[0].name;
        //   product_obj.customer_email = get_salaes_info[0].email;
        //   product_obj.customer_address = get_salaes_info[0].address;
          product_obj.customer_name = customer_info[0].name;
          product_obj.customer_email = customer_info[0].email;
          product_obj.customer_address = customer_info[0].address;
          
          product_obj.sales_date = get_salaes_info[0].sales_date;

          product_info.push(product_obj);
      }

      return res.send({success: true, sales_details: get_salaes_details_info, product_info: product_info, sales_info: get_salaes_info[0], customer_info: get_customer_info[0]});
  } catch (e) {
      console.log('Error : ', e);

      return res.send({success: false, message: 'Something went wrong!', error: e});
  }
});



routes.get('/get_sales_info/:id', async function (req,res){
  const { id } = req.params;
  try {
      const get_salaes_info = await query (`SELECT * FROM sales WHERE id = ${id}`);
      return res.send({success: true, sales: get_salaes_info});
  } catch (e) {
      return res.send({success: false, message: 'Something went wrong!', error: e});
  }
});

// routes.get('/sales_info', async function (req,res){
//   try {
//       const get_sales_info = await query ('SELECT * FROM sales WHERE softDel = 0 AND status = 1');
//       return res.send({success: true, sales: get_sales_info});
//   } catch (e) {
//       return res.send({success: false, message: 'Something went wrong!', error: e});
//   }
// });



routes.get('/vendor_sales_courier_info', async function (req,res){
  try {
      const get_salaes_info = await query ('SELECT sales.id AS id, sales.sales_bill_no AS sales_bill_no, sales.sales_type, sales.sales_date AS sales_date, sales_details.sales_product_quantity AS total_sales_quantity, sales_details.total_amount AS total_sales_amount, sales_details.discounts_amount AS discount_amount, sales_details.courier_partner, sales_details.courier_order_code, sales.isConfirmed AS isConfirmed, sales.isEMI AS isEMI FROM sales JOIN sales_details ON sales.id = sales_details.salesBillId JOIN products ON sales_details.productId = products.id WHERE sales.softDel = 0 AND sales.status = 1 AND sales_details.courier_order_code IS NOT NULL AND products.entry_by = '+req.query.id);
      const get_salaes_productid = await query ('SELECT productId FROM sales_details WHERE status = 1');
      return res.send({success: true, sales: get_salaes_info});
  } catch (e) {       
      return res.send({success: false, message: 'Something went wrong!', error: e});
  }
});


routes.post('/confirm_sale', async function (req,res){
  try {
      const confirm_sale = await query ('UPDATE sales SET isConfirmed = 2 WHERE id = '+req.body.editID);

      const get_sales_bill_no = await query ('SELECT sales_bill_no FROM sales WHERE softDel = 0 AND status = 1 AND isConfirmed = 2 AND id = '+req.body.editID);

      const get_vendors_unique_id = await query ('SELECT DISTINCT products.entry_by AS vendor_id FROM sales_details JOIN products ON sales_details.productId = products.id WHERE sales_details.salesBillId = '+req.body.editID);

      console.log('get_vendors_unique_id : ', get_vendors_unique_id);

      for (var i = 0; i < get_vendors_unique_id.length; i++) {

          const get_email = await query ('SELECT email FROM user WHERE employee_id = '+get_vendors_unique_id[i].vendor_id);

          if (get_email.length > 0) {

              try {
                  const cipher = crypto.createCipher('aes192', 'a password');
                  var encrypted = cipher.update(get_email[0].email, 'utf8', 'hex');
                  encrypted += cipher.final('hex');

                  var mailOption = {
                      from : 'info@alahee.com',
                      to : get_email[0].email,
                      subject : 'Sales',
                      html: `<strong>Another sale!</strong> Please login to admin panel to check the activity. Current Sales Bill No is : <strong>"${get_sales_bill_no[0].sales_bill_no}"</strong>`
                  }

                  mailBox.sendMail(mailOption, function (error, info) {
                      if (error) {
                          console.log(error);
                      }
                      else {
                          console.log('Email sent : ', info,process);
                      }
                  });
              } catch (e) {
                  console.log('Error at the time sending email : ', e);
              }
          }

      }

      return res.send({success: true});
  } catch (e) {
      console.log('Error : ', e);

      return res.send({success: false, message: 'Something went wrong!', error: e});
  }
});

routes.post('/accept_sale', async function (req,res){
  try {
      const confirm_sale = await query ('UPDATE sales_details JOIN products ON sales_details.productId = products.id SET sales_details.isAcceptedByVendor = 2 WHERE sales_details.salesBillId = '+req.body.editID+' AND products.entry_by = '+req.body.employee_id);

      return res.send({success: true});
  } catch (e) {
      console.log('Error : ', e);

      return res.send({success: false, message: 'Something went wrong!', error: e});
  }
});

routes.post('/accept_sale_by_admin', async function (req,res){
try {
    const confirm_sale = await query ('UPDATE sales_details JOIN products ON sales_details.productId = products.id SET sales_details.isAcceptedByVendor = 2 WHERE sales_details.salesBillId = '+req.query.editID+' AND products.entry_by = '+req.query.vendor_id);

    return res.send({success: true});
} catch (e) {
    console.log('Error : ', e);

    return res.send({success: false, message: 'Something went wrong!', error: e});
}
});

routes.post('/processing_sale', async function (req,res){
try {
    const confirm_sale = await query ('UPDATE sales_details JOIN products ON sales_details.productId = products.id SET sales_details.delivery_status = 2 WHERE sales_details.salesBillId = '+req.query.editID+' AND products.entry_by = '+req.query.vendor_id);

    return res.send({success: true});
} catch (e) {
    console.log('Error : ', e);

    return res.send({success: false, message: 'Something went wrong!', error: e});
}
});

routes.post('/ready_to_deliver_sale', async function (req,res){
try {
    const confirm_sale = await query ('UPDATE sales_details JOIN products ON sales_details.productId = products.id SET sales_details.delivery_status = 3 WHERE sales_details.salesBillId = '+req.query.editID+' AND products.entry_by = '+req.query.vendor_id);

    return res.send({success: true});
} catch (e) {
    console.log('Error : ', e);

    return res.send({success: false, message: 'Something went wrong!', error: e});
}
});

routes.post('/delivered_sale', async function (req,res){
try {
    const confirm_sale = await query ('UPDATE sales_details JOIN products ON sales_details.productId = products.id SET sales_details.delivery_status = 5 WHERE sales_details.salesBillId = '+req.query.editID+' AND products.entry_by = '+req.query.vendor_id);

    return res.send({success: true});
} catch (e) {
    console.log('Error : ', e);

    return res.send({success: false, message: 'Something went wrong!', error: e});
}
});

routes.post('/returned_sale', async function (req,res){
try {
    const confirm_sale = await query ('UPDATE sales_details JOIN products ON sales_details.productId = products.id SET sales_details.delivery_status = 6 WHERE sales_details.salesBillId = '+req.query.editID+' AND products.entry_by = '+req.query.vendor_id);

    return res.send({success: true});
} catch (e) {
    console.log('Error : ', e);

    return res.send({success: false, message: 'Something went wrong!', error: e});
}
});

routes.post('/on_going_sale', async function (req,res){
  try {
      const confirm_sale = await query ('UPDATE sales_details JOIN products ON sales_details.productId = products.id SET sales_details.delivery_status = 4 WHERE sales_details.salesBillId = '+req.query.editID+' AND products.entry_by = '+req.query.vendor_id);

      return res.send({success: true});
  } catch (e) {
      console.log('Error : ', e);

      return res.send({success: false, message: 'Something went wrong!', error: e});
  }
});



routes.get('/sales_info_delivery', async function (req,res){
  try {
      const get_sales_info = await query ('SELECT sales.id AS id, sales.sales_bill_no AS sales_bill_no, sales.sales_type, sales.sales_date AS sales_date, sales_details.sales_product_quantity AS total_sales_quantity, sales_details.total_amount AS total_sales_amount, sales_details.discounts_amount AS discount_amount, sales_details.courier_partner, sales_details.courier_order_code, sales.isConfirmed AS isConfirmed, sales.isEMI AS isEMI FROM sales JOIN sales_details ON sales.id = sales_details.salesBillId JOIN products ON sales_details.productId = products.id WHERE sales.softDel = 0 AND sales.status = 1 AND sales_details.courier_order_code IS NOT NULL');
      console.log('sales_info', get_sales_info);
      return res.send({success: true, sales: get_sales_info});
  } catch (e) {
    console.log(e)
    return res.send({success: false, message: 'Something went wrong!', error: e});
  }
});


// sales report
// 28-03-2022
routes.get('/sales-report/:vendor_id/:product_id/:customer_id/:category_id/:dateFrom/:dateTo', async function(req, res) {
    const { vendor_id, product_id, customer_id, category_id, dateFrom, dateTo } = req.params;
    try {
        const queryString = generateSalesReportQueryString(vendor_id, product_id, customer_id, category_id, dateFrom, dateTo)
        const salesReport = await query(queryString)

        return res.send({ success: true, salesReport: salesReport, queryString:queryString });
    } catch (e) {
        return res.send({ success: false, message: 'Sales report not found.', error: e });
    }
});


function generateSalesReportQueryString(vendor_id, product_id, customer_id, category_id, dateFrom, dateTo) {
    let queryString = `
        SELECT sales.id, sales.sales_bill_no, UPPER(customers_address.name) as customer, 
        category.category_name as category_name, products.product_name as product, products.product_sku as sku,
        vendor_details.name as vendor, 
        sales_details.sales_product_quantity, sales_details.unitPrice, sales_details.total_amount, 
        DATE_FORMAT(sales.sales_date, "%d %M %Y") as sales_date,
        sales_details.isAcceptedByVendor, sales_details.delivery_status, sales.isConfirmed, sales.deliverStatus 
        FROM 
        sales 
        LEFT JOIN sales_details ON sales.id = sales_details.salesBillId 
        LEFT JOIN products ON sales_details.productId = products.id 
        LEFT JOIN vendor_details ON sales_details.vendor_id = vendor_details.vendor_id 
        LEFT JOIN customers_address ON sales_details.customerId = customers_address.id
        LEFT JOIN category ON products.category_id = category.id
        WHERE sales.status = 1 AND sales.softDel = 0
    `;

    if (vendor_id != 0)   queryString += ` AND sales_details.vendor_id = ${vendor_id}`
    if (product_id != 0)  queryString += ` AND sales_details.productId = ${product_id}`
    if (customer_id != 0) queryString += ` AND sales_details.customerId = ${customer_id}`
    if (category_id != 0) queryString += ` AND products.category_id = ${category_id}`
    
    if (dateFrom != 0) queryString += ` AND sales.sales_date >= '${dateFrom}'`
    if (dateTo != 0)   queryString += ` AND sales.sales_date <= '${dateTo}'`

    return queryString;
}

routes.get('/all-vendors/:vendor_id', async function(req, res) {
    const { vendor_id } = req.params;
    try {
        let queryString = `SELECT vendor_id as id, UPPER(name) as name FROM vendor_details WHERE status = 1 AND softDel = 0`
        if (vendor_id != 0) queryString += ` AND id = ${vendor_id}`
        queryString += ` ORDER BY name ASC`
        
        const vendors = await query(queryString)
        return res.send({ success: true, vendors: vendors });
    } catch (e) {
        return res.send({ success: false, message: 'vendors not found.', error: e });
    }
});

routes.get('/all-categories/:vendor_id', async function(req, res) {
    const { vendor_id } = req.params;
    try {
        // const categories = await query(`SELECT id, category_name as name FROM category WHERE parent_category_id != 0 AND parent_category_id IN (SELECT id FROM category WHERE parent_category_id != 0) ORDER BY name ASC`)
        
        let queryString = `SELECT id, category_name as name FROM category WHERE parent_category_id != 0 AND id IN ( SELECT distinct(category_id) FROM products )`
        if (vendor_id != 0) queryString = `SELECT id, category_name as name FROM category WHERE parent_category_id != 0 AND id IN ( SELECT distinct(category_id) FROM products WHERE vendor_id = ${vendor_id})`
        queryString += ` ORDER BY name ASC`
        
        const categories = await query(queryString)
        return res.send({ success: true, categories: categories });
    } catch (e) {
        return res.send({ success: false, message: 'products not found.', error: e });
    }
});

routes.get('/all-products/:vendor_id/:category_id', async function(req, res) {
    const { vendor_id, category_id } = req.params;
    try {
        let queryString = `SELECT id, vendor_id, CONCAT( UPPER(product_name) , ' - ', product_sku) as name FROM products WHERE status = 1 AND softDelete = 0`
        if (vendor_id != 0) queryString += ` AND vendor_id = ${vendor_id}`
        if (category_id != 0) queryString += ` AND category_id = ${category_id}`
        queryString += ` ORDER BY name ASC`
        
        const products = await query(queryString)
        return res.send({ success: true, products: products });
    } catch (e) {
        return res.send({ success: false, message: 'products not found.', error: e });
    }
});

routes.get('/all-customers', async function(req, res) {
    try {
        let queryString = `SELECT id, UPPER(name) as name FROM customers_address WHERE name IS NOT NULL`
        queryString += ` ORDER BY name ASC`
        
        const customers = await query(queryString)
        return res.send({ success: true, customers: customers });
    } catch (e) {
        return res.send({ success: false, message: 'products not found.', error: e });
    }
});


// AREA CONFIG
// 17-04-2022

routes.get('/divisions', async function(req, res) {
    try {
        let queryString = `SELECT distinct(division) FROM gnr_locations ORDER BY division`

        const data = await query(queryString)
        return res.send({ success: true, data: data });
    } catch (e) {
        return res.send({ success: false, message: 'error ', error: e });
    }
});

routes.get('/districts/:division', async function(req, res) {
    try {
        const { division } = req.params;
        
        let queryString = `SELECT distinct(district) FROM gnr_locations`
        if (division != 'all') queryString += ` WHERE division LIKE '%${division}%'`
        queryString += ` ORDER BY division, district`
        
        const data = await query(queryString)
        return res.send({ success: true, data: data });
    } catch (e) {
        return res.send({ success: false, message: 'error ', error: e });
    }
});

routes.get('/thanas/:division/:district', async function(req, res) {
    try {
        const { division, district } = req.params;
        
        let queryString = `SELECT distinct(thana) FROM gnr_locations`
        if (division != 'all') queryString += ` WHERE division LIKE '%${division}%'`
        if (district != 'all') queryString += ` AND district LIKE '%${district}%'`
        queryString += ` ORDER BY division, district, thana`
        
        const data = await query(queryString)
        return res.send({ success: true, data: data });
    } catch (e) {
        return res.send({ success: false, message: 'error ', error: e });
    }
});

routes.get('/postOffices/:division/:district/', async function(req, res) {
    try {
        const { division, district } = req.params;
        
        let queryString = `SELECT distinct(postoffice) FROM gnr_locations`
        if (division != 'all') queryString += ` WHERE division LIKE '%${division}%'`
        if (district != 'all') queryString += ` AND district LIKE '%${district}%'`
        // if (thana != 'all') queryString += ` AND thana LIKE '%${thana}%'`
        queryString += ` ORDER BY division, district, thana, postoffice`
        
        const data = await query(queryString)
        return res.send({ success: true, data: data });
    } catch (e) {
        return res.send({ success: false, message: 'error ', error: e });
    }
});

routes.get('/areas/:division/:district/:thana/:postOffice', async function(req, res) {
    try {
        const { division, district, thana, postOffice } = req.params;
        
        let queryString = `SELECT distinct(area) FROM gnr_locations`
        if (division != 'all') queryString += ` WHERE division LIKE '%${division}%'`
        if (district != 'all') queryString += ` AND district LIKE '%${district}%'`
        if (thana != 'all') queryString += ` AND thana LIKE '%${thana}%'`
        if (postOffice != 'all') queryString += ` AND postoffice LIKE '%${postOffice}%'`
        queryString += ` ORDER BY division, district, thana, postoffice, area`
        
        const data = await query(queryString)
        return res.send({ success: true, data: data });
    } catch (e) {
        return res.send({ success: false, message: 'error ', error: e });
    }
});

routes.get('/postcode/:postOffice', async function(req, res) {
    try {
        const { postOffice } = req.params;
        
        let queryString = `SELECT postcode FROM gnr_locations WHERE postoffice LIKE '%${postOffice}%'`
        
        const data = await query(queryString)
        return res.send({ success: true, data: data });
    } catch (e) {
        return res.send({ success: false, message: 'error ', error: e });
    }
});


routes.post('/store-thana', async function (req,res){
    try {
      
        const { division, district, postOffice, postcode, newThana } = req.body
        
        if( isNullorEmpty(division) )   return res.send(falseObj('Please Input Division'))
        if( isNullorEmpty(district) )   return res.send(falseObj('Please Input District'))
        if( isNullorEmpty(postOffice) ) return res.send(falseObj('Please Input Postoffice'))
        if( isNullorEmpty(newThana) )    return res.send(falseObj('Please Input Thana'))
        
        const searchQuery = `SELECT COUNT(id) as records FROM gnr_locations 
            WHERE division LIKE '%${division}%'
            AND district LIKE '%${district}%'
            AND postOffice LIKE '%${postOffice}%'
            AND thana LIKE '%${newThana}%'
        `
        
        const recordExists = await query(searchQuery)
        const records = JSON.parse(JSON.stringify(recordExists))
        const count = records[0].records
        
        if(count > 0) return res.send(falseObj('Area exists already !!'))
        
        const insertQueryString = `INSERT INTO gnr_locations(division, district, thana, postoffice, postcode) VALUES ('${division}', '${district}', '${newThana}', '${postOffice}', '${postcode}')`
        const store_area = await query(insertQueryString)
        return res.send({success: true, message: 'New Thana Added !!'});
    } catch (e) {
        console.log( e )
        return res.send({success: false, message: 'Something went wrong !!', error: e});
    }
});

routes.post('/store-area', async function (req,res){
    try {
      
        const { division, district, thana, postOffice, postcode, newArea } = req.body
        
        if( isNullorEmpty(division) )   return res.send(falseObj('Please Input Division'))
        if( isNullorEmpty(district) )   return res.send(falseObj('Please Input District'))
        if( isNullorEmpty(thana) )      return res.send(falseObj('Please Input Thana'))
        if( isNullorEmpty(postOffice) ) return res.send(falseObj('Please Input Postoffice'))
        if( isNullorEmpty(newArea) )    return res.send(falseObj('Please Input Area'))
        
        const searchQuery = `SELECT COUNT(id) as records FROM gnr_locations 
            WHERE division LIKE '%${division}%'
            AND district LIKE '%${district}%'
            AND thana LIKE '%${thana}%'
            AND postOffice LIKE '%${postOffice}%'
            AND area LIKE '%${newArea}%'
        `
        
        const recordExists = await query(searchQuery)
        const records = JSON.parse(JSON.stringify(recordExists))
        const count = records[0].records
        
        if(count > 0) return res.send(falseObj('Area exists already !!'))
        
        const insertQueryString = `INSERT INTO gnr_locations(division, district, thana, area, postoffice, postcode) VALUES ('${division}', '${district}', '${thana}', '${newArea}', '${postOffice}', '${postcode}')`
        const store_area = await query(insertQueryString)
        return res.send({success: true, message: 'New Area Added !!'});
    } catch (e) {
        console.log( e )
        return res.send({success: false, message: 'Something went wrong !!', error: e});
    }
});

routes.get('/customer_address', async function (req, res) {
  try {
    const customer_address = await query("SELECT * FROM customers_address WHERE status = 'active' AND name IS NOT NULL");
    console.log('customer_address', customer_address);
    return res.send({ success: true, data: customer_address });
  } catch (e) {
    console.log(e)
    return res.send({ success: false, message: 'Something went wrong!', error: e });
  }
});

function falseObj(message) {
    return {success: false, message: message};
}

function isNullorEmpty(val) {
    if(val == null || val == undefined || val == '' || val == 'all' || val == 'All' || val == '0') return true
    return false
}


// EKSHOP
routes.post("/send-to-ekshop", async function (req, res) {
  try {
    console.log(req.body);
    //Call inside your function for get access token
    ekep
      .getAccessToken({ login_id: "support@alahee.com", password: "alahee@2020" })
      .then(function (_response) {
        console.log(_response);

        //Fetch your required product and map similar to
        ekep
          .uploadProduct(_response.accessToken, req.body)
          .then(function (_response) {
            console.log(_response);
          });
      });

    return res.send({ success: true });
  } catch (e) {
    return res.send({
      success: false,
      message: "Something went wrong!",
      error: e,
    });
  }
});


module.exports = routes;
