const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");

const llamaConfigPath = path.join(__dirname, "llamaConfig.json");
const generalConfigPath = path.join(__dirname, "generalConfig.json");
const startFilePathNode = path.join(__dirname, "../start.js");

// Reusable terminal selector function
async function showSelector(options, message) {
  try {
    const prompt = inquirer.createPromptModule();
    const answer = await prompt([
      {
        type: "list",
        name: "selected",
        message: message,
        choices: options,
      },
    ]);
    return answer.selected;
  } catch (error) {
    console.log("Error while displaying selector: " + error);
    return null;
  }
}

// Reusable ask for input function
async function showInput(message) {
  try {
    const prompt = inquirer.createPromptModule();
    const answer = await prompt([
      {
        type: "input",
        name: "userInput",
        message: message,
      },
    ]);
    return answer.userInput;
  } catch (error) {
    console.log("Error while displaying input prompt: " + error);
    return null;
  }
}

function deleteStart() {
  if (fs.existsSync(startFilePathNode)) {
    fs.unlinkSync(startFilePathNode);
    console.log("start.js has been removed.");
  }

  console.log("Setup complete.");
}

async function llamaSetup() {
  deleteStart();
}

async function init() {
  console.log("Welcome to the setup wizard!");

  const model = await showInput("Path to LLM model path: ");
  const botToken = await showInput("Enter your Discord bot token: ");
  const prompt = await showInput("Enter your prompt for your bot: ");

  fs.writeFileSync(
    generalConfigPath,
    JSON.stringify({ prompt, model, botToken }),
    "utf8"
  );

  llamaSetup();
}

init().catch((err) => console.error("Error during setup:", err));
