import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $name: String!
    $password: String!
    $email: String!
  ) {
    signUp(email: $email, name: $name, password: $password) {
      id
      name
      email
    }
  }
`;
class SignUp extends Component {
  state = {
    email: "",
    password: "",
    name: ""
  };
  onChangeState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <Mutation mutation={SIGNUP_MUTATION} variables={this.state}>
        {(signUp, { loading, error }) => {
          return (
            <Form
              onSubmit={async e => {
                e.preventDefault();
                const user = await signUp();
                this.setState({ email: "", password: "", user: "" });
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
                <label htmlFor="name">
                  Name
                  <input
                    type="text"
                    name="name"
                    value={this.state.name}
                    onChange={this.onChangeState}
                    placeholder="Name"
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
                <button type="submit">Sign Up</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default SignUp;
