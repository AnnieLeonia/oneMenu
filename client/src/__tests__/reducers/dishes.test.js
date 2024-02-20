import makeStore, { store } from "../store";
import dishes from "../../reducers/dishes";
import {
  addDish,
  editDish,
  toggleDishInactive,
  removeDish,
  fetchDishes,
} from "../../actions/dishes";

const testDish = [
  {
    id: 1,
    name: "Milk",
  },
];

const id = () => ({});

describe("dishes reducer", () => {
  const { dispatch } = store;
  it("has a default state", () => {
    expect(dishes(undefined, { type: "unexpected" })).toEqual([]);
  });

  it("can handle ADD_DISH", async () => {
    fetch.mockResponse(
      JSON.stringify([
        {
          id: 1,
          name: "Milk",
        },
      ])
    );
    const state = await dispatch(addDish({ name: "Milk" }));
    expect(dishes(undefined, state)).toEqual(testDish);
  });

  it("can handle ADD_DISH for None", () => {
    expect(dishes(undefined, dispatch(addDish({})))).toEqual([]);
  });

  it("can handle TOGGLE_DISH_INACTIVE", async () => {
    fetch.mockResponse(
      JSON.stringify([
        {
          id: 1,
          name: "Milk",
          checked: null,
        },
      ])
    );
    expect(dishes(testDish, await dispatch(toggleDishInactive(1, id)))).toEqual(
      testDish.map((dish) => ({ ...dish, checked: null }))
    );
  });

  it("can handle REMOVE_DISH", async () => {
    fetch.mockResponse(JSON.stringify([]));
    expect(dishes(testDish, await dispatch(removeDish(1)))).toEqual([]);
  });

  it("can handle FETCH_DISHES", (done) => {
    const mockStore = makeStore();
    fetch.mockResponse(
      JSON.stringify([
        {
          id: 1,
          name: "Milk",
        },
      ])
    );

    mockStore.dispatch(fetchDishes());

    setImmediate(() => {
      expect(mockStore.getActions()).toEqual([
        {
          type: "FETCH_DISHES",
          dishes: [
            {
              id: 1,
              name: "Milk",
            },
          ],
        },
      ]);
      done();
    });
  });

  it("can handle ERRORS", () => {
    fetch.resetMocks();
    fetch.mockReject("Error");

    dispatch(addDish({ name: "Milk" }));
    dispatch(editDish({ id: 1, name: "Milk" }));
    dispatch(toggleDishInactive(1, id));
    dispatch(removeDish(1));
    dispatch(fetchDishes());

    expect(fetch.mock.calls.length).toEqual(5);
  });
});
