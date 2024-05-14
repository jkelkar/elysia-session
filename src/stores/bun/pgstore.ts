import { Store } from "../../store";
import { SessionData } from "../../session";
// import { Database } from "bun:sqlite";
import { Cookie } from "elysia";
import { Context } from "elysia";

import { drizzle } from "drizzle-orm/postgres-js";
import {
  pgTable,
  serial,
  text
} from "drizzle-orm/pg-core";
import { eq, lt, gte, ne, sql } from "drizzle-orm";
import postgres from "postgres";

export class BunPGStore implements Store {
  private connectionString: string;
  private db: any;
  private tableName: string;
  private xtable: any;

  constructor(cs: string, tableName: string) {
    this.connectionString = cs;
    const queryClient = postgres(this.connectionString);
    this.db = drizzle(queryClient);
    this.tableName = tableName;
    this.xtable = pgTable(tableName, {
      id: serial("id").primaryKey(),
      data: text("data"),
    });
    this.db.execute(
      sql`CREATE TABLE IF NOT EXISTS ${this.tableName} (id TEXT PRIMARY KEY, data TEXT)`
    );
  }

  async getSession(id?: string | undefined, ctx?: Context): Promise<any> {
    if (!id) return null;
    const result = await this.db
      .select()
      .from(this.xtable)
      .where(eq(this.xtable.id, id));

    if (!result) return null;
    // @ts -expect -errorx - data property is not defined in type
    return JSON.parse(result.data) as SessionData;
  }

  async createSession(
    data: SessionData,
    id: string,
    ctx?: Context
  ): Promise<any> {
    let query;
    try {
      return this.db.insert(this.xtable).values({ id: id, data: data });
    } catch (e) {
      return this.db
        .update(this.xtable)
        .set({ data: data, id: id })
        .where(eq(this.xtable.id, id));
    }
  }

  async deleteSession(id?: string | undefined, ctx?: Context): Promise<any> {
    if (!id) return;
    return this.db.delete(this.xtable).where(eq(this.xtable.id, id));
  }

  async persistSession(
    data: SessionData,
    id?: string | undefined,
    ctx?:
      | {
          body: unknown;
          query: Record<string, string | null>;
          params: never;
          headers: Record<string, string | null>;
          cookie: Record<string, Cookie<any>>;
          set: {
            headers: Record<string, string> & {
              "Set-Cookie"?: string | string[] | undefined;
            };
            status?:
              | number
              | "Continue"
              | "Switching Protocols"
              | "Processing"
              | "Early Hints"
              | "OK"
              | "Created"
              | "Accepted"
              | "Non-Authoritative Information"
              | "No Content"
              | "Reset Content"
              | "Partial Content"
              | "Multi-Status"
              | "Already Reported"
              | "Multiple Choices"
              | "Moved Permanently"
              | "Found"
              | "See Other"
              | "Not Modified"
              | "Temporary Redirect"
              | "Permanent Redirect"
              | "Bad Request"
              | "Unauthorized"
              | "Payment Required"
              | "Forbidden"
              | "Not Found"
              | "Method Not Allowed"
              | "Not Acceptable"
              | "Proxy Authentication Required"
              | "Request Timeout"
              | "Conflict"
              | "Gone"
              | "Length Required"
              | "Precondition Failed"
              | "Payload Too Large"
              | "URI Too Long"
              | "Unsupported Media Type"
              | "Range Not Satisfiable"
              | "Expectation Failed"
              | "I'm a teapot"
              | "Misdirected Request"
              | "Unprocessable Content"
              | "Locked"
              | "Failed Dependency"
              | "Too Early"
              | "Upgrade Required"
              | "Precondition Required"
              | "Too Many Requests"
              | "Request Header Fields Too Large"
              | "Unavailable For Legal Reasons"
              | "Internal Server Error"
              | "Not Implemented"
              | "Bad Gateway"
              | "Service Unavailable"
              | "Gateway Timeout"
              | "HTTP Version Not Supported"
              | "Variant Also Negotiates"
              | "Insufficient Storage"
              | "Loop Detected"
              | "Not Extended"
              | "Network Authentication Required"
              | undefined;
            redirect?: string | undefined;
            cookie?:
              | Record<
                  string,
                  {
                    value: string;
                    domain?: string | undefined;
                    expires?: Date | undefined;
                    httpOnly?: boolean | undefined;
                    maxAge?: number | undefined;
                    path?: string | undefined;
                    priority?: "low" | "medium" | "high" | undefined;
                    sameSite?: boolean | "lax" | "strict" | "none" | undefined;
                    secure?: boolean | undefined;
                    secrets?: string | string[] | undefined;
                  }
                >
              | undefined;
          };
          path: string;
          request: Request;
          store: {};
        }
      | undefined
  ): Promise<any> {
    if (!id) return;
    return this.db
      .update(this.xtable)
      .set({ data: data })
      .where(eq(this.xtable.id, id));
  }
}
