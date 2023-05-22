import React, { Component, Fragment } from "react";
import { connect } from "react-redux";

import { get_order_history } from "../../redux/customer-profile/customer-actions";

import ProfilePageNav from "./profile-nav";

const mapState = (state) => ({
  order_history: state.customer.order_history,
});



class MyOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customer_orders: []
    };
    this.getAllOrders = this.getAllOrders.bind(this);
  }

  componentDidMount() {
    if (localStorage.hasOwnProperty("customer_id")) {
      this.props.get_order_history(localStorage.getItem("customer_id"));
    }

    this.getAllOrders();
  }


  getAllOrders() {

    const request = indexedDB.open('alahee', 1);
    request.onerror = (event) => {
      console.error(`Database error: ${event.target.errorCode}`);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;

      const txn = db.transaction('orders', 'readonly');
      const store = txn.objectStore('orders');

      let query = store.getAll();

      query.onsuccess = (event) => {
        if (!event.target.result) {
          console.log(`Order not found`);
        } else {
          console.table('event.target.result...', event.target.result);
          this.setState({
            customer_orders: event.target.result
          });
        }
      };

      query.onerror = (event) => {
        console.log(event.target.errorCode);
      }

      txn.oncomplete = function () {
        db.close();
      };
    };
  }

  formatDate(string) {
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(string).toLocaleDateString([], options);
  }

  render() {
    const { order_history } = this.props;
    const { customer_orders } = this.state;
    console.log('customer_orders...', customer_orders);

    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-12">
            <ProfilePageNav />
          </div>

          <div className="col-lg-9 col-md-12">
            <Fragment>
              <h3>My Orders</h3>
              {customer_orders.length > 0 ? (
                <table className="hover unstriped stack table-bordered">
                  <thead>
                    <tr>
                      <th width="120">Order No #</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: "14px" }}>
                    {customer_orders.map((el, index) => (
                      <tr>
                        <td>{index}</td>
                        <td>{el.product_name}</td>
                        <td>{el.quantity}</td>
                        <td>{el.productPrice}</td>
                        <td>{el.quantity * el.productPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "red" }}>No Orders to Show</p>
              )}
            </Fragment>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapState, { get_order_history })(MyOrders);
