import axios from "axios";
import React, { useEffect, useState } from "react";
const base = import.meta.env.VITE_APP_FRONTEND_SERVER_URL;

export const CartContext = React.createContext();

export const CartProvider = (props) => {
  const [cart, setCart] = useState([]);
  const [cartProductsCount, setCartProductsCount] = useState(0);

  useEffect(() => {
    let cartData = JSON.parse(localStorage.getItem("cart"));
    if (cartData) setCart(cartData);
    if (localStorage.customer_id) {

      axios.get(`${base}/api/getCustomerCartInfo/${localStorage.customer_id}`)
        .then((res) => {
          setCart(res.data);
          localStorage.setItem("cart", JSON.stringify(cart));
        });


      axios.get(`${base}/api/getCustomerCartProductsCount/${localStorage.customer_id}`)
        .then((res) => {
          setCartProductsCount(res.data.data);
          localStorage.setItem("cartProductsCount", JSON.stringify(cartProductsCount));
        });
    }
  }, []);


  return (
    // <CartContext.Provider value={[cart, setCart]}>
    <CartContext.Provider value={{ cart, setCart, cartProductsCount, setCartProductsCount }}>
      {props.children}
    </CartContext.Provider>
  );
};
