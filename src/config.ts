import accessEnv from "./lib/accessEnv";

export const PORT = parseInt(accessEnv("PORT", "9000"), 10);
