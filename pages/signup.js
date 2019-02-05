import SignUp from "../components/SignUp";
import Signin from "../components/Signin";
import ResetPassReq from "../components/ResetPassReq";
import styled from "styled-components";

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 30px;
`;

const SignUpPage = props => (
  <Columns>
    <SignUp />
    <Signin />
    <ResetPassReq />>
  </Columns>
);

export default SignUpPage;
