const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const llamaConfigPath = path.join(__dirname, "llamaConfig.json");
const ollamaConfigPath = path.join(__dirname, "ollamaConfig.json");
const generalConfigPath = path.join(__dirname, "generalConfig.json");
const startFilePathNode = path.join(__dirname, "../start.js");
const startFilePathPy = path.join(__dirname, "../start.py");

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
  if (fs.existsSync(startFilePathPy)) {
    fs.unlinkSync(startFilePathPy);
    console.log("start.py has been removed.");
  }
}

async function checkAndInstallPython() {
  console.log("Checking if Python is installed...");

  return new Promise((resolve, reject) => {
    exec("python --version", (error, stdout, stderr) => {
      if (!error) {
        console.log(`Python found: ${stdout.trim()}`);
        resolve(true);
        return;
      }

      console.log("Python is not installed. Attempting to install...");
      const platform = process.platform;

      let installCommand;
      if (platform === "win32") {
        installCommand = "winget install -e --id Python.Python.3";
      } else if (platform === "darwin") {
        installCommand = "brew install python";
      } else if (platform === "linux") {
        installCommand = "sudo apt update && sudo apt install -y python3";
      } else {
        console.error("Unsupported OS. Please install Python manually.");
        resolve(false);
        return;
      }

      exec(installCommand, (installErr, stdout, stderr) => {
        if (installErr) {
          console.error("Failed to install Python:", stderr.trim());
          resolve(false);
        } else {
          console.log("Python installed successfully.");
          resolve(true);
        }
      });
    });
  });
}

async function ollamaSetup() {
  const pythonInstalled = await checkAndInstallPython();
  if (!pythonInstalled) return;

  // ** This is an example of writing an input to the ollama config file if neccessary. **
  // const test = await showInput("Field: ");
  // fs.writeFileSync(ollamaConfigPath, JSON.stringify({ test }), "utf8");

  deleteStart();
}

async function llamaSetup() {
  // ** This is an example of writing an input to the llama config file if neccessary. **
  // const test = await showInput("Field: ");
  // fs.writeFileSync(llamaConfigPath, JSON.stringify({ test }), "utf8");

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

  const selected = await showSelector(
    ["llama", "ollama"],
    "Select what you run your LLM's on."
  );

  if (selected === "llama") {
    await llamaSetup();
  } else if (selected === "ollama") {
    await ollamaSetup();
  }
}

init().catch((err) => console.error("Error during setup:", err));
