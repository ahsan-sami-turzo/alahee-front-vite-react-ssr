import { css } from "@emotion/core";
import React from "react";
import { MoonLoader } from "react-spinners";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Spinner = () => {
  return (
    <div className="sweet-loading">
      <MoonLoader css={override} size={50} color={"#931600"} loading={true} />
    </div>
  );
};

export default Spinner;
