import { connection } from "next/server";
import { createGoogleProviderReadinessResponse } from "@/lib/google-provider-readiness.mjs";

export async function GET() {
  await connection();
  return createGoogleProviderReadinessResponse(process.env);
}
