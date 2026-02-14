import { createAuthClient } from "better-auth/client";
import { jwtClient } from "better-auth/client/plugins";
import { usernameClient } from "better-auth/client/plugins";
import { getAuthServiceUrl } from "../utils/auth-url";

export const authClient = createAuthClient({
  baseURL: getAuthServiceUrl(),
  plugins: [jwtClient(), usernameClient()],
});
