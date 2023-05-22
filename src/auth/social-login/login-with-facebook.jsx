import React, { Component } from "react";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import "./social-login.css";

const LoginWithFacebook = ({ submittedData }) => {
  const responseFacebook = response => {
    console.log({ success: response });
    submittedData(response);
  };

  const onFailure = response => {
    alert("Log in Failed. Try again.");
  };


  const appId = "2187526391389667";

  return (
    <FacebookLogin
      appId={appId}
      // autoLoad={true}
      fields="name,email,picture"
      callback={responseFacebook}
      onFailure={onFailure}
      render={renderProps => (
        <button
          onClick={renderProps.onClick}
          className="loginBtn loginBtn--facebook"
        >
          Sign in with <b>Facebook</b>
        </button>
      )}
    />
  );
};

export default LoginWithFacebook;
