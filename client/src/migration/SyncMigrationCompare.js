import React from "react";
import PropTypes from "prop-types";

import MigrationCompareColumn from "./MigrationCompareColumn";

const columnShape = {
  title: PropTypes.string.isRequired,
  markdown: PropTypes.string,
  empty: PropTypes.string,
};

function SyncMigrationCompare({ left, right }) {
  const columns = [left, right];

  return (
    <div className="migration-compare">
      <div className="migration-compare-row migration-compare-row--rendered">
        {columns.map((col) => (
          <MigrationCompareColumn
            key={`rendered-${col.title}`}
            variant="rendered"
            title={col.title}
            markdown={col.markdown}
            empty={col.empty}
          />
        ))}
      </div>
      <div className="migration-compare-row migration-compare-row--source">
        {columns.map((col) => (
          <MigrationCompareColumn
            key={`source-${col.title}`}
            variant="source"
            title={col.title}
            markdown={col.markdown}
            empty={col.empty}
          />
        ))}
      </div>
    </div>
  );
}

SyncMigrationCompare.propTypes = {
  left: PropTypes.shape(columnShape).isRequired,
  right: PropTypes.shape(columnShape).isRequired,
};

export default SyncMigrationCompare;
