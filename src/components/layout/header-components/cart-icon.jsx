import React, { useContext, useEffect, useState } from "react";
import { CartContext } from '../../../context/CartContext';

const CartIcon = (props) => {

  const [viewType, setViewType] = useState(props.viewType);
  const [cartItemCount, setCartItemCount] = useState(0);

  const { cart, setCart, cartProductsCount, setCartProductsCount } = useContext(CartContext);

  useEffect(() => {
    if (cart.length > 0) {
      let count = 0;
      cart.forEach(item => {
        count += item.quantity
      });
      setCartItemCount(count)
    }
  }, [])

  return (
    <>
      {viewType === "mobile" && (
        <a href="/cart" style={{ position: "relative" }}>
          <img
            className="cart-image-mobile mt-n2"
            src="/image/cart_icon.png"
            alt="cart_icon_desk"
          />
          <span
            className="badge badge-custom-mb badge-danger rounded-circle mt-n2 ml-n1"
            style={{ position: "absolute" }}
          >
            {cartProductsCount}
            {/* {cartItemCount} */}
            {/* {cart.length} */}
          </span>
        </a>
      )}

      {viewType === "desktop" && (
        <a href="/cart" style={{ position: "relative" }}>
          <img
            className="cart-image mt-n1"
            src="/image/cart_icon.png"
            alt="cart_icon_desk"
          />
          <span
            className="badge badge-danger rounded-circle ml-n2"
            style={{ position: "absolute" }}
          >
            {cartProductsCount}
            {/* {cartItemCount} */}
            {/* {cart.length} */}
          </span>
        </a>
      )}
    </>
  );
}

export default CartIcon;