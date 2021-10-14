import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";

import makeStore from "../store";
import EditDish from "../../containers/dishes/EditDish";

describe("Dishes", () => {
  let store;
  let wrapper;
  let history;

  beforeEach(() => {
    store = makeStore();
    history = [];
    fetch.resetMocks();
    wrapper = mount(
      <Provider store={store}>
        <EditDish
          match={{ params: { id: 2 } }}
          history={{ push: (url) => history.push(url) }}
          location={{ query: {} }}
        />
      </Provider>
    );
  });

  it("should cancel on cancel button", () => {
    wrapper.find(".cancelBtn").simulate("click");

    expect(history).toEqual(["/"]);
    expect(store.getActions()).toEqual([]);
  });
});
