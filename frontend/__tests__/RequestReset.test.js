import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import { MockedProvider } from "react-apollo/test-utils";
import ResetPassReq, {
  RESET_REQUEST_MUTATION
} from "../components/ResetPassReq";
import wait from "waait";

const mocks = [
  {
    request: {
      query: RESET_REQUEST_MUTATION,
      variables: { email: "rachit4evr@gmail.com" }
    },
    result: {
      data: { requestReset: { message: "success", __typename: "message" } }
    }
  }
];

describe("<ResetPassReq/>", () => {
  it("renders and matches snapshots", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ResetPassReq />
      </MockedProvider>
    );
    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });
  it("calls the mutation", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ResetPassReq />
      </MockedProvider>
    );
    // simulate typing an email
    wrapper.find("input").simulate("change", {
      target: { name: "email", value: "rachit4evr@gmail.com" }
    });
    // submit the form
    wrapper.find("form").simulate("submit");
    await wait();
    wrapper.update();
    expect(wrapper.find("p").text()).toContain(
      "Success! Check your email for a reset link!"
    );
  });
});
