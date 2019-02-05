import ItemComponent from "../components/Item";
import { shallow } from "enzyme";

const fakeItem = {
  id: "ABC1234",
  price: "5000",
  title: "Test item",
  description: "This is a test item",
  image: "dogs.jpg",
  largeImage: "largedog.jpg"
};

describe("<Item/>", () => {
  it("renders the image properly", () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    const img = wrapper.find("img");
    expect(img.props().src).toBe(fakeItem.image);
    expect(img.props().alt).toBe(fakeItem.title);
  });

  it("should render the price tag and title", () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
  });
});
