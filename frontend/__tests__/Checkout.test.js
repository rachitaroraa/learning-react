import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import NProgress from "nprogress";
import Router from "next/router";
import Checkout from "../components/Checkout";
import { CURRENT_USER_QUERY } from "../components/User";
import { fakeUser, fakeCartItem } from "../lib/testUtils";

Router.router = { push() {} };

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem()]
        }
      }
    }
  }
];

describe("<Checkout/>", () => {
  it("renders and match snapshot", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Checkout />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const checkoutButton = wrapper.find("ReactStripeCheckout");
    expect(toJSON(checkoutButton)).toMatchSnapshot();
  });
  it("creates an order on token", async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: { createOrder: { id: "xyz789" } }
    });
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Checkout />
      </MockedProvider>
    );
    const component = wrapper.find("Checkout").instance();
    component.onToken({ id: "abc123" }, createOrderMock);
    expect(createOrderMock).toHaveBeenCalled();
    expect(createOrderMock).toHaveBeenCalledWith({
      variables: { token: "abc123" }
    });
  });
  it("turns the progress bar on", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Checkout />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    NProgress.start = jest.fn();
    const createOrderMock = jest
      .fn()
      .mockResolvedValue({ data: { createOrder: { id: "xyz789" } } });
    const component = wrapper.find("Checkout").instance();
    component.onToken({ id: "abc123" }, createOrderMock);
    expect(NProgress.start).toHaveBeenCalled();
  });
  it("routes to the order when completed", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Checkout />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const createOrderMock = jest
      .fn()
      .mockResolvedValue({ data: { createOrder: { id: "xyz789" } } });
    const component = wrapper.find("Checkout").instance();
    Router.router.push = jest.fn();
    component.onToken({ id: "abc123" }, createOrderMock);
    await wait();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/order",
      query: { id: "xyz789" }
    });
  });
});
