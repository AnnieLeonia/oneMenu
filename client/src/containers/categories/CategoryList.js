import { connect } from "react-redux";

import CategoryList from "../../components/CategoryList";
import { reorderCategory } from "../../actions/categories";

const mapStateToProps = (state) => ({
  items: state.categories
    .filter((category) => category.name.match(new RegExp(state.search, "i")))
    .map((category) => ({
      ...category,
      value: category.name,
    })),
  linkTo: (id) => `/categories/edit/${id}`,
});

const mapDispatchToProps = {
  onItemReorder: reorderCategory,
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoryList);
