import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../../context/CartContext";

import { base, fileUrl, options } from "../../utils/common-helpers";
import { comma_separate_numbers } from "../../utils/utils";


const CartItems = (props) => {
  const [customerId, set_customerId] = useState(localStorage.customer_id);

  const [cartProductsInfo, set_cartProductsInfo] = useState([]);

  const [totalPrice, set_totalPrice] = useState(0);
  const [totalItems, set_totalItems] = useState(0);

  const [revisedCartDataKeyValue, set_revisedCartDataKeyValue] = useState([]);
  const [itemStockQuantity, set_itemStockQuantity] = useState(0);

  // const [cart, setCart] = useContext(CartContext);
  const { cart, setCart, cartProductsCount, setCartProductsCount } = useContext(CartContext);

  useEffect(() => {
    getCustomerCartProducts();
  }, []);

  useEffect(() => {
    sendData();
  }, [cartProductsInfo]);

  const sendData = () => {
    props.cartItemInfo(cartProductsInfo);
  };

  const getCustomerCartProducts = () => {
    if (!customerId) {
      let cartData = JSON.parse(localStorage.getItem("cart"));
      if (cartData) {
        getProductsInfoByCartData(cartData);
      }
    } else {
      getProductsInfoByCartData([], customerId);
    }
  };

  const getProductsInfoByCartData = (cartData, customerId = 0) => {
    const data = JSON.stringify({ cartData, customerId });
    const url = `${base}/api/getCustomerCartProducts`;
    axios
      .post(url, data, options)
      .then(function (response) {
        setProductsInfoByCartData(response.data.cartProducts);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const setProductsInfoByCartData = (data) => {
    set_cartProductsInfo(data);
    computeTotalPrice(data);
    calcTotalItems(data);
  };

  const calcTotalItems = (data) => {
    let total = 0;
    data.forEach((item) => {
      total += item.quantity;
    });
    set_totalItems(total);
    setCart(total);
  };

  const computeTotalPrice = (data) => {
    let total = 0;
    data.forEach((item) => {
      total += item.quantity * item.productPrice;
    });
    set_totalPrice(total);
  };

  const checkItemStockQuantity = (cartItem) => {
    return axios
      .get(`${base}/api/productCombinationsFromStock/${cartItem.id}`)
      .then((res) => setItemStockQuantity(res.data.combinations, cartItem));
  };

  const setItemStockQuantity = (data, cartItem) => {
    const hasColor = cartItem.hasOwnProperty("color");
    const hasSize = cartItem.hasOwnProperty("size");
    let filteredData = [...data];
    if (hasColor) {
      filteredData = filteredData.filter(
        (item) => item.colorId == cartItem.color.id
      );
    }
    if (hasSize) {
      filteredData = filteredData.filter(
        (item) => item.sizeId == cartItem.size.id
      );
    }
    let quantity = 0;
    filteredData && filteredData.forEach((item) => (quantity += item.quantity));
    return quantity;
  };

  const onClickPlusHandler = (cartItem) => {
    const stock = checkItemStockQuantity(cartItem);
    stock.then((val) => set_itemStockQuantity(val));

    if (itemStockQuantity == 0 || cartItem.quantity == itemStockQuantity)
      return;

    let updatedCart = [...cartProductsInfo];
    const pos = updatedCart.findIndex((item) => item.id == cartItem.id);
    cartItem.quantity++;
    updatedCart.splice(pos, 1, cartItem);
    setProductsInfoByCartData(updatedCart);
    updateLocalStorage(updatedCart, "cart");

    if (localStorage.getItem("customer_id")) updateCartProductsInDB(localStorage.customer_id, cartProductsInfo, 'temp_sell', `${base}/api/updateCustomerCartProducts`);
  };

  const onClickMinusHandler = (cartItem) => {
    if (cartItem.quantity == 1) return;
    let updatedCart = [...cartProductsInfo];
    const pos = updatedCart.findIndex((item) => item.id == cartItem.id);
    cartItem.quantity--;
    updatedCart.splice(pos, 1, cartItem);
    setProductsInfoByCartData(updatedCart);
    updateLocalStorage(updatedCart, "cart");

    if (localStorage.getItem("customer_id")) updateCartProductsInDB(localStorage.customer_id, updatedCart, 'temp_sell', `${base}/api/updateCustomerCartProducts`);
  };

  const onClickDeleteHandler = (cartItem) => {
    let deletedItem = cartProductsInfo.filter((item) => item.id == cartItem.id);
    let updatedCart = cartProductsInfo.filter((item) => item.id != cartItem.id);
    setProductsInfoByCartData(updatedCart);
    updateLocalStorage(updatedCart, "cart");

    if (localStorage.getItem("customer_id")) updateCartProductsInDB(localStorage.customer_id, deletedItem[0].id, 'temp_sell', `${base}/api/deleteCustomerCartProducts`);
  };

  const updateLocalStorage = (productsInfo, key) => {
    let data = [];
    let cartQty = 0;
    productsInfo.forEach((cartItem) => {
      let item = {
        colorId: cartItem.hasOwnProperty("color") ? cartItem.color.id : 0,
        sizeId: cartItem.hasOwnProperty("size") ? cartItem.size.id : 0,
        productId: cartItem.id,
        quantity: cartItem.quantity,
      };
      data.push(item);
    });
    if (localStorage.getItem(key)) localStorage.removeItem(key);
    localStorage.setItem(key, JSON.stringify(data));

    let cartItem = JSON.parse(localStorage.getItem("cart"));

    console.clear();
    console.info("cartItem =========== ", cartItem);
    if (!cartItem) return;
    cartItem.forEach(item => cartQty += item.quantity);
    setCartProductsCount(cartQty);
  };

  const updateCartProductsInDB = (customerId, cartProductsInfo, table_name, url) => {
    const data = JSON.stringify({
      customerId: customerId,
      table_name: table_name,
      cartProductsInfo
    });

    axios.post(url, data, options).then(res => {
      console.clear();
      console.log(res.data);
      if (res.data.data) {
        // this.calcTotalItems(cartProductsInfo);
        // this.setState({ cartProductsInfo, totalPrice });
      }
    });
  }

  return (
    <>
      <div className="card">
        <div className="card-header bg-success text-light text-center"></div>

        <div className="card-body">
          {cartProductsInfo.length > 0 &&
            cartProductsInfo.map((item) => (
              <div className="row p-2" key={item.product_name}>

                <a href={`/productDetails/${item.slug}`} >
                  <div className="col-lg-3 col-md-12 col-sm-12">
                    <img
                      src={`${fileUrl}/upload/product/compressedProductImages/${item.home_image}`}
                      className="img-fluid"
                    />
                  </div>
                  <div className="col-lg-4 col-md-12 col-sm-12 text-sm-center text-lg-left">
                    <h1 className="h5">{item.product_name}</h1>
                    {item.color && (
                      <p className="mb-1">
                        Color:&nbsp;
                        <b>{item.color.colorName}</b>
                      </p>
                    )}
                    {item.size && (
                      <p className="mb-1">
                        Size:&nbsp;
                        <b>{item.size.size}</b>
                      </p>
                    )}
                    <p className="mb-1">
                      <em>৳&nbsp;</em> {item.productPrice}
                    </p>
                  </div>
                </a>

                <div className="col-lg-3 col-md-12 col-sm-12 my-auto text-sm-center text-lg-left">
                  <div className="quantity">
                    <div className="quantity-select">
                      <div
                        onClick={() => onClickMinusHandler(item)}
                        className="entry value-minus1"
                      >
                        &nbsp;
                      </div>
                      <div className="entry value1">
                        <span>{item.quantity}</span>
                      </div>
                      <div
                        onClick={() => onClickPlusHandler(item)}
                        className="entry value-plus1 active"
                      >
                        &nbsp;
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-2 col-md-12 col-sm-12 my-auto  text-sm-center  text-lg-right">
                  <button
                    onClick={() => onClickDeleteHandler(item)}
                    type="button"
                    className="btn btn-outline-danger btn-xs"
                    style={{
                      borderColor: "transparent",
                      background: "transparent",
                    }}
                  >
                    <i
                      className="fa fa-trash"
                      aria-hidden="true"
                      style={{ fontSize: "24px", color: "#EB1C22" }}
                    >
                      {""}
                    </i>
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="card-footer">
          <div className="text-right">
            <p className="my-0">
              Total price:
              <strong>
                <em>৳&nbsp;</em> {comma_separate_numbers(totalPrice)}
              </strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartItems;
