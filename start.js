const { execSync } = require("child_process");

try {
  console.log("Checking modules...");

  execSync("npm install", { stdio: "inherit" });

  console.log("All modules present.");

  continueSetup();
} catch (error) {
  console.log("Error while installing modules: " + error);
}

function continueSetup() {
  console.log("Starting setup...");
  execSync("node src/setup.js", { stdio: "inherit" });
}
