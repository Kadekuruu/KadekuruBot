const { exec, execSync } = require("child_process");

const inquirer = require("inquirer");

async function init() {
  try {
    const prompt = inquirer.createPromptModule();
    const answer = await prompt([
      {
        type: "list",
        name: "selected",
        message: "What would you like to do?",
        choices: ["Run a Model.", "Run Setup.", "Exit."],
      },
    ]);
    if (answer.selected === "Exit.") {
      return;
    } else if (answer.selected === "Run Setup.") {
      console.log("Running setup...");
      execSync("node src/setup.js", { stdio: "inherit" });
    } else if (answer.selected === "Run a Model.") {
      const prompt = inquirer.createPromptModule();
      const modelChoice = await prompt([
        {
          type: "list",
          name: "selected",
          message: "Which service would you like to use?",
          choices: ["Llama", "Ollama", "Exit."],
        },
      ]);
      if (modelChoice.selected === "Exit.") {
        return;
      } else if (modelChoice.selected === "Llama") {
        exec("node src/llamaBuild.js", { stdio: "inherit" });
      } else if (modelChoice.selected === "Ollama") {
        exec("python src/ollamaBuild.py", { stdio: "inherit" });
      }
    }
  } catch (error) {
    console.log("Error while displaying selector: " + error);
    return null;
  }
}

init();
