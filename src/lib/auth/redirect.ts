export type AuthRedirect =
  | { kind: "code"; code: string; flowId?: string }
  | { kind: "email"; tokenHash: string; type: "email" | "signup" | "recovery" };

// Only our exact callback is accepted; a query parameter cannot choose the next screen
export function parseAuthRedirect(
  rawUrl: string,
  expectedUrl: string,
): AuthRedirect {
  const url = new URL(rawUrl);
  const expected = new URL(expectedUrl);

  if (
    url.protocol !== expected.protocol ||
    url.host !== expected.host ||
    url.pathname !== expected.pathname ||
    url.username ||
    url.password
  ) {
    throw new Error("This sign-in link does not belong to Auxly.");
  }

  if (url.searchParams.has("error") || url.searchParams.has("error_code")) {
    throw new Error("Sign-in was not completed. Please try again.");
  }

  // Do not accept implicit-flow access tokens from a URL.
  if (url.hash)
    throw new Error("This sign-in link is not supported. Request a new one.");

  for (const name of ["code", "sb_flow_id", "token_hash", "type"]) {
    if (url.searchParams.getAll(name).length > 1)
      throw new Error("This sign-in link is invalid.");
  }

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const flowId = url.searchParams.get("sb_flow_id") || undefined;

  if (code && !tokenHash) {
    if (
      code.length > 4096 ||
      (flowId && !/^[a-zA-Z0-9_-]{1,128}$/.test(flowId))
    ) {
      throw new Error("This sign-in link is invalid.");
    }
    // Recovery is determined by Supabase's verified exchange, never ?type=recovery.
    return { kind: "code", code, flowId };
  }

  const type = url.searchParams.get("type");
  if (
    !code &&
    tokenHash &&
    tokenHash.length <= 4096 &&
    (type === "email" || type === "signup" || type === "recovery")
  ) {
    return { kind: "email", tokenHash, type };
  }

  throw new Error(
    "This sign-in link is incomplete or expired. Request a new one.",
  );
}
