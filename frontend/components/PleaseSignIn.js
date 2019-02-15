import { Query } from "react-apollo";
import { CURRENT_USER_QUERY } from "./User";
import SignIn from "./Signin";

const PleaseSignIn = props => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading }) => {
      if (loading) return <p>Loading....</p>;
      if (!data.me) {
        return (
          <>
            <p>Please Logged in First</p>
            <SignIn />
          </>
        );
      }
      return props.children;
    }}
  </Query>
);

export default PleaseSignIn;