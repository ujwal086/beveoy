export function isDatabaseConnectionError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  const code = "code" in error && typeof error.code === "string" ? error.code : "";

  return code === "P1001" || message.includes("Can't reach database server");
}
