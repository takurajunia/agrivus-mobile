const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-module-scripts",
  "package.json"
);

try {
  if (!fs.existsSync(packageJsonPath)) {
    process.exit(0);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const exportsField = packageJson.exports || {};

  if (exportsField["./tsconfig.base"] !== "./tsconfig.base.json") {
    exportsField["./tsconfig.base"] = "./tsconfig.base.json";
    packageJson.exports = exportsField;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
  }
} catch (error) {
  console.warn("postinstall patch skipped:", error.message);
}
