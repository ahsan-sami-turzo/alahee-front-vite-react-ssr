import React from "react";
import GoogleLogin from "react-google-login";
import "./social-login.css";

const LoginWithGoogle = ({ submittedData }) => {
  const responseGoogle = (response) => {
    const { name, email, googleId } = response.profileObj;
    submittedData({ name, email, id: googleId });
  };

  const clientId = "997807369166-j3fdg329ft8ah7maqclksj1nsf7ok15b.apps.googleusercontent.com";

  return (
    <GoogleLogin
      clientId={clientId}
      render={(renderProps) => (
        <button
          className="loginBtn loginBtn--google"
          onClick={renderProps.onClick}
          disabled={renderProps.disabled}
        >
          Sign in with <b>Google</b>
        </button>
      )}
      onSuccess={responseGoogle}
      onFailure={responseGoogle}
    />
  );
};

export default LoginWithGoogle;
