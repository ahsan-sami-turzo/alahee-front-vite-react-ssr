import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { get_order_history } from "../../redux/customer-profile/customer-actions";
import { fileUrl } from "../../utils/common-helpers";
import { comma_separate_numbers } from "../../utils/utils";
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

      // const txn = db.transaction('orders', 'readonly');
      const txn = db.transaction(["orders"], 'readwrite');
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
    console.log('order_history...', order_history);

    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-12">
            <ProfilePageNav />
          </div>

          <div className="col-lg-9 col-md-12">

            {order_history.length > 0 ? (

              <Fragment>
                {order_history.map((item) => (
                  <div className="card mt-2">
                    <div className="card-header bg-success text-light text-center"></div>

                    <div className="card-body">
                      <div className="row p-2" key={item.product_name}>

                        <div className="row col-md-12 col-sm-12 parent">

                          <div className="col-md-2 col-sm-2 child">{item.sales_date}</div>
                          <div className="col-md-3 col-sm-3 child">
                            <img
                              src={`${fileUrl}/upload/product/compressedProductImages/${item.home_image}`}
                              className="img-fluid"
                            />
                          </div>
                          <div className="col-md-3 col-sm-3 child"><h1 className="h5">{item.product_name}</h1></div>
                          <div className="col-md-2 col-sm-2 child"><em>Quantity&nbsp;</em> {item.sales_product_quantity}</div>
                          <div className="col-md-2 col-sm-2 child"><em>Unit Price&nbsp;</em> {item.unitPrice}</div>
                        </div>

                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="row col-md-12">
                        <div className="col-md-4 col-sm-12 child" style={{ textAlign: 'left' }}>
                          <p className="my-0">
                            Bill No:
                            <strong>&nbsp;{item.sales_bill_no}</strong>
                          </p>
                        </div>

                        <div className="col-md-5 col-sm-12" style={{ textAlign: 'center' }}>
                          <p className="my-0">
                            Status:&nbsp;
                            {item.isAcceptedByVendor == "False" ? (
                              <strong style={{ textTransform: 'capitalize' }}>
                                Awaiting confirmation
                              </strong>
                            ) : (
                              <strong style={{ textTransform: 'capitalize' }}>
                                {item.delivery_status}
                              </strong>
                            )}
                          </p>
                        </div>

                        <div className="col-md-3 col-sm-12" style={{ textAlign: 'right' }}>
                          <p className="my-0">
                            Total Price:
                            <strong><em>৳&nbsp;</em> {comma_separate_numbers(item.total_amount)}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                ))}
              </Fragment>
            ) : (
              <p style={{ color: "red" }}>No Orders to Show</p>
            )}

          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapState, { get_order_history })(MyOrders);
