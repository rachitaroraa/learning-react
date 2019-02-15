import { mount } from "enzyme";
import wait from "waait";
import toJSON from "enzyme-to-json";
import Router from "next/router";
import { MockedProvider } from "react-apollo/test-utils";
import CreateItem, { CREATE_ITEM_MUTATION } from "../components/CreateItem";
import { fakeItem } from "../lib/testUtils";

const mockedImage = "https://www.mockedImage.com/mockedImage.jpg";
global.fetch = jest.fn().mockResolvedValue({
  json: () => ({
    secure_url: mockedImage,
    eager: [{ secure_url: mockedImage }]
  })
});

describe("<CreateItem/>", () => {
  it("renders and matched snapshot", () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });
  it("uploads a file when changed", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    const input = wrapper.find('input[type="file"]');
    input.simulate("change", { target: { files: ["fakemocke.jpg"] } });
    await wait();
    const component = wrapper.find("CreateItem").instance();
    expect(component.state.image).toEqual(mockedImage);
    expect(component.state.largeImage).toEqual(mockedImage);
    expect(global.fetch).toHaveBeenCalled();
    global.fetch.mockReset();
  });
  it("handles state update", () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    wrapper
      .find("#title")
      .simulate("change", { target: { name: "title", value: "Test Product" } });
    wrapper.find("#price").simulate("change", {
      target: { name: "price", value: 5000, type: "number" }
    });
    wrapper.find("#description").simulate("change", {
      target: { name: "description", value: "Test Product description" }
    });
    expect(wrapper.find("CreateItem").instance().state).toMatchObject({
      title: "Test Product",
      price: 5000,
      description: "Test Product description"
    });
  });
  it("creates an item when the form is submitted", async () => {
    const item = fakeItem();
    const mocks = [
      {
        request: {
          query: CREATE_ITEM_MUTATION,
          variables: {
            title: item.title,
            price: item.price,
            description: item.description,
            image: "",
            largeImage: ""
          }
        },
        result: {
          data: {
            createItem: {
              ...fakeItem,
              id: "abc123",
              __typename: "Item"
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CreateItem />
      </MockedProvider>
    );

    wrapper
      .find("#title")
      .simulate("change", { target: { name: "title", value: item.title } });
    wrapper.find("#price").simulate("change", {
      target: { name: "price", value: item.price, type: "number" }
    });
    wrapper.find("#description").simulate("change", {
      target: { name: "description", value: item.description }
    });
    Router.router = { push: jest.fn() };
    wrapper.find("form").simulate("submit");
    await wait(50);
    console.log(wrapper.debug());
    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/item",
      query: { id: "abc123" }
    });
  });
});
