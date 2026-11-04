const RETURN_TO_ORIGIN = "https://studiospace.invalid";

export function getSafeReturnTo(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return "/";
  }

  try {
    const destination = new URL(value, RETURN_TO_ORIGIN);
    return destination.origin === RETURN_TO_ORIGIN ? value : "/";
  } catch {
    return "/";
  }
}
