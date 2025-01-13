const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");

const llamaConfigPath = path.join(__dirname, "llamaConfig.json");
const ollamaConfigPath = path.join(__dirname, "ollamaConfig.json");
const promptPath = path.join(__dirname, "prompt.json");

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

//This creates and writes the config file for the **ollama** bot.
async function ollamaSetup() {
  await showInput(
    "Please enter your bot token from discord, this is stored locally for security: "
  ).then((input) => {
    const botToken = input;
    fs.writeFileSync(ollamaConfigPath, JSON.stringify({ botToken }), "utf8");
  });
  await showInput(
    "Please enter your prompt for your bot. (Also stored locally): "
  ).then((input) => {
    const prompt = input;
    fs.writeFileSync(promptPath, JSON.stringify({ prompt }), "utf8");
  });
}

//This creates and writes the config file for the **llama** bot.
async function llamaSetup() {
  await showInput(
    "Please enter your bot token from discord, this is stored locally for security: "
  ).then((input) => {
    const botToken = input;
    fs.writeFileSync(llamaConfigPath, JSON.stringify({ botToken }), "utf8");
  });
  await showInput(
    "Please enter your prompt for your bot. (Also stored locally): "
  ).then((input) => {
    const prompt = input;
    fs.writeFileSync(promptPath, JSON.stringify({ prompt }), "utf8");
  });
}

//Asks which system the user is using to run the LLM's.
console.log("Welcome to the setup wizard!");
showSelector(["llama", "ollama"], "Select what you run your LLM's on.").then(
  (selected) => {
    if (selected === "llama") {
      llamaSetup();
    } else if (selected === "ollama") {
      ollamaSetup();
    }
  }
);
