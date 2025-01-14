const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const { exec, execSync } = require("child_process");

const llamaConfigPath = path.join(__dirname, "llamaConfig.json");
const ollamaConfigPath = path.join(__dirname, "ollamaConfig.json");
const generalConfigPath = path.join(__dirname, "generalConfig.json");
const pyRequirementsPath = path.join(__dirname, "requirements.txt");
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
  console.log("Setup complete.");
}

async function installPython() {
  const platform = process.platform;

  let installCommand;
  if (platform === "win32") {
    installCommand = "winget install -e --id Python.Python.3 --version 3.11";
  } else if (platform === "darwin") {
    installCommand = "brew install python@3.11";
  } else if (platform === "linux") {
    installCommand = "sudo apt update && sudo apt install -y python3.11";
  } else {
    console.error("Unsupported OS. Please install Python 3.11 manually.");
    return false;
  }

  return new Promise((resolve, reject) => {
    exec(installCommand, (installErr, stdout, stderr) => {
      if (installErr) {
        console.error("Failed to install Python:", stderr.trim());
        reject(stderr);
      } else {
        console.log("Python installed successfully.");
        resolve(true);
      }
    });
  }).catch((error) => {
    console.error("Error during Python installation:", error);
    return false;
  });
}

async function checkPython() {
  console.log("Checking if Python is installed...");

  return new Promise((resolve) => {
    exec("python --version", async (error, stdout) => {
      if (!error) {
        console.log(`Python found: ${stdout.trim()}`);
        const versionOutput = stdout.trim();
        const match = versionOutput.match(/Python (\d+)\.(\d+)\.(\d+)/);
        if (match) {
          const major = parseInt(match[1], 10);
          const minor = parseInt(match[2], 10);

          if (major !== 3 || minor > 11) {
            console.error(
              "Ollama runs into issues with versions above Python 3.11. Please install Python 3.11."
            );
            resolve(false);
          } else {
            resolve(true);
          }
        }
      } else {
        console.log("Python is not installed. Attempting to install...");
        await installPython().catch(() => resolve(false));
        resolve(true);
      }
    });
  });
}

async function ollamaSetup(botToken) {
  const pythonInstalled = await checkPython();
  if (!pythonInstalled) return;

  console.log("Installing Python requirements...");
  execSync(`pip install -r ${pyRequirementsPath}`, { stdio: "inherit" });

  fs.writeFileSync(ollamaConfigPath, JSON.stringify({ botToken }), "utf8");

  deleteStart();
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

  const selected = await showSelector(
    ["llama", "ollama"],
    "Select what you run your LLM's on."
  );

  if (selected === "llama") {
    await llamaSetup();
  } else if (selected === "ollama") {
    await ollamaSetup(botToken);
  }
}

init().catch((err) => console.error("Error during setup:", err));
