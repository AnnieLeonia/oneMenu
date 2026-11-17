const fs = require("fs");
const path = require("path");

const VERIFY_DIR = path.resolve(__dirname, "../../../tmp/dish-verify");

function loadManifest() {
  const manifestPath = path.join(VERIFY_DIR, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return { dishes: [] };
  }
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function resolveVerifyFile(id) {
  const dishId = Number(id);
  if (!dishId) return null;

  const manifest = loadManifest();
  const fromManifest = (manifest.dishes || []).find((row) => row.id === dishId);
  if (fromManifest && fromManifest.file) {
    return fromManifest.file;
  }

  if (!fs.existsSync(VERIFY_DIR)) {
    return null;
  }

  const prefix = `${dishId}-`;
  const match = fs
    .readdirSync(VERIFY_DIR)
    .find((name) => name.endsWith(".md") && name.startsWith(prefix));
  return match || null;
}

function readVerifyMarkdown(id) {
  const file = resolveVerifyFile(id);
  if (!file) {
    return { file: null, markdown: null };
  }
  const filePath = path.join(VERIFY_DIR, file);
  if (!fs.existsSync(filePath)) {
    return { file, markdown: null };
  }
  return {
    file,
    markdown: fs.readFileSync(filePath, "utf8"),
  };
}

module.exports = {
  readVerifyMarkdown,
};
