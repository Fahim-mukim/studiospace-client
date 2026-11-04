import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

let handlersPromise;

async function getHandlers() {
  if (!handlersPromise) {
    handlersPromise = getAuth().then((auth) => toNextJsHandler(auth));
  }
  try {
    return await handlersPromise;
  } catch (error) {
    handlersPromise = undefined;
    throw error;
  }
}

export async function GET(request) {
  return (await getHandlers()).GET(request);
}

export async function POST(request) {
  return (await getHandlers()).POST(request);
}
