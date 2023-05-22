import axios from "axios";
import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import {
  base
} from "../../../utils/common-helpers";
import CartIcon from "./cart-icon";

const VITE_APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL;

class TopNav extends Component {
  state = {
    isAuthenticated: false,
    viewType: this.props.viewType,
    mobilePhoneHref: `tel:${this.props.companyInfo.telephone}`,
    customerName: "",
  };

  componentDidMount() {
    const customer_id = localStorage.getItem("customer_id");
    if (customer_id) {
      this.setState({ isAuthenticated: true });
      this.getCustomerInfo(customer_id);
    }
  }

  getCustomerInfo(customer_id) {
    axios.get(`${base}/api/get_customer_info/${customer_id}`).then((res) => {
      const { name, address, phone_number } = res.data;
      this.setState({ customerName: name });
    });
  }

  set_or_remove_authentication = (data) => {
    if (data) {
      this.setState({ isAuthenticated: true });
    } else {
      this.setState({ isAuthenticated: false });
    }
  };

  sign_in_menu = () => {
    return (
      <>
        {/* desktop */}
        <div className="d-none d-lg-block">
          <div className="row">
            <div className="col-6">
              <Link
                to="/profile/view-profile"
                id="profileButton"
                className="btn btn-primary profile-register ml-2"
              >
                Profile
              </Link>
            </div>
            <div className="col-6">
              <button
                id="logoutButton"
                onClick={this.logout}
                className="btn btn-primary login-logout ml-n2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        {/* mobile */}
        <div className="d-block d-lg-none">
          <div className="row">
            <div className="col-6">
              <Link
                to="/profile/view-profile"
                id="profileButton"
                className="btn btn-primary btn-sm profile-register ml-2 pt-2"
              >
                Profile
              </Link>
            </div>
            <div className="col-6">
              <button
                id="logoutButton"
                onClick={this.logout}
                className="btn btn-primary btn-sm login-logout ml-n3"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  sign_out_menu = () => {
    return (
      <>
        {/* desktop */}
        <div className="d-none d-lg-block">
          <div className="row">
            <div className="col-6">
              <Link
                to="/register"
                className="btn btn-primary profile-register ml-2"
                id="registerButton"
              >
                {/*<span style={{ marginLeft: '-8px' }}>Register</span>*/}
                Register
              </Link>
            </div>
            <div className="col-6">
              <Link
                to="/login"
                className="btn btn-primary login-logout"
                id="loginButton"
              >
                {/*<span style={{ marginLeft: '-7px' }}>Login</span>*/}
                Login
              </Link>
            </div>
          </div>
        </div>
        {/* mobile */}
        <div className="d-block d-lg-none">
          <div className="row">
            <div className="col-6">
              <Link
                to="/register"
                className="btn btn-primary btn-sm profile-register ml-2 pt-2"
                id="registerButton"
              >
                {/*<span style={{ marginLeft: '-8px' }}>Register</span>*/}
                Register
              </Link>
            </div>
            <div className="col-6">
              <Link
                to="/login"
                className="btn btn-primary btn-sm login-logout pt-2"
                id="loginButton"
              >
                {/*<span style={{ marginLeft: '-7px' }}>Login</span>*/}
                Login
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  };

  logout = (e) => {
    e.preventDefault();
    // this.props.removeAuthentication(false);
    this.setState({ isAuthenticated: false });

    if (localStorage.hasOwnProperty("customer_id")) {
      localStorage.removeItem("customer_id");
    }
    // this.props.history.push("/");
    window.location.reload(false);
  };

  render() {
    const { isAuthenticated, viewType, mobilePhoneHref } = this.state;
    return (
      <>
        <>
          {viewType == "desktop" && (
            <ul className="nav">
              <li className="nav-item">
                <a
                  className="nav-link nav-link-padding nav-link-custom"
                  href={`${VITE_APP_STORE_URL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-sign-in-alt pr-1" aria-hidden="true"></i>{" "}
                  Seller Center
                </a>
              </li>

              {/* <li className="nav-item">
                <a
                  className="nav-link nav-link-padding nav-link-custom"
                  href={`${VITE_APP_BLOG_URL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-rss pr-1" aria-hidden="true"></i>
                  Blog
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="/news"
                  className="nav-link nav-link-padding nav-link-custom"
                >
                  <i className="fas fa-newspaper-o pr-1" aria-hidden="true"></i>
                  News
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="/buyerProtection"
                  className="nav-link nav-link-padding nav-link-custom"
                >
                  <i className="fas fa-lock pr-1" aria-hidden="true"></i>
                  Buyer Protection
                </a>
              </li> */}

              <li className="nav-item">
                <a
                  href="/wish"
                  className="nav-link nav-link-padding nav-link-custom"
                >
                  <i className="far fa-heart pr-1" aria-hidden="true"></i>
                  Wish List
                </a>
              </li>

              <li className="nav-item dropdown">
                <a
                  className="nav-link nav-link-padding dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i
                    className="fa fa-user-o icon-class-rightmenu"
                    aria-hidden="true"
                  ></i>
                  {this.state.customerName
                    ? this.state.customerName
                    : "Account"}
                </a>

                <ul
                  className="dropdown-menu dropdown-menu-right"
                  aria-labelledby="dropdownMenuButton"
                >
                  <li>
                    <div className="navbar-login">
                      <div className="row">
                        <div className="col-lg-12">
                          <p className="text-center">
                            <strong>
                              Welcome{" "}
                              {this.state.customerName
                                ? this.state.customerName
                                : "to Alahee!"}
                            </strong>
                          </p>
                          <div className="customerDiv">
                            {isAuthenticated
                              ? this.sign_in_menu()
                              : this.sign_out_menu()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <a className="dropdown-item" href="/profile/my-orders">
                      My Orders
                    </a>
                  </li>
                  {/* <li>
                    <a className="dropdown-item" href="/messageCenter">
                      Message Center
                      <span className="unread-message-count" />
                    </a>
                  </li> */}
                  {/* <li>
                    <a className="dropdown-item" href="/wish">
                      Wish List
                    </a>
                  </li> */}
                  <li>
                    <a className="dropdown-item" href="/favStores">
                      My Favorite Stores
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="/coupons">
                      My Coupons
                    </a>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <a className="nav-link nav-link-padding" href="#">
                  {" "}
                  <img src="/image/bd_small.png" alt="company logo" />
                </a>
              </li>
            </ul>
          )}
        </>

        <>
          {viewType == "mobile" && (
            <>
              <div className="mt-4 ml-4">
                <div className="dropdown">
                  <button
                    className="dropdown-toggle dropdowntoggle"
                    type="button"
                    data-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <a href="/">
                      <img
                        src="/image/mobile_icon.png"
                        className="helpline-image mt-n1"
                        alt="Phone Icon"
                      />
                    </a>
                  </button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="navbarDropdown"
                  >
                    <a
                      className="dropdown-item  helpline-number"
                      href={mobilePhoneHref}
                    >
                      {this.props.companyInfo.telephone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-4 ml-4">
                <div className="dropdown">
                  <button
                    className="dropdown-toggle dropdowntoggle "
                    type="button"
                    data-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="far fa-user text-primary" />
                  </button>
                  <div
                    className="dropdown-menu dropdown-menu-right"
                    aria-labelledby="navbarDropdown"
                  >
                    <div className="navbar-login mb-2">
                      <div className="row">
                        <div className="col-12">
                          <p className="text-center">
                            <strong>
                              Welcome{" "}
                              {this.state.customerName
                                ? this.state.customerName
                                : "to Alahee!"}
                            </strong>
                          </p>
                          <div className="customerDiv">
                            {isAuthenticated
                              ? this.sign_in_menu()
                              : this.sign_out_menu()}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* <a className="dropdown-item dropdownItemMobile" href="#">
                      Message Center
                    </a> */}
                    {/* <a className="dropdown-item dropdownItemMobile" href="/wish">
                      Wish List
                    </a> */}

                    <a className="dropdown-item dropdownItemMobile" href="/profile/my-orders">
                      My Orders
                    </a>
                    <a className="dropdown-item dropdownItemMobile" href="#">
                      My Favorite Stores
                    </a>
                    <a className="dropdown-item dropdownItemMobile" href="#">
                      My Coupons
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-4 ml-4">
                <CartIcon viewType="mobile" />
              </div>

              <div className="mt-4 ml-4">
                <div className="dropdown">
                  <button
                    className="dropdown-toggle dropdowntoggle"
                    type="button"
                    data-toggle="dropdown"
                  >
                    <i className="fas fa-bars text-primary" />
                  </button>
                  <div
                    className="dropdown-menu dropdown-menu-right"
                    aria-labelledby="navbarDropdown"
                  >
                    <a
                      className="dropdown-item dropdownItemMobile"
                      href={`${VITE_APP_STORE_URL}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Seller Center
                    </a>

                    {/* <a
                      className="dropdown-item dropdownItemMobile"
                      href={`${VITE_APP_BLOG_URL}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Blog
                    </a>
                    <a
                      className="dropdown-item dropdownItemMobile"
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      News
                    </a>
                    <a className="dropdown-item dropdownItemMobile" href="#">
                      Help
                    </a>
                    <a className="dropdown-item dropdownItemMobile" href="#">
                      Buyer Protection
                    </a> */}

                    <a className="dropdown-item dropdownItemMobile" href="/wish">
                      Wish List
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      </>
    );
  }
}

export default withRouter(TopNav);
