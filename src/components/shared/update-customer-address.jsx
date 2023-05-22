import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { base } from "../../utils/common-helpers";

import { IsNullOrEmpty } from "../../utils/utils";

const adminBase = import.meta.env.VITE_APP_ADMIN_SERVER_URL;

const UpdateCustomerAddress = () => {

  const history = useHistory();

  const [customerId, set_customerId] = useState(localStorage.customer_id);

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

  const [alert_text, set_alert_text] = useState(
    "Could not complete purchase. Please try again later."
  );

  const [division, setDivision] = useState("all")
  const [district, setDistrict] = useState("all")
  const [thana, setThana] = useState("all")
  const [postOffice, setPostOffice] = useState("all")
  const [area, setArea] = useState("all")
  const [postcode, setPostcode] = useState("")

  const [divisions, setDivisions] = useState([])
  const [districts, setDistricts] = useState([])
  const [thanas, setThanas] = useState([])
  const [postOffices, setPostOffices] = useState([])
  const [areas, setAreas] = useState([])

  useEffect(() => {
    getDivisions()
    getDistricts()
    getThanas()
    getPostOffices()
    getAreas()
    getCustomerInfo()
  }, []);

  useEffect(() => {
    getDistricts()
    getThanas()
    getPostOffices()
    getAreas()
  }, [division]);

  useEffect(() => {
    getThanas()
    getPostOffices()
    getAreas()
  }, [division, district]);

  useEffect(() => {
    getAreas()
  }, [division, district, thana, postOffice]);

  useEffect(() => {
    getPostcode()
  }, [postOffice]);


  const getDivisions = () => axios.get(`${adminBase}/api/divisions`).then((res) => setDivisions(res.data.data))
  const getDistricts = () => axios.get(`${adminBase}/api/districts/${division}`).then((res) => setDistricts(res.data.data))
  const getThanas = () => axios.get(`${adminBase}/api/thanas/${division}/${district}`).then((res) => setThanas(res.data.data))
  const getPostOffices = () => axios.get(`${adminBase}/api/postOffices/${division}/${district}`).then((res) => setPostOffices(res.data.data))
  const getAreas = () => axios.get(`${adminBase}/api/areas/${division}/${district}/${thana}/${postOffice}`).then((res) => setAreas(res.data.data))
  const getPostcode = () => (postOffice == 'all') ? setPostcode("") : axios.get(`${adminBase}/api/postcode/${postOffice}`).then((res) => setPostcode(res.data.data[0].postcode))

  const getCustomerInfo = () => {
    const customerId = localStorage.customer_id ? localStorage.customer_id : 0;
    if (customerId) {
      axios.get(`${base}/api/get_customer_info/${customerId}`).then((res) => {

        const {
          name,
          email,
          address,
          phone_number,
          division,
          district,
          thana,
          postoffice,
          area,
          zipcode
        } = res.data;

        setCustomerInfo({
          customerName: name ? name : "",
          customerAddress: address ? address : "",
          customerPhone: phone_number ? phone_number : "",
        });

        set_name(name);
        set_email(email);
        set_address(address);
        set_phone_number(phone_number);
        set_hasCustomerAddress(true);

        setDivision(division);
        setDistrict(district);
        setThana(thana);
        setPostOffice(postoffice);
        setArea(area);
        setPostcode(zipcode);
      });
    }
  };

  const divisionSelectionHandler = (e) => {
    setDivision(e.target.value)
    setDistrict("all")
    setThana("all")
    setPostOffice("all")
    setArea("all")
    setPostcode("")
  };

  const districtSelectionHandler = (e) => {
    setDistrict(e.target.value)
    setThana("all")
    setPostOffice("all")
    setArea("all")
    setPostcode("")
  };

  const thanaSelectionHandler = (e) => {
    setThana(e.target.value)
    setPostOffice("all")
    setArea("all")
    setPostcode("")
  };

  const postOfficeSelectionHandler = (e) => {
    setPostOffice(e.target.value)
    setArea("all")
    setPostcode("")
  };

  const areaSelectionHandler = (e) => {
    setArea(e.target.value)
  };


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

    if (isNullorEmpty(division)) {
      showAddressAlertModal();
      set_alert_text("Division can not be empty !!");
      return;
    }
    if (isNullorEmpty(district)) {
      showAddressAlertModal();
      set_alert_text("District can not be empty !!");
      return;
    }
    if (isNullorEmpty(thana)) {
      showAddressAlertModal();
      set_alert_text("Thana can not be empty !!");
      return;
    }
    if (isNullorEmpty(postOffice)) {
      showAddressAlertModal();
      set_alert_text("Post office can not be empty !!");
      return;
    }

    // if (isNullorEmpty(area)) {
    //   showAddressAlertModal();
    //   set_alert_text("Area can not be empty !!");
    //   return;
    // }

    // if (IsNullOrEmpty(postcode)) {
    //   showAddressAlertModal();
    //   set_alert_text("Postcode can not be empty !!");
    //   return;
    // }


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
        division,
        district,
        thana,
        postOffice,
        area,
        postcode
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((response) => {
        if (!response.error) {
          scrollToTop()
          getCustomerInfo()
          showAddressAlertModal()
          set_alert_text("Address Updated Successfully !!")
        }
      });
  };

  const handle_change_name = (e) => set_name(e.target.value)
  const handle_change_phone_number = (e) => set_phone_number(e.target.value)
  const handle_change_email = (e) => set_email(e.target.value)
  const handle_change_address = (e) => set_address(e.target.value)

  const showAddressAlertModal = () => document.getElementById("adressAlertModalButton").click()

  const isNullorEmpty = (val) => {
    if (val == null || val == undefined || val == '' || val == 'all' || val == 'All' || val == '0') return true
    return false
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="checkout-form">
        <form action="#">

          <div className="checkout-input mb-3">
            <p className="mb-3">
              Name<span>*</span>
            </p>
            <input
              type="text"
              onChange={(e) => handle_change_name(e)}
              value={name}
              className="checkout-input-add mb-3"
            />
          </div>

          <div className="row">
            <div className="col-lg-6">
              <div className="checkout-input mb-3">
                <p className="mb-3">
                  Phone<span>*</span>
                </p>
                <input
                  type="text"
                  onChange={(e) => handle_change_phone_number(e)}
                  value={phone_number}
                  className="checkout-input-add"
                />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="checkout-input mb-3">
                <p className="mb-3">
                  Email<span>*</span>
                </p>
                <input
                  type="text"
                  onChange={(e) => handle_change_email(e)}
                  value={email}
                  className="checkout-input-add"
                />
              </div>
            </div>
          </div>

          <div className="checkout-input mb-3">
            <p className="mb-3">
              Address<span>*</span>
            </p>
            <input
              type="text"
              onChange={(e) => handle_change_address(e)}
              value={address}
              className="checkout-input-add mb-3"
            />
          </div>

          <div className="row">

            <div className="col-lg-4">
              <div className="checkout-input mb-3">
                <p className="mb-3">
                  Division<span>*</span>
                </p>
                <select
                  className="form-control"
                  name="division"
                  id="division"
                  value={division}
                  onChange={divisionSelectionHandler}
                >
                  <option value="all">Select</option>
                  {divisions.map(({ division }) => (
                    <option value={division} key={division}>
                      {division}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="checkout-input mb-3">
                <p className="mb-3">
                  District<span>*</span>
                </p>
                <select
                  className="form-control"
                  name="district"
                  id="district"
                  value={district}
                  onChange={districtSelectionHandler}
                >
                  <option value="all">Select</option>
                  {districts.map(({ district }) => (
                    <option value={district} key={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="checkout-input mb-3">
                <p className="mb-3">
                  Thana<span>*</span>
                </p>
                <select
                  className="form-control"
                  name="thana"
                  id="thana"
                  value={thana}
                  onChange={thanaSelectionHandler}
                >
                  <option value="all">Select</option>
                  {thanas.map(({ thana }) => (
                    <option value={thana} key={thana}>
                      {thana}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          <div className="row">

            <div className="col-lg-4">
              <div className="checkout-input mb-3">
                <p className="mb-3">
                  Post office<span>*</span>
                </p>
                <select
                  className="form-control"
                  name="postOffice"
                  id="postOffice"
                  value={postOffice}
                  onChange={postOfficeSelectionHandler}
                >
                  <option value="all">Select</option>
                  {postOffices.map(({ postoffice }) => (
                    <option value={postoffice} key={postoffice}>
                      {postoffice}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="checkout-input mb-3">
                <p className="mb-3">
                  Area<span>*</span>
                </p>
                <select
                  className="form-control"
                  name="area"
                  id="area"
                  value={area}
                  onChange={areaSelectionHandler}
                >
                  <option value="all">Select</option>
                  {areas.map(({ area }) => (
                    <option value={area} key={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="checkout-input mb-3">
                <p className="mb-3">
                  Postcode<span>*</span>
                </p>
                <input
                  type="text"
                  value={postcode}
                  className="checkout-input-add"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="checkout-input mb-3">
            <button
              className="btn btn-primary"
              onClick={(e) => addressSubmit(e)}
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Address Alert Modal  */}
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
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/profile/view-profile";
                }}
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* End of Address Alert Modal  */}
    </>
  );
};

export default UpdateCustomerAddress;
