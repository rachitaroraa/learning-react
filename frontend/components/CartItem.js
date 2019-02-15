import React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import { CURRENT_USER_QUERY } from "./User";
import styled from "styled-components";
import RemoveFromCart from "./RemoveFromCart";
import formatMoney from "../lib/formatMoney";

const StyleSingleItem = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3,
  p {
    margin: 0;
  }
`;

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteCartItem(id: $id) {
      id
    }
  }
`;

const CartItem = ({ cartItem }) => {
  if (!cartItem.item)
    return (
      <StyleSingleItem>
        <p>This item has been removed</p>
        <RemoveFromCart id={cartItem.id} />
      </StyleSingleItem>
    );
  return (
    <StyleSingleItem>
      <img width="100" src={cartItem.item.image} alt={cartItem.item.title} />
      <div className="cart-item-details">
        <h3>{cartItem.item.title}</h3>
        <p>
          {formatMoney(cartItem.item.price * cartItem.quantity)} {" - "}
          <em>
            {cartItem.quantity} &times; {formatMoney(cartItem.item.price)} each
          </em>
        </p>
      </div>
      <RemoveFromCart id={cartItem.id} />
    </StyleSingleItem>
  );
};

CartItem.prototypes = {
  cartItem: PropTypes.object.isRequired
};
export default CartItem;
