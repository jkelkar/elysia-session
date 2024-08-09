import { Store } from "../../store";
import { SessionData } from "../../session";
import { Cookie, Context } from "elysia";

import pg, { QueryArrayResult } from "pg";
import { ConnectionParameters } from "postgres";

interface Query {
  text: string;
  values?: any[];
}
// Client.query(qry: Query) -> Promise<Result>
export class BunPGStore implements Store {
  private connectionString: ConnectionParameters;
  private tableName: string;
  private pool: any;

  constructor(cs: ConnectionParameters, tableName: string) {
    this.connectionString = cs;
    let PGPool = pg.Pool;
    this.pool = new PGPool(this.connectionString);
    this.tableName = tableName;
    this.init();
    // let stmt = `CREATE TABLE IF NOT EXISTS ${this.tableName} (id varchar() PRIMARY KEY, data TEXT)`;
    // console.log("Statement:", stmt);
    // // this.db.execute(stmt)
  }

  async init() {
    let stmt = `CREATE TABLE IF NOT EXISTS ${this.tableName} (id varchar() PRIMARY KEY, data TEXT)`;
    // console.log("Statement:", stmt);
    // this.db.execute(stmt);
    // await this.sql`${stmt}`
  }

  async run(qry: Query) {
    return this.pool
      .query(qry.text, qry.values)
      .then((res: QueryArrayResult) => {
        // console.log('user:', res.rows[0])
        return res.rows;
      })
      .catch((e: Error) => {
        console.log(e.stack);
      });
  }

  async getSession(id?: string | undefined, ctx?: Context): Promise<any> {
    if (!id) return null;
    let qry: Query = {
      text: `select * from ${this.tableName} where id=$1`,
      values: [id]
    }
    // console.log("getSession:", qry)
    // let result = await 
    return this.run(qry)
    // if (!result) return null;
    // // @ts -expect -errorx - data property is not defined in type
    // return JSON.parse(result[0].data) as SessionData;
  }

  async createSession(
    data: SessionData,
    id: string,
    ctx?: Context
  ): Promise<any> {
    let qry: Query;

    qry = {
      text: `select * from ${this.tableName} where id=$1`,
      values: [id],
    };
    // console.log("createSession1 TEST:", qry);
    let out = await this.run(qry);
    // console.log("out:", out);
    if (out.length === 0) {
      qry = {
        text: `insert into ${this.tableName} (id, data) VALUES ($1, $2)`,
        values: [id, data],
      };
      // console.log("createSession1:", qry);
      return this.run(qry); // this.sql`${query}`;
    } else {
      qry = {
        text: `update ${this.tableName} set data=$1 where id=$2`,
        values: [data, id],
      };
      // console.log("createSession2:", qry);
      // return this.sql`${query}`;
      return this.run(qry);
    }
  }

  async deleteSession(id?: string | undefined, ctx?: Context): Promise<any> {
    if (!id) return;
    let qry: Query;
    qry = {
      text: `delete from ${this.tableName} where id=$1`,
      values: [id],
    };
    // console.log("deleteSession:", qry);
    return this.run(qry); // sql`${query}`
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
    let qry: Query;
    qry = {
      text: `update ${this.tableName} set data=$1 where id=$2`,
      values: [data, id],
    };
    // console.log("persistSession:", qry);
    return this.run(qry);
  }
}
