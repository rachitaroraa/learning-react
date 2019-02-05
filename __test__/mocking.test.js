describe("mocking learning", () => {
  it("mocks a reg functiion", () => {
    const fetchDogs = jest.fn();
    fetchDogs();
    expect(fetchDogs).toHaveBeenCalled();
  });
});
