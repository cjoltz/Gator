import { handlerAgg } from "./aggregator.js";
import {
  type CommandsRegistry,
  registerCommand,
  runCommand,
} from "./commands.js";
import {
  handlerLogin,
  handlerRegister,
  handlerReset,
  handlerUsers,
} from "./users.js";

async function main() {
  // Process user input command and args
  const inputs: string[] = process.argv.slice(2);
  if (inputs.length < 1) {
    console.error("No command specified");
    process.exit(1);
  }
  const cmdName = inputs[0];
  const args = inputs.slice(1);

  // Register Commands
  const commands: CommandsRegistry = {};
  registerCommand(commands, "login", handlerLogin);
  registerCommand(commands, "register", handlerRegister);
  registerCommand(commands, "reset", handlerReset);
  registerCommand(commands, "users", handlerUsers);
  registerCommand(commands, "agg", handlerAgg);

  // Run command
  try {
    await runCommand(commands, cmdName, ...args);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error running command ${cmdName}: ${err.message}`);
    } else {
      console.error(`Error running command ${cmdName}: ${err}`);
    }
    process.exit(1);
  }
  process.exit(0);
}

main();
