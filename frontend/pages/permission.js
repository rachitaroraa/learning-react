import PleaseSignIn from "../components/PleaseSignIn";
import Permission from "../components/Permission";

const PermissionPage = props => {
  return (
    <PleaseSignIn>
      <p>Permission page</p>
      <Permission />
    </PleaseSignIn>
  );
};

export default PermissionPage;
