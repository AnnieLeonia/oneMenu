import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";

import { store } from "../store";
import New from "../../containers/common/New";
import { searchInput } from "../../actions/dishes";
import { SEARCH_INPUT } from "../../constants/dishes";

describe("New", () => {
  it("should add item", () => {
    const component = mount(
      <Provider store={store}>
        <New
          view="test"
          onAdd={(item) => ({ type: "ADD", ...item })}
          onSearch={searchInput}
        />
      </Provider>
    );
    component.find("input").simulate("change", { target: { value: "Milk" } });
    component.find("form").simulate("submit", { preventDefault() {} });
    expect(store.getActions()).toEqual([
      { type: SEARCH_INPUT, input: "Milk" },
      { type: "ADD", name: "Milk", uid: undefined },
      { type: SEARCH_INPUT, input: "" },
    ]);
  });

  it("should add autosuggest item", () => {
    const wrapper = mount(
      <Provider store={store}>
        <New
          view="test"
          onAdd={(item) => ({ type: "ADD", ...item })}
          onSearch={searchInput}
        />
      </Provider>
    );

    // wrapper.find('input').prop('onFocus')();
    wrapper.find("input").simulate("focus");
    wrapper.find("input").simulate("change", { target: { value: "Mi" } });
    console.log(
      "focused:",
      wrapper.find("input").props().id === document.activeElement.id
    );
    console.log(wrapper.find("input").html());
    console.log(store.getActions());
  });
});
