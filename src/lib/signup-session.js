export function isDuplicateEmailError(result) {
  return (
    result?.error?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
  );
}

export function getNewlyRegisteredUser(result, email) {
  const user = result?.data?.user;
  const normalizedEmail = email.trim().toLowerCase();

  if (
    result?.error ||
    typeof result?.data?.token !== "string" ||
    !result.data.token ||
    typeof user?.id !== "string" ||
    !user.id ||
    typeof user.email !== "string" ||
    user.email.toLowerCase() !== normalizedEmail
  ) {
    return null;
  }

  return user;
}

export function isAuthenticatedAsNewSignup(sessionResult, registeredUser) {
  const sessionUser = sessionResult?.data?.user;

  return Boolean(
    registeredUser &&
      !sessionResult?.error &&
      sessionUser?.id === registeredUser.id &&
      typeof sessionUser.email === "string" &&
      sessionUser.email.toLowerCase() === registeredUser.email.toLowerCase(),
  );
}
