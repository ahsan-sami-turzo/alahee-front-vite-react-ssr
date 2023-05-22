import axios from "axios";
import React, { Component } from "react";
import { LineWave } from "react-loader-spinner";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import "./registration-form.css";
import SocialLogin from "./social-login/social-login";

const options = {
  headers: { "Content-Type": "application/json" },
};

const base = import.meta.env.VITE_APP_FRONTEND_SERVER_URL;
const fileUrl = import.meta.env.VITE_APP_FILE_URL;
const img_src = `${fileUrl}/upload/company`;

class Registration extends Component {
  state = {
    email: "",
    password: "",
    email_error: false,

    email_address: '',
    message: '',
    checkStatus: false,
    error: false,

    isRequestInProcess: false
  };

  onFormSubmit = (e) => {
    e.preventDefault();
    const userData = {
      email: this.state.email,
      password: this.state.password,
    };

    if (!this.validateEmail(this.state.email)) {
      toast.error("Invalid Email or Mobile !!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      return;
    }

    this.setState({ isRequestInProcess: true });

    axios
      .post(`${base}/api/saveCustomerInitial`, userData, options)
      .then((res) => {
        if (res.data.error) {
          this.setState({ email_error: true, password: "", message: res.data.message, error: true, isRequestInProcess: false });

          toast.error("Registration Failed !!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });

        } else if (!res.data.error) {

          this.setState({ email_error: false, message: '', error: false, isRequestInProcess: false });
          localStorage.setItem("customer_id", res.data.data);

          toast.success("Registration Successful !!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });

          setTimeout(() => {
            this.props.setAuthentication(true);
            this.props.history.push("/");
            window.location.reload(false);
          }, 2000);
        }
      })
      .catch((e) => this.setState({ message: 'Error !!', error: true, isRequestInProcess: false }));
  };

  /*handleSocialData = ({ name, email, id }) => {
    const userData = { name, email };
    axios.post(`${base}/api/socialLogin`, userData, options).then(res => {
      this.props.setAuthentication(true);
      localStorage.setItem("customer_id", res.data.customer_id);
      this.props.history.push("/");
    });
  };*/

  onChangeHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  validateEmail = (email) => {
    const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const mobReg = /(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/;

    return emailReg.test(String(email).toLowerCase()) || mobReg.test(String(email).toLowerCase());
  }

  render() {
    const { email, password, email_error } = this.state;
    const { setAuthentication } = this.props;
    return (
      <>

        <ToastContainer />

        <LineWave
          visible={this.state.isRequestInProcess}
          color="#009345"
          height={100}
          width={100}
          style={{ display: "flex", justifyContent: "center" }}
        />

        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8 d-none d-lg-block">
              <img
                className="img-fluid mt-4"
                // src="https://admin.alahee.com/upload/product/compressedProductImages/banner3.png"
                src={`${img_src}/logo-3d-bn.jpg`}
                alt="Ads"
                title="Ads"
              />
            </div>

            <div className="col-md-4">
              <div className="login-form">
                <div className="login-form-div">
                  <form onSubmit={this.onFormSubmit}>
                    <h2 className="text-center">Sign Up</h2>
                    <div className="form-group">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fa fa-user" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          name="email"
                          onChange={this.onChangeHandler}
                          value={email}
                          placeholder="Mobile or Email"
                          required="required"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fa fa-lock" />
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          onChange={this.onChangeHandler}
                          value={password}
                          placeholder="Password"
                          required="required"
                        />
                      </div>
                    </div>




                    {this.state.error && (
                      <div className="has-error">
                        <p className="help-block text-center text-danger">
                          {this.state.message}
                        </p>
                      </div>
                    )}


                    <div className="form-group">
                      <button
                        type="submit"
                        className="btn btn-success btn-block login-btn"
                        disabled={this.state.isRequestInProcess}
                      >
                        Submit
                      </button>
                    </div>

                    {/* {email_error && (
                    <div className="has-error">
                      <p className="help-block text-center text-danger">
                        Email Already Exists! Use Another One.
                      </p>
                    </div>
                  )} */}

                    <div className="clearfix" />

                    <div className="or-seperator">
                      <i>or</i>
                    </div>
                  </form>

                  {/*Social login*/}
                  <div className="text-center social-btn">
                    <SocialLogin setAuthentication={setAuthentication} />
                  </div>

                </div>
                <div className="hint-text">
                  Already have an account?{" "}
                  <Link to="/login" className="text-success">
                    <strong style={{ fontWeight: "bold" }}> Login Now! </strong>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-8 d-lg-none d-block">
              <img
                className="img-fluid mt-4"
                src={`${img_src}/logo-3d-bn.jpg`}
                alt="Ads"
                title="Ads"
              />
            </div>
          </div>
        </div>

      </>
    );
  }
}

export default Registration;
