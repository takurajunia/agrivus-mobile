const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-module-scripts",
  "package.json"
);

const linearGradientTsconfigPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-linear-gradient",
  "tsconfig.json"
);

try {
  // Patch expo-module-scripts export map (needed by some tooling).
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const exportsField = packageJson.exports || {};

    if (exportsField["./tsconfig.base"] !== "./tsconfig.base.json") {
      exportsField["./tsconfig.base"] = "./tsconfig.base.json";
      packageJson.exports = exportsField;
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + "\n"
      );
    }
  }

  // Silence TS config diagnostics inside expo-linear-gradient when opened in the editor.
  if (fs.existsSync(linearGradientTsconfigPath)) {
    const tsconfigRaw = fs.readFileSync(linearGradientTsconfigPath, "utf8");

    if (!tsconfigRaw.includes('"rootDir"')) {
      let patched = tsconfigRaw.replace(
        '"outDir": "./build"',
        '"outDir": "./build",\n    "rootDir": "./src"'
      );

      if (patched === tsconfigRaw) {
        patched = tsconfigRaw.replace(
          /("compilerOptions"\s*:\s*\{)/,
          '$1\n    "rootDir": "./src",'
        );
      }

      if (patched !== tsconfigRaw) {
        fs.writeFileSync(linearGradientTsconfigPath, patched);
      }
    }
  }
} catch (error) {
  console.warn("postinstall patch skipped:", error.message);
}
