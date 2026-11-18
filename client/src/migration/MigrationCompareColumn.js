import React from "react";
import PropTypes from "prop-types";
import MarkdownRenderer from "../components/MarkdownRenderer";

function sourceRows(markdown) {
  const lines = (markdown || "").split("\n").length;
  return Math.max(lines, 6);
}

const MigrationCompareColumn = ({ variant, title, markdown, empty }) => {
  if (variant === "rendered") {
    return (
      <div className="migration-column migration-column--rendered">
        <h3 className="migration-column-title">{title}</h3>
        {empty ? (
          <p className="migration-column-empty">{empty}</p>
        ) : (
          <div className="migration-column-rendered">
            <MarkdownRenderer markdown={markdown} className="markdown-body" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="migration-column migration-column--source">
      {empty ? (
        <p className="migration-column-empty migration-column-empty--source">
          {empty}
        </p>
      ) : (
        <textarea
          readOnly
          className="migration-column-source"
          value={markdown || ""}
          rows={sourceRows(markdown)}
          spellCheck={false}
          aria-label={title}
        />
      )}
    </div>
  );
};

MigrationCompareColumn.propTypes = {
  variant: PropTypes.oneOf(["rendered", "source"]).isRequired,
  title: PropTypes.string.isRequired,
  markdown: PropTypes.string,
  empty: PropTypes.string,
};

MigrationCompareColumn.defaultProps = {
  markdown: "",
  empty: null,
};

export default MigrationCompareColumn;
