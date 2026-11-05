export function isGoogleProviderConfigured(clientId, clientSecret) {
  return (
    typeof clientId === "string" &&
    clientId.trim().length > 0 &&
    typeof clientSecret === "string" &&
    clientSecret.trim().length > 0
  );
}

export function getGoogleProviderReadiness(environment) {
  return {
    configured: isGoogleProviderConfigured(
      environment.GOOGLE_CLIENT_ID,
      environment.GOOGLE_CLIENT_SECRET,
    ),
  };
}

export function createGoogleProviderReadinessResponse(environment) {
  return Response.json(getGoogleProviderReadiness(environment), {
    headers: { "Cache-Control": "no-store" },
  });
}
