import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

export function setUser(user: string) {
  const cfg = readConfig();
  cfg.currentUserName = user;
  writeConfig(cfg);
}

export function readConfig(): Config {
  const filePath = getConfigFilePath();
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(data);
    return validateConfig(json);
  } catch (err) {
    throw new Error(`Failed to read config file at ${filePath}.`, {
      cause: err,
    });
  }
}

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
  const content = JSON.stringify(
    { db_url: cfg.dbUrl, current_user_name: cfg.currentUserName },
    null,
    2,
  );
  try {
    fs.writeFileSync(getConfigFilePath(), content);
  } catch (err) {
    throw new Error(`Failed to write to config file`, { cause: err });
  }
}

function validateConfig(rawConfig: any): Config {
  // Check isn't null nor an array, and is an object
  const isObject =
    typeof rawConfig === "object" &&
    rawConfig !== null &&
    !Array.isArray(rawConfig);
  if (!isObject) {
    throw new Error("Config file must contain a JSON object");
  }
  // Check dbURL and currentUserName
  const dbUrl = rawConfig["db_url"];
  if (dbUrl === "" || typeof dbUrl !== "string") {
    throw new Error("Invalid db_url found in config file");
  }
  const currentUserName = rawConfig["current_user_name"] ?? "";
  if (typeof currentUserName !== "string") {
    throw new Error("Invalid current_user_name found in config file");
  }
  return {
    dbUrl,
    currentUserName,
  };
}
