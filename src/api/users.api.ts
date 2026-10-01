import type { APIRequestContext, APIResponse } from "@playwright/test";
import type { NewUser, LoginCredentials } from "./types";

export class UsersApi {
  constructor(private readonly request: APIRequestContext) {}

  register(user: NewUser): Promise<APIResponse> {
    return this.request.post("/api/users", { data: { user } });
  }

  login(credentials: LoginCredentials): Promise<APIResponse> {
    return this.request.post("/api/users/login", {
      data: { user: credentials },
    });
  }

  current(token?: string): Promise<APIResponse> {
    return this.request.get("/api/user", {
      headers: token ? { Authorization: `Token ${token}` } : undefined,
    });
  }
}
