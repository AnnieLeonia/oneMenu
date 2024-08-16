import { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { fetchDishes } from "../../actions/dishes";
import { fetchCategories } from "../../actions/categories";

class FetchDB extends Component {
  constructor() {
    super();
    this.interval = null;
    this.update = () => {};
  }

  componentWillReceiveProps({ user, updateDishes, updateCategories }) {
    const { username } = user;
    this.update = () => {
      updateDishes();
      updateCategories();
    };

    const intervalUpdate = () => {
      clearInterval(this.interval);
      this.interval = setInterval(this.update, 5000);
    };

    this.update();
    intervalUpdate();
    window.onclick = intervalUpdate;
  }

  render() {
    return null;
  }
}

FetchDB.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
  }).isRequired,
  updateDishes: PropTypes.func.isRequired,
  updateCategories: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = {
  updateDishes: fetchDishes,
  updateCategories: fetchCategories,
};

export default connect(mapStateToProps, mapDispatchToProps)(FetchDB);
