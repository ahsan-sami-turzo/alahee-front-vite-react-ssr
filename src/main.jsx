import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import ScrollToTop from "./assets/ScrollToTop";
import { persistor, store } from "./redux/store";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'react-multi-carousel/lib/styles.css';
import "./assets/notFoundPage.css";
import "./assets/scrollToTop.css";
import "./assets/selectImage.css";
import "./assets/social-share.css";
import './assets/styles_update/auth.css';
import './assets/styles_update/checkout.css';
import './assets/styles_update/contactUs.css';
import './assets/styles_update/custom-accordion-styles.css';
import './assets/styles_update/custom-styles.css';
import './assets/styles_update/featured-category.css';
import './assets/styles_update/fontawesome/css/all.min.css';
import './assets/styles_update/footer.css';
import './assets/styles_update/header.css';
import './assets/styles_update/home-page.css';
import './assets/styles_update/mainCategoryMenu.css';
import './assets/styles_update/product-details.css';
import './assets/styles_update/product-list.css';
import './assets/styles_update/registration-form.css';
import './assets/styles_update/shopping-cart.css';
import './assets/styles_update/social-login.css';
import './assets/styles_update/vendor.css';

ReactDOM.hydrate(
  <Provider store={store}>
    <BrowserRouter>
      <PersistGate persistor={persistor}>
        <ScrollToTop />
        <App />
      </PersistGate>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
)

// if (module.hot) {
//   module.hot.accept("./App", () => {
//     const NextApp = require("./App").default;
//     render(NextApp)
//   })
// }
