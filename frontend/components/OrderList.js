import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { formatDistance } from "date-fns";
import Link from "next/link";
import styled from "styled-components";
import Error from "./ErrorMessage";
import formatMoney from "../lib/formatMoney";
import OrderItemStyles from "./styles/OrderItemStyles";

const ORDER_LIST_QUERY = gql`
  query ORDER_LIST_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      charge
      total
      createdAt

      items {
        id
        title
        description
        image
        price
        quantity
      }
    }
  }
`;

const OrderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

class OrderList extends Component {
  render() {
    return (
      <Query query={ORDER_LIST_QUERY}>
        {({ data: { orders }, loading, error }) => {
          if (error) return <Error error={error} />;
          if (loading) return <p>Loading</p>;

          return (
            <div>
              <h2>You have {orders.length} orders</h2>
              <OrderUl>
                {orders.map(order => (
                  <OrderItemStyles key={order.id}>
                    <Link
                      href={{
                        pathname: "/order",
                        query: { id: order.id }
                      }}
                    >
                      <a>
                        <div className="order-meta">
                          <p>
                            {order.items.reduce((a, b) => a + b.quantity, 0)}
                          </p>
                          <p>{order.items.length} products</p>
                          <p>{formatDistance(order.createdAt, new Date())}</p>
                          <p>{formatMoney(order.total)}</p>
                        </div>
                        <div className="images">
                          {order.items.map(item => (
                            <img
                              key={item.id}
                              src={item.image}
                              alt={item.title}
                            />
                          ))}
                        </div>
                      </a>
                    </Link>
                  </OrderItemStyles>
                ))}
              </OrderUl>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default OrderList;
