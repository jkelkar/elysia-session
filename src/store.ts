import { SessionData } from "./session";
import { Context } from "elysia";

export interface Store {
  getSession(
    id: string | undefined,
    ctx?: Context
  ): SessionData | null | undefined | Promise<SessionData | null | undefined>;
  createSession(
    id: string | undefined,
    data: SessionData,
    ctx?: Context
  ): Promise<void> | void;
  persistSession(
    id: string | undefined,
    data: SessionData,
    ctx?: Context
  ): Promise<void> | void;
  deleteSession(sid: string | undefined, ctx?: Context): Promise<void> | void;
  deleteExpiredSessions(ts: string | null | undefined): Promise<void> | void;
  deleteUserSessions(
    userid?: number | null,
    username?: string | null
  ): Promise<void> | void;
}
