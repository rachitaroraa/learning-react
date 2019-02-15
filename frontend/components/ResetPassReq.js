import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

const RESET_REQUEST_MUTATION = gql`
  mutation RESET_REQUEST_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;
class ResetPassReq extends Component {
  state = {
    email: ""
  };
  onChangeState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <Mutation mutation={RESET_REQUEST_MUTATION} variables={this.state}>
        {(requestReset, { loading, error, called }) => {
          return (
            <Form
              data-test="form"
              onSubmit={async e => {
                e.preventDefault();
                await requestReset();
                this.setState({ email: "" });
              }}
            >
              <Error error={error} />
              {!error && !loading && called && (
                <p>Success! Check your email for a reset link!</p>
              )}
              <fieldset>
                <label htmlFor="email">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={this.state.email}
                    onChange={this.onChangeState}
                    placeholder="Email"
                    required
                  />
                </label>

                <button type="submit">Reset Password</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default ResetPassReq;
export { RESET_REQUEST_MUTATION };
