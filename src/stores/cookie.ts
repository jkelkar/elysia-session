import { Cookie, CookieOptions } from "elysia/dist/cookies";
import { Context } from "elysia";
import { Store } from "../store"
import { SessionData } from "../session";

interface CookieStoreOptions {
    cookieOptions?: CookieOptions;
    cookieName?: string;
}

export class CookieStore implements Store {
  private options: CookieStoreOptions;
  constructor(options?: CookieStoreOptions) {
    this.options = options || {
      cookieName: "session",
    };
  }

  getSession(id?: string | undefined, ctx?: Context) {
    const cookie = ctx?.cookie[this.options.cookieName!];
    return cookie ? (JSON.parse(cookie.value || '') as SessionData) : null;
  }

  createSession(
    id: string,
    sess: SessionData,
    ctx?: Context
  ): void | Promise<void> {
    ctx?.cookie[this.options.cookieName!].set({
      value: JSON.stringify(sess),
      ...this.options.cookieOptions,
    });
  }

  deleteSession(id: string, ctx?: Context): void | Promise<void> {
    delete ctx?.cookie[this.options.cookieName!];
  }

  persistSession(
    id: string | undefined,
    data: SessionData,
    ctx?: Context
  ): void | Promise<void> {
    ctx?.cookie[this.options.cookieName!].set({
      value: JSON.stringify(data),
      ...this.options.cookieOptions,
    });
  }

  deleteExpiredSessions(ts: string | null | undefined): Promise<void> | void {
      
  }

  deleteUserSessions(userid?: number | null, username?: string | null): Promise<void> | void {
      
  }
}
