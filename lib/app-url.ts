export function resolveAppUrl(request?: Request) {
  const explicitUrl = process.env.CLIENT_URL?.trim();
  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }

  if (request) {
    const url = new URL(request.url);
    return url.origin;
  }

  return null;
}
