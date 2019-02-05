import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";
const SIGN_IN_MUTATION = gql`
  mutation SIGN_IN_MUTATION($password: String!, $email: String!) {
    signIn(email: $email, password: $password) {
      id
      name
      email
    }
  }
`;
class Signin extends Component {
  state = {
    email: "",
    password: ""
  };
  onChangeState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <Mutation
        mutation={SIGN_IN_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signUp, { loading, error }) => {
          return (
            <Form
              onSubmit={async e => {
                e.preventDefault();
                await signUp();
                this.setState({ email: "", password: "" });
              }}
            >
              <Error error={error} />
              <fieldset>
                <label htmlFor="email">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={this.state.email}
                    onChange={this.onChangeState}
                    placeholder="Email"
                  />
                </label>
                <label htmlFor="password">
                  Password
                  <input
                    type="password"
                    name="password"
                    value={this.state.password}
                    onChange={this.onChangeState}
                    placeholder="Password"
                  />
                </label>
                <button type="submit">Sign In</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default Signin;
