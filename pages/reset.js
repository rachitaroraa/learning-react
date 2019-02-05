import ResetPassword from "../components/ResetPassword";

const Reset = props => {
  return (
    <div>
      <p>Reset passwrod request for {props.query.resetToken}</p>
      <ResetPassword resetToken={props.query.resetToken} />
    </div>
  );
};

export default Reset;
