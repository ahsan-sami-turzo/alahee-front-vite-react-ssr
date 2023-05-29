const { query } = require("../db_config");
const { createStringifyObj } = require("./helpers");

const login = async params => {
  const { email, password } = createStringifyObj(params);
  try {
    return await query(
      `SELECT * FROM customers_address WHERE ( email=${email} OR phone_number=${email} ) AND password=${password} AND status='active'`
    );
  } catch (e) {
    return e;
  }
};

const register = async params => {
    const { email, password } = createStringifyObj(params);
  
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const mobileRegexp =  /(^(\+8801|8801|01|008801))[1|3-9]{1}(\d){8}$/;

    let isEmail = emailRegexp.test(email);
    let isMob = mobileRegexp.test(email);
  
  try {
      if(isEmail){
        return await query( 
            `INSERT INTO customers_address (email, password) VALUES (${email}, ${password})` 
        );
      } else if(isMob){
        return await query( 
            `INSERT INTO customers_address (phone_number, password) VALUES (${email}, ${password})` 
        );
      } else {
        return await query( 
            `INSERT INTO customers_address (email, phone_number, password) VALUES (${email}, ${email}, ${password})` 
        );
      }
  } catch (e) {
    return e;
  }
};

const emailExists = async params => {
  const { email } = createStringifyObj(params);
  try {
    return await query(`
      SELECT * FROM customers_address WHERE ( email=${email} OR phone_number=${email} ) AND status='active'
    `);
  } catch (e) {
    return e;
  }
};

const socialIdExists = async params => {
  const { id } = createStringifyObj(params);
  try {
    return await query(`
      SELECT * FROM customers_address WHERE social_login_id=${id} AND status='active'
    `);
  } catch (e) {
    return e;
  }
};

const socialRegister = async params => {
  const { name, email, id } = createStringifyObj(params);

  try {
    return await query(
      `INSERT INTO customers_address (name, email, social_login_id) VALUES (${name}, ${email}, ${id})`
    );
  } catch (e) {
    return e;
  }
};

module.exports = {
  login,
  register,
  emailExists,
  socialRegister,
  socialIdExists
};
