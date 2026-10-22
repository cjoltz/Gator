import { setUser, readConfig } from "./config.js";
import {
  createUser,
  deleteAllUsers,
  getUserByName,
  getUserNames,
} from "./lib/db/queries/users.js";

// login as user
export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(
      "Login command expects a single argument specifying username",
    );
  }
  const user = await getUserByName(args[0]);
  if (user === undefined) {
    throw new Error(
      "User is not registered. To register a new user, use register <username>",
    );
  }
  setUser(user.name);
  console.log(`User ${args[0]} has been logged in for this session.`);
}

// register a new user
export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(
      "Register command expects a single arugment specifying username",
    );
  }
  const name = args[0];
  let user = await getUserByName(name);
  if (user !== undefined) {
    throw new Error(`User ${name} is already registered`);
  }
  user = await createUser(name);
  setUser(user.name);
  console.log(`User created succesfully: ${JSON.stringify(user)}`);
}

// reset user table in database WARNING: DESTRUCTIVE (NOT FOR PROD)
export async function handlerReset(cmdName: string, ...args: string[]) {
  try {
    await deleteAllUsers();
    console.log("All users deleted succesfully");
  } catch (err) {
    throw new Error(`Failed to reset database`, { cause: err });
  }
}

// List all users
export async function handlerUsers(cmdName: string, ...args: string[]) {
  const userNames = await getUserNames();
  const currentUser = readConfig().currentUserName;
  userNames.forEach((user) => {
    console.log(
      `* ${user.name} ${user.name === currentUser ? "(current)" : ""}`,
    );
  });
}
