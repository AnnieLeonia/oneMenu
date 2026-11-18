import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";

import {
  buildRecipeView,
  DEFAULT_SERVINGS,
  RECIPE_LABELS,
  recipeContext,
} from "./recipeMarkdown";

const micromarkOpts = {
  extensions: [gfm()],
  htmlExtensions: [gfmHtml()],
};

const recipeHtml = (markdown) => {
  if (!markdown) return null;
  const html = micromark(markdown, micromarkOpts);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const crossableParent = (el) => {
  while (el instanceof Element) {
    const tag = el.tagName.toLowerCase();
    if (tag === "li" || tag === "tr") return el;
    el = el.parentElement;
  }
};

function RecipeMarkdownView({ markdown, className }) {
  const ctx = useMemo(() => recipeContext(markdown), [markdown]);
  const [selectedServings, setSelectedServings] = useState(
    () => ctx?.baseServings ?? DEFAULT_SERVINGS
  );

  useEffect(() => {
    if (ctx) setSelectedServings(ctx.baseServings);
  }, [ctx?.baseServings]);

  const multiplier = ctx ? selectedServings / ctx.baseServings : 1;
  const view = useMemo(
    () => buildRecipeView(ctx, multiplier),
    [ctx, multiplier]
  );

  const {
    servingOptions,
    showMetaTable,
    difficulty,
    time,
    preamble,
    ingredientsMarkdown,
    cooking,
    trailing,
  } = view;

  return (
    <div className={className}>
      {showMetaTable && (
        <table className="recipe-meta-table">
          <thead>
            <tr>
              <th>{RECIPE_LABELS.difficultyHeader}</th>
              <th>{RECIPE_LABELS.timeHeader}</th>
              <th>{RECIPE_LABELS.servingsHeader}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{difficulty || "-"}</td>
              <td>{time || "-"}</td>
              <td className="recipe-servings-cell">
                <select
                  className="recipe-servings-select"
                  value={String(selectedServings)}
                  aria-label={RECIPE_LABELS.servingsHeader}
                  onChange={(e) => setSelectedServings(Number(e.target.value))}
                >
                  {servingOptions.map((count) => (
                    <option key={count} value={String(count)}>
                      {count} {RECIPE_LABELS.servingsUnitShort}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <div
        onClick={(e) => {
          const row = crossableParent(e.target);
          if (row) row.classList.toggle("crossed-out");
        }}
      >
        {recipeHtml(preamble)}
        {[
          [
            ingredientsMarkdown,
            "recipe-ingredients",
            RECIPE_LABELS.ingredientsHeading,
          ],
          [cooking, "recipe-cooking", RECIPE_LABELS.cookingHeading],
        ].map(
          ([md, sectionClass, heading]) =>
            md && (
              <section key={sectionClass} className={sectionClass}>
                <h2>{heading}</h2>
                {recipeHtml(md)}
              </section>
            )
        )}
        {trailing && recipeHtml(trailing)}
      </div>
    </div>
  );
}

RecipeMarkdownView.propTypes = {
  markdown: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default RecipeMarkdownView;
