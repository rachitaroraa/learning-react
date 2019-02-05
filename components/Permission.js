import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import Error from "./ErrorMessage";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";

const possiblePermissions = [
  "ADMIN",
  "USER",
  "ITEMCREATE",
  "ITEMUPDATE",
  "ITEMDELETE",
  "PERMISSIONUPDATE"
];

const UPDATE_PERMISSION_MUTATION = gql`
  mutation UPDATE_PERMISSION_MUTATION($permission: [Permission], $userId: ID!) {
    updatePermission(permission: $permission, userId: $userId) {
      id
      name
      email
      permission
    }
  }
`;
const ALL_USER_QUERY = gql`
  query {
    users {
      id
      name
      email
      permission
    }
  }
`;
const Permissions = props => (
  <Query query={ALL_USER_QUERY}>
    {({ loading, error, data }) => (
      <div>
        <Error error={error} />
        <div>
          <h2>Manage Permission</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map(permission => (
                  <th key={permission}>{permission}</th>
                ))}
                <th>👇🏻</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <UserPermission key={user.id} user={user} />
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
);

class UserPermission extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permission: PropTypes.array
    }).isRequired
  };
  state = {
    permission: this.props.user.permission
  };
  updateCheckBox = e => {
    const checkbox = e.target;
    let updatePermission = [...this.state.permission];
    if (checkbox.checked) {
      updatePermission.push(checkbox.value);
    } else {
      updatePermission = updatePermission.filter(
        item => checkbox.value !== item
      );
    }
    this.setState({
      permission: updatePermission
    });
  };
  render() {
    const user = this.props.user;

    return (
      <Mutation
        mutation={UPDATE_PERMISSION_MUTATION}
        variables={{
          permission: this.state.permission,
          userId: this.props.user.id
        }}
      >
        {(updatePermission, { loading, error }) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            {possiblePermissions.map(permission => (
              <td key={permission}>
                <label htmlFor={`${user.id}-permission-${permission}`}>
                  <input
                    id={`${user.id}-permission-${permission}`}
                    type="checkbox"
                    checked={this.state.permission.includes(permission)}
                    value={permission}
                    onChange={this.updateCheckBox}
                  />
                </label>
              </td>
            ))}
            <td>
              <SickButton
                type="button"
                disabled={loading}
                onClick={updatePermission}
              >
                Updat{loading ? "ing" : "e"}
              </SickButton>
            </td>
          </tr>
        )}
      </Mutation>
    );
  }
}
export default Permissions;
