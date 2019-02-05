import PleaseSignIn from "../components/PleaseSignIn";
import OrderList from "../components/OrderList";

const Orders = props => {
  return (
    <PleaseSignIn>
      <OrderList />
    </PleaseSignIn>
  );
};

export default Orders;
