import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  base,
  options
} from "../../utils/common-helpers";
import CartItems from "./cart-items";
import OrderSummary from "./order-summary";

import { comma_separate_numbers, IsNullOrEmpty } from "../../utils/utils";

import UpdateCustomerAddress from "../shared/update-customer-address";
import UpdateCustomerBillingAddress from "../shared/update-customer-billing-address";


const CheckOut = () => {

  let placeOrderBtn = useRef();

  const history = useHistory();

  const [customerId, set_customerId] = useState(localStorage.customer_id);
  const [cartProducts, set_cartProducts] = useState([]);

  const [orderTotalAmount, set_orderTotalAmount] = useState(0);
  const [discount_Amount, set_discountAmount] = useState(0);
  const [discountDetail, set_discountDetail] = useState([]);
  const [promo_Amount, set_promoAmount] = useState(0);
  const [promoCodeDetail, set_promoCodeDetail] = useState([]);

  const [isShipAddressDiff, set_isShipAddressDiff] = useState(false);

  const [hasCustomerAddress, set_hasCustomerAddress] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    customerName: "",
    customerAddress: "",
    customerPhone: "",
  });

  const [name, set_name] = useState("");
  const [phone_number, set_phone_number] = useState("");
  const [email, set_email] = useState("");
  const [address, set_address] = useState("");
  const [zipcode, set_zipcode] = useState("");

  const [city_id, set_city_id] = useState("");
  const [district_id, set_district_id] = useState("");
  const [area_id, set_area_id] = useState("");


  const [cityList, set_cityList] = useState([]);
  const [customerCity, set_customerCity] = useState("");

  const [thanaList, set_thanaList] = useState([]);
  const [customerThana, set_customerThana] = useState("");

  const [areaList, set_areaList] = useState([]);
  const [customerArea, set_customerArea] = useState("");

  const [districtList, set_districtList] = useState([]);
  const [customerDistrict, set_customerDistrict] = useState("");

  const [customerPostCode, set_customerPostCode] = useState("");

  const [alert_text, set_alert_text] = useState(
    "Could not complete purchase. Please try again later."
  );

  useEffect(() => {
    getCustomerInfo();
    getCityList();
  }, []);

  const getCustomerInfo = () => {
    const customerId = localStorage.customer_id ? localStorage.customer_id : 0;
    if (customerId) {
      axios.get(`${base}/api/get_customer_info/${customerId}`).then((res) => {
        const { name, email, address, phone_number, city, thana, area, district, zipcode } = res.data;
        setCustomerInfo({
          customerName: name ? name : "",
          customerAddress: address ? address : "",
          customerPhone: phone_number ? phone_number : "",
        });
        set_name(name);
        set_email(email);
        set_address(address);
        set_phone_number(phone_number);
        set_customerCity(city);
        set_customerThana(thana);
        set_customerArea(area);
        set_customerDistrict(district);
        set_customerPostCode(zipcode);
        set_hasCustomerAddress(true);
      });
    }
  };


  const getCityList = () => {
    axios.get(`${base}/api/getCityList`).then((res) => {
      set_cityList(res.data);
      set_districtList(res.data);
    })
  }

  const handle_change_district = (e) => {
    if (!e.target.value) {
      set_customerDistrict("");
      return;
    }
    set_customerDistrict(e.target.value);
  };

  const handle_change_city = (e) => {
    if (!e.target.value) {
      set_thanaList([]);
      set_areaList([]);
      set_customerCity("");
      set_customerThana("");
      set_customerArea("");
      set_customerPostCode("");
      return;
    }
    set_customerCity(e.target.value);
    set_customerDistrict(e.target.value);
    axios.get(`${base}/api/getThanaList/${e.target.value}`).then((res) => {
      set_thanaList(res.data);
    })
  };

  const handle_change_thana = (e) => {
    if (!e.target.value) {
      set_areaList([]);
      set_customerThana("");
      set_customerArea("");
      set_customerPostCode("");
      return;
    }
    set_customerThana(e.target.value);
    axios.get(`${base}/api/getAreaList/${e.target.value}`).then((res) => {
      set_areaList(res.data);
    })
  };

  const handle_change_area = (e) => {
    if (!e.target.value) {
      set_customerArea("");
      set_customerPostCode("");
      return;
    }
    set_customerArea(e.target.value);
    axios.get(`${base}/api/getPostCode/${e.target.value}`).then((res) => {
      set_customerPostCode(res.data[0].postcode);
      console.log(res.data);
    })
  };

  const orderTotal = (data) => {
    set_orderTotalAmount(data);
  };

  const promoAmount = (data) => {
    set_promoAmount(data);
  };

  const discountAmount = (data) => {
    set_discountAmount(data);
  };

  const promoCodeDetails = (data) => {
    set_promoCodeDetail(data);
  };

  const discountDetails = (data) => {
    set_discountDetail(data);
  };

  const cartItemInfo = (data) => {
    set_cartProducts(data);
  };

  const loginClickHandler = () => {
    closeModal("authModalCloseButton");
    history.push("/login");
  };

  const registerClickHandler = () => {
    closeModal("authModalCloseButton");
    history.push("/register");
  };

  const handleShipCheck = (e) => {
    set_isShipAddressDiff(e.target.checked);
  };

  const placeOrder = () => {
    if (!customerId) {
      showAuthModal();
      return;
    }
    if (cartProducts.length == 0) {
      set_alert_text("Your cart is empty!");
      // showAlertModal();
      let link = document.getElementById("warningModalButton");
      link.click();
      return;
    }
    checkInventory();
  };

  function insertIntoIndexDB(db, contact) {
    // create a new transaction
    // const txn = db.transaction('orders', 'readwrite');
    const txn = db.transaction(["orders"], 'readwrite');

    // get the Contacts object store
    const store = txn.objectStore('orders');

    let query = store.put(contact);

    // handle success case
    query.onsuccess = function (event) {
      console.log(event);
    };

    // handle the error case
    query.onerror = function (event) {
      console.log(event.target.errorCode);
    }

    // close the database once the transaction completes
    txn.oncomplete = function () {
      db.close();
    };
  }

  const storeOrdersIntoIndexDB = (cartItem) => {
    const request = indexedDB.open('alahee', 1);
    request.onerror = (event) => {
      console.error(`Database error: ${event.target.errorCode}`);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;

      insertIntoIndexDB(db, cartItem);
    };

    // create the Contacts object store and indexes
    request.onupgradeneeded = (event) => {
      let db = event.target.result;

      // create the Contacts object store with auto-increment id
      let store = db.createObjectStore('orders', {
        autoIncrement: true
      });

      // create an index on the id property
      let index = store.createIndex('id', 'id', {
        unique: true
      });
    };
  }

  const checkInventory = () => {
    let tempdata = [];
    cartProducts.forEach((cartItem) => {
      let item = {
        color: cartItem.hasOwnProperty("color") ? cartItem.color.id : 0,
        size: cartItem.hasOwnProperty("size") ? cartItem.size.id : 0,
        id: cartItem.id,
        quantity: cartItem.quantity,
      };
      tempdata.push(item);

      storeOrdersIntoIndexDB(cartItem);
    });

    const data = JSON.stringify({ cartProducts: tempdata });
    const url = `${base}/api/checkInventory`;

    axios
      .post(url, data, options)
      .then(function (response) {
        if (response.data) {
          var link = document.getElementById("PaymentModalButton");
          link.click();
        } else {
          set_alert_text(response.message);
          // showAlertModal();
          let link = document.getElementById("warningModalButton");
          link.click();
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const payOrder = () => {
    fetch(base + "/api/payOrder", {
      method: "POST",
      crossDomain: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId: customerId,
        discountAmount: discount_Amount,
        discountDetail: discountDetail,
        promoCodeAmount: promo_Amount,
        promoCodeDetail: promoCodeDetail,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((response) => {
        closeModal("paymentModalCloseButton");
        if (response.data) {
          var link = document.getElementById("successModalButton");
          link.click();
        } else {
          console.log(response.message)
          set_alert_text(response.message);
          console.log(alert_text)
          // showAlertModal();
          let link = document.getElementById("warningModalButton");
          link.click();
        }
      });
  };

  const paySsl = () => {
    fetch(base + "/api/paySsl", {
      method: "POST",
      crossDomain: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId: customerId,
        discountAmount: discount_Amount,
        discountDetail: discountDetail,
        promoCodeAmount: promo_Amount,
        promoCodeDetail: promoCodeDetail,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((response) => {
        console.log(response);
        window.location.href = response.data;
      });
  };

  const gotoPlaceOrder = (event) => {
    event.preventDefault();
    window.scrollTo({
      behavior: 'smooth',
      top: placeOrderBtn.current.offsetTop
    })
  }

  const addressSubmit = (event) => {
    event.preventDefault();

    if (IsNullOrEmpty(name)) {
      showAddressAlertModal();
      set_alert_text("Name can not be empty !!");
      return;
    }
    if (IsNullOrEmpty(address)) {
      showAddressAlertModal();
      set_alert_text("Address can not be empty !!");
      return;
    }
    if (IsNullOrEmpty(phone_number)) {
      showAddressAlertModal();
      set_alert_text("Phone number can not be empty !!");
      return;
    }
    if (IsNullOrEmpty(email)) {
      showAddressAlertModal();
      set_alert_text("Email can not be empty !!");
      return;
    }
    if (IsNullOrEmpty(customerCity)) {
      showAddressAlertModal();
      set_alert_text("City can not be empty !!");
      return;
    }
    if (IsNullOrEmpty(customerThana)) {
      showAddressAlertModal();
      set_alert_text("Thana can not be empty !!");
      return;
    }
    if (IsNullOrEmpty(customerArea)) {
      showAddressAlertModal();
      set_alert_text("Area can not be empty !!");
      return;
    }
    if (IsNullOrEmpty(customerDistrict)) {
      showAddressAlertModal();
      set_alert_text("District can not be empty !!");
      return;
    }
    if (IsNullOrEmpty(customerPostCode)) {
      showAddressAlertModal();
      set_alert_text("Postcode can not be empty !!");
      return;
    }

    console.log("check failed...");

    fetch(base + "/api/saveCustomerAddress", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        name,
        address,
        phone_number,
        email,
        customerCity,
        customerThana,
        customerArea,
        customerDistrict,
        customerPostCode,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((response) => {
        if (!response.error) {
          scrollToTop();
          getCustomerInfo();
          showAddressAlertModal();
          set_alert_text("Address Updated Successfully !!");
        }
      });
  };

  // const addressSubmit = (event) => {
  //   event.preventDefault();

  //   fetch(base + "/api/saveCustomerAddress", {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       name,
  //       phone_number,
  //       address,
  //       city_id,
  //       district_id,
  //       area_id,
  //       customerId,
  //     }),
  //   })
  //     .then((res) => {
  //       return res.json();
  //     })
  //     .then((response) => {
  //       if (!response.error) {
  //         scrollToTop();
  //         getCustomerInfo();
  //       }
  //     });
  // };

  const handle_change_name = (e) => {
    set_name(e.target.value);
  };

  const handle_change_phone_number = (e) => {
    set_phone_number(e.target.value);
  };

  const handle_change_email = (e) => {
    set_email(e.target.value);
  };

  const handle_change_address = (e) => {
    set_address(e.target.value);
  };

  const handle_change_city_id = (e) => {
    console.log(e.target.value);
    set_city_id(e.target.value);
  };

  const handle_change_area_id = (e) => {
    set_area_id(e.target.value);
  };

  const handle_change_district_id = (e) => {
    set_district_id(e.target.value);
  };

  const showAlertModal = () => {
    var link = document.getElementById("warningModalButton");
    link.click();
  };

  const showAddressAlertModal = () => {
    var link = document.getElementById("adressAlertModalButton");
    link.click();
  };

  const showAuthModal = () => {
    var link = document.getElementById("authModalButton");
    link.click();
  };

  const showPaymentModal = () => {
    var link = document.getElementById("paymentModalButton");
    link.click();
  };

  const closeModal = (buttonId) => {
    var modalCloseButton = document.getElementById(buttonId);
    modalCloseButton.click();
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-lg-8 col-md-6">
            <CartItems cartItemInfo={cartItemInfo} />
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="panel panel-default">
              <OrderSummary
                cartProducts={cartProducts}
                discountDetails={discountDetails}
                promoCodeDetails={promoCodeDetails}
                promoAmount={promoAmount}
                discountAmount={discountAmount}
                orderTotal={orderTotal}
              />
            </div>

            <div className="container mt-1 pt-1" ref={placeOrderBtn}>
              <button
                onClick={placeOrder}
                className="btn btn-primary btn-block btn-continue-shop"
                type="button"
                disabled={!hasCustomerAddress}
                title={hasCustomerAddress ? "" : "Please input address"}
              >
                Place Order {hasCustomerAddress}
              </button>
            </div>
            {!customerId && (
              <div className="container mt-1 pt-1 cartAuthButtons">
                <button
                  onClick={loginClickHandler}
                  className="btn btn-primary"
                  type="button"
                >
                  Sign In
                </button>

                <button
                  onClick={registerClickHandler}
                  className="btn btn-primary"
                  type="button"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">

          <div className="col-lg-6 col-md-6 col-sm-12">
            <div className="checkout-form">

              <h1 className="mt-3 mb-3 h4">Billing Address</h1>

              <UpdateCustomerAddress />

              <div className="checkout-input-checkbox mb-2">
                <label htmlFor="diff-acc" className="pl-4">
                  Ship to a different address?
                  <input
                    type="checkbox"
                    id="diff-acc"
                    onClick={(e) => handleShipCheck(e)}
                  />
                  <span className="checkmark"></span>
                </label>
              </div>

            </div>
          </div>

          {isShipAddressDiff && (
            <div className="col-lg-6 col-md-6 col-sm-12">
              <div className="checkout-form">
                <h1 className="mt-3 mb-3 h4">Shipping Address</h1>

                <UpdateCustomerBillingAddress />

              </div>
            </div>
          )}
        </div>
      </div>

      {/* adress Alert Modal  */}
      <button
        style={{ display: "none !important" }}
        id="adressAlertModalButton"
        className="d-none"
        type="button"
        data-toggle="modal"
        data-target="#adressAlertModal"
      ></button>

      <div
        className="modal fade"
        id="adressAlertModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="adressAlertModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            {alert_text == "Address Updated Successfully !!" ? (
              <div className="modal-body cart-modal-body-warning">
                <p className="pt-4">
                  <i className="fa fa-check font-80" />
                </p>
                <p className="pt-2 pb-2">{alert_text}</p>
              </div>
            ) : (
              <div className="modal-body cart-modal-body-success">
                <p className="pt-4">
                  <i className="fa fa-exclamation-circle font-80" />
                </p>
                <p className="pt-2 pb-2 font-weight-bold text-danger">
                  {alert_text}
                </p>
              </div>
            )}

            <div className="modal-footer cart-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                data-dismiss="modal"
                onClick={(e) => gotoPlaceOrder(e)}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* End of adress Alert Modal  */}

      {/* Warning Modal  */}
      <button
        style={{ display: "none !important" }}
        id="warningModalButton"
        className="d-none"
        type="button"
        data-toggle="modal"
        data-target="#warningModal"
      ></button>

      <div
        className="modal fade"
        id="warningModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="warningModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-body cart-modal-body-warning">
              <p className="pt-4">
                <i className="fa fa-exclamation-circle font-80" />
              </p>
              <p className="pt-2 pb-2 font-weight-bold text-danger">
                {alert_text}
              </p>
            </div>
            <div className="modal-footer cart-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                data-dismiss="modal"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/cart";
                }}
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* End of Warning Modal  */}

      {/* Success Modal  */}
      <button
        style={{ display: "none !important" }}
        id="successModalButton"
        className="d-none"
        type="button"
        data-toggle="modal"
        data-target="#successModal"
      ></button>

      <div
        className="modal fade"
        id="successModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="successModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-body cart-modal-body-warning">
              <p className="pt-4">
                <i className="fa fa-check font-80" />
              </p>
              <p className="pt-2 pb-2">Product purchased successfully.</p>
            </div>
            <div className="modal-footer cart-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                data-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/";
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* End of Success Modal  */}

      {/*  Payment Modal */}
      <button
        style={{ display: "none !important" }}
        id="PaymentModalButton"
        className="d-none"
        type="button"
        data-toggle="modal"
        data-target="#paymentModal"
      ></button>

      <div
        className="modal fade"
        id="paymentModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="paymentModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="h4">Select Payment Option</h1>
              <button
                type="button"
                className="close"
                id="paymentModalCloseButton"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="container mt-5 text-center">
                <p>
                  <strong className="h5">
                    Payable Amount
                    <span className="ml-2">
                      <em>৳ &nbsp;</em>
                    </span>
                    <span>{comma_separate_numbers(orderTotalAmount)}</span>
                  </strong>
                </p>
              </div>
              <div className="container mt-5 mb-5">
                <button
                  onClick={payOrder}
                  className="btn btn-primary btn-block btn-continue-shop"
                  type="button"
                >
                  Cash On Delivery
                </button>

                <button
                  onClick={paySsl}
                  className="btn btn-primary btn-block btn-continue-shop"
                  type="button"
                >
                  Online Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*  End of Payment Modal */}

      {/* Auth Modal  */}
      <button
        style={{ display: "none !important" }}
        className="d-none"
        id="authModalButton"
        type="button"
        data-toggle="modal"
        data-target="#authModal"
      ></button>

      <div
        className="modal fade"
        id="authModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="authModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="close"
                id="authModalCloseButton"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="container mt-1 pt-1 cartAuthButtons">
                <button
                  onClick={loginClickHandler}
                  className="btn btn-primary"
                  type="button"
                >
                  Sign In
                </button>

                <button
                  onClick={registerClickHandler}
                  className="btn btn-primary"
                  type="button"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End of Auth Modal  */}
    </>
  );
};

export default CheckOut;
