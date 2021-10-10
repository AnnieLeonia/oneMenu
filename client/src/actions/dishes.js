import { FETCH_DISHES } from "../constants/dishes";

export const addDish =
  ({ name, uid }) =>
  async (dispatch) => {
    if (name) {
      try {
        await fetch("/__/dishes", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name, uid }),
        });
        return await dispatch(fetchDishes());
      } catch (err) {
        console.error(err);
      }
    }
  };

export const editDish =
  ({ id, name, categoryIds }) =>
  async (dispatch) => {
    try {
      await fetch(`/__/dishes/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, categoryIds }),
      });
      return await dispatch(fetchDishes());
    } catch (err) {
      console.error(err);
    }
  };

export const toggleDishChecked =
  ({ id, uid }) =>
  async (dispatch) => {
    try {
      await fetch(`/__/dishes/${id}/${uid}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Type: "toggle-checked",
        },
        credentials: "include",
      });
      return await dispatch(fetchDishes());
    } catch (err) {
      console.error(err);
    }
  };

export const toggleDishInactive = (id) => async (dispatch) => {
  try {
    await fetch(`/__/dishes/${id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Type: "toggle-active",
      },
      credentials: "include",
    });
    return await dispatch(fetchDishes());
  } catch (err) {
    console.error(err);
  }
};

export const removeDish = (id) => async (dispatch) => {
  try {
    await fetch(`/__/dishes/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return await dispatch(fetchDishes());
  } catch (err) {
    console.error(err);
  }
};

export const fetchDishes = () => async (dispatch) => {
  try {
    const res = await fetch("/__/dishes", { credentials: "include" });
    const dishes = await res.json();
    return dispatch({ type: FETCH_DISHES, dishes });
  } catch (err) {
    console.error(err);
  }
};
