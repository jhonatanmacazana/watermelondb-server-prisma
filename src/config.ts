import accessEnv from "./lib/accessEnv";

export const PORT = parseInt(accessEnv("PORT", "5000"), 10);
