import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import addicon from "../../assets/icons/add.svg";
import clearicon from "../../assets/icons/clear.svg";
import Autosuggest from "./Autosuggest";

class New extends Component {
  componentDidMount() {
    const { onInputSearch } = this.props;
    onInputSearch("");
  }

  onSelect({ target }, { suggestion }) {
    const { onSelectItem, onRemoveItem, onInputSearch } = this.props;

    if (target.name === "delete") {
      onRemoveItem(suggestion.id);
    } else {
      onSelectItem(suggestion.id);
      onInputSearch("");
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    const {
      search,
      onAddItem,
      isCollaboration,
      uid,
      onSubmit,
      onInputSearch,
      isLoggedIn,
    } = this.props;

    if (!isLoggedIn) {
      return;
    }

    onAddItem({
      name: search,
      uid: isCollaboration ? null : uid,
    }).then((res) => onSubmit(res));
    onInputSearch("");
  }

  render() {
    const { search, translate, view, autosuggest, onInputSearch } = this.props;

    const inputfield = autosuggest ? (
      <Autosuggest
        id="newItem"
        value={search}
        placeholder={translate(`${view}.input`)}
        onSelect={(evt, values) => this.onSelect(evt, values)}
        onChange={({ target }, { method }) => {
          if (method === "type") onInputSearch(target.value);
        }}
      />
    ) : (
      <input
        id="newItem"
        type="text"
        value={search}
        autoComplete="off"
        placeholder={translate(`${view}.input`)}
        onChange={({ target }) => onInputSearch(target.value)}
      />
    );

    return (
      <form className="search-form" onSubmit={(evt) => this.handleSubmit(evt)}>
        <span role="presentation" onClick={() => onInputSearch("")}>
          <img className="clear-icon" alt="X" src={clearicon} height="12px" />
        </span>
        <label htmlFor="newItem">
          <img className="add-icon" alt="add" src={addicon} height="12px" />
          {inputfield}
        </label>
      </form>
    );
  }
}

New.defaultProps = {
  autosuggest: false,
  onSubmit: () => {},
};

New.propTypes = {
  autosuggest: PropTypes.bool,
  onSubmit: PropTypes.func,
  onAddItem: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onInputSearch: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  search: state.search,
  translate: getTranslate(state.locale),
  isCollaboration: state.user.isCollaboration,
  isLoggedIn: !!state.user.email,
  uid: state.user.id,
});

const mapDispatchToProps = (dispatch, props) => ({
  onAddItem: (item) => dispatch(props.onAdd(item)),
  onSelectItem: (id) => dispatch(props.onSelect(id)),
  onRemoveItem: (id) => dispatch(props.onRemove(id)),
  onInputSearch: (input) => dispatch(props.onSearch(input)),
});

export default connect(mapStateToProps, mapDispatchToProps)(New);
