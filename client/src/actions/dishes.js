import { FETCH_DISH, FETCH_DISHES, RESET_DISH } from "../constants/dishes";

export const addDish =
  ({ name, uid }) =>
  async (dispatch) => {
    if (name) {
      try {
        const res = await fetch("/__/dishes", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name, uid }),
        });
        const dish = await res.json();

        await dispatch(fetchDishes());

        return dish;
      } catch (err) {
        console.error(err);
      }
    }
  };

export const editDish =
  ({ id, name, img, description, categoryIds, menuDayId }) =>
  async (dispatch) => {
    try {
      const res = await fetch(`/__/dishes/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          img,
          description,
          categoryIds,
          menuDayId,
        }),
      });
      const dish = await res.json();

      await dispatch(fetchDishes());

      return dish;
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
    const res = await fetch(`/__/dishes/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const dish = await res.json();

    await dispatch(fetchDishes());

    return dish;
  } catch (err) {
    console.error(err);
  }
};

export const fetchDish = (id, history) => async (dispatch) => {
  try {
    const res = await fetch(`/__/dishes/${id}`, { credentials: "include" });
    if (res.status === 404) {
      history.push("/not-found");
      return;
    }
    const dish = await res.json();
    return dispatch({ type: FETCH_DISH, dish });
  } catch (err) {
    console.error(err);
  }
};

export const resetDish = () => ({ type: RESET_DISH });

export const fetchDishes = () => async (dispatch) => {
  try {
    const res = await fetch("/__/dishes", { credentials: "include" });
    const dishes = await res.json();
    return dispatch({ type: FETCH_DISHES, dishes });
  } catch (err) {
    console.error(err);
  }
};
