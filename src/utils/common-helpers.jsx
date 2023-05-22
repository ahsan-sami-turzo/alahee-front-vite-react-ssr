
export const emailPattern = /^(([^<>()[]\.,;:s@"]+(.[^<>()[]\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;

export const options = {
  headers: { "Content-Type": "application/json" }
};


export const base = import.meta.env.VITE_APP_FRONTEND_SERVER_URL;

export const frontEndUrl = import.meta.env.VITE_APP_FRONTEND_URL;

export const fileUrl = import.meta.env.VITE_APP_FILE_URL;

export const imgUrl = `${fileUrl}/upload/product/compressedProductImages/`;


// import { base, frontEndUrl, fileUrl, imgUrl, emailPattern, options } from "../../utils/common-helpers";