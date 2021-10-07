import makeStore, { store } from '../store';
import dishes from '../../reducers/dishes';
import {
  addDish,
  editDish,
  toggleDishChecked,
  toggleDishInactive,
  removeDish,
  inactivateDishes,
  fetchDishes,
} from '../../actions/dishes';

const testDish = [
  {
    id: 1,
    name: 'Milk',
  },
];

const id = () => ({})

describe('dishes reducer', () => {
  const { dispatch } = store;
  it('has a default state', () => {
    expect(dishes(undefined, { type: 'unexpected' })).toEqual([]);
  });

  it('can handle ADD_PRODUCT', async () => {
    fetch.mockResponse(
      JSON.stringify([{
        id: 1,
        name: 'Milk',
      }])
    );
    const state = await dispatch(addDish({ name: 'Milk' }));
    expect(dishes(undefined, state)).toEqual(testDish);
  });

  it('can handle ADD_PRODUCT for None', () => {
    expect(dishes(undefined, dispatch(addDish({})))).toEqual([]);
  });

  it('can handle TOGGLE_PRODUCT_CHECKED', async () => {
    fetch.mockResponse(
      JSON.stringify([{
        id: 1,
        name: 'Milk',
        checked: true
      }])
    );
    expect(dishes(testDish, await dispatch(toggleDishChecked(1)))).toEqual(
      testDish.map(dish => ({ ...dish, checked: true }))
    );
  });
  it('can handle TOGGLE_PRODUCT_INACTIVE', async () => {
    fetch.mockResponse(
      JSON.stringify([{
        id: 1,
        name: 'Milk',
        checked: null
      }])
    );
    expect(dishes(testDish, await dispatch(toggleDishInactive(1, id)))).toEqual(
      testDish.map(dish => ({ ...dish, checked: null }))
    );
  });

  it('can handle REMOVE_PRODUCT', async () => {
    fetch.mockResponse(JSON.stringify([]));
    expect(dishes(testDish, await dispatch(removeDish(1)))).toEqual([]);
  });

  it('can handle INACTIVATE_PRODUCTS', async () => {
    fetch.mockResponse(
      JSON.stringify([
        { id: 1, name: 'Milk' },
        { id: 2, name: 'Apple', checked: null },
        { id: 3, name: 'Pear', checked: null }
      ])
    );
    expect(
      dishes(
        [
          ...testDish,
          { id: 2, name: 'Apple', checked: true },
          { id: 3, name: 'Pear', checked: true },
        ],
        await dispatch(inactivateDishes(null, id))
      )
    ).toEqual([
      ...testDish,
      { id: 2, name: 'Apple', checked: null },
      { id: 3, name: 'Pear', checked: null },
    ]);
  });

  it('can handle FETCH_PRODUCTS', done => {
    const mockStore = makeStore();
    fetch.mockResponse(
      JSON.stringify([
        {
          id: 1,
          name: 'Milk',
        },
      ])
    );

    mockStore.dispatch(fetchDishes());

    setImmediate(() => {
      expect(mockStore.getActions()).toEqual([
        {
          type: 'FETCH_PRODUCTS',
          dishes: [
            {
              id: 1,
              name: 'Milk',
            },
          ],
        },
      ]);
      done();
    });
  });

  it('can handle ERRORS', () => {
    fetch.resetMocks();
    fetch.mockReject('Error');

    dispatch(addDish({ name: 'Milk' }));
    dispatch(editDish({ id: 1, name: 'Milk' }));
    dispatch(toggleDishChecked(1));
    dispatch(toggleDishInactive(1, id));
    dispatch(removeDish(1));
    dispatch(inactivateDishes(null, id));
    dispatch(fetchDishes());

    expect(fetch.mock.calls.length).toEqual(7);
  });
});
