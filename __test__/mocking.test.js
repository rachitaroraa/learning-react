function Person(name, foods) {
  this.name = name;
  this.foods = foods;
}

Person.prototype.fetchFavFoods = function() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(this.foods), 2000);
  });
};

describe("mocking learning", () => {
  it("mocks a reg functiion", () => {
    const fetchDogs = jest.fn();
    fetchDogs("snickers");
    expect(fetchDogs).toHaveBeenCalled();
    expect(fetchDogs).toHaveBeenCalledWith("snickers");
    fetchDogs();
    expect(fetchDogs).toHaveBeenCalledTimes(2);
  });

  it("can create a person", () => {
    const me = new Person("Wes", ["pizza", "burgs"]);
    expect(me.name).toBe("Wes");
  });

  it("can fetch foods", async () => {
    const me = new Person("Wes", ["pizza", "burgs"]);
    // mock fave foods
    me.fetchFavFoods = jest.fn().mockResolvedValue(["pizza", "sushi"]);
    const favFoods = await me.fetchFavFoods();
    expect(favFoods).toContain("sushi");
  });
});
