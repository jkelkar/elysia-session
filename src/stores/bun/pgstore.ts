import { Store } from "../../store";
import { SessionData, SessionPayload } from "../../session";
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

  constructor(connStr: ConnectionParameters, tableName: string) {
    this.connectionString = connStr;
    let PGPool = pg.Pool;
    this.pool = new PGPool(this.connectionString);
    this.tableName = tableName;

    // this.pool.on("error", (err, client) => {
    //   console.error("Error:", err);
    // });

    this.init();
    // let stmt = `CREATE TABLE IF NOT EXISTS ${this.tableName} (id varchar() PRIMARY KEY, data TEXT)`;
    // console.log("Statement:", stmt);
    // // this.db.execute(stmt)
  }

  async run(qry: Query) {
    return this.pool
      .query(qry.text, qry.values)
      .then((res: QueryArrayResult) => {
        // console.log('user:', res.rows[0])
        try {
          return res.rows;
        } catch (e) {
          return res;
        }
      })
      .catch((e: Error) => {
        console.log(e.stack);
      });
  }

  async init() {
    let stmt = `CREATE TABLE IF NOT EXISTS ${this.tableName} 
    (id varchar(40) PRIMARY KEY, expire varchar(40), userid integer, username varchar(30), data json)`;
    console.log("Statement:", stmt);
    await this.run({ text: stmt });
  }

  async getSession(id: string | undefined, ctx?: Context): Promise<any> {
    if (!id) return null;
    let qry: Query = {
      text: `select * from ${this.tableName} where id=$1`,
      values: [id],
    };
    // console.log("getSession:", qry)
    // let result = await
    let cache = await this.run(qry);
    if (cache.length > 0) return cache[0];
    else return null;
  }

  async createSession(
    id: string | undefined,
    sess: SessionData,
    ctx?: Context
  ): Promise<any> {
    let qry: Query;
    let out = await this.getSession(id);
    // console.log("out:", out);
    if (out.length === 0) {
      qry = {
        text: `insert into ${this.tableName} (id, expire, userid, username, data) VALUES ($1, $2, $3, $4, $5)`,
        values: [id, sess.expire, sess.userid, sess.username, sess.data],
      };
      // console.log("createSession1:", qry);
      return this.run(qry); // this.sql`${query}`;
    } else {
      // FIXME
      qry = {
        text: `update ${this.tableName} set data=$1 , expire= $2, where id=$2`,
        values: [sess.data, sess.expire, id],
      };
      // console.log("createSession2:", qry);
      // return this.sql`${query}`;
      return this.run(qry);
    }
  }

  async deleteSession(id: string | undefined, ctx?: Context): Promise<any> {
    // Delete the session with this id
    if (!id) return;
    let qry: Query;
    qry = {
      text: `delete from ${this.tableName} where id=$1`,
      values: [id],
    };
    // console.log("deleteSession:", qry);
    return this.run(qry); // sql`${query}`
  }

  async deleteExpiredSessions(ts: string): Promise<any> {
    // delete all sessions with expiry before or at ts
    let qry: Query;
    qry = {
      text: `delete from ${this.tableName} where expire <= $1`,
      values: [ts],
    };
    // console.log("deleteSession:", qry);
    return this.run(qry); // sql`${query}`
  }

  async deleteUserSessions(
    // delete all sessions for this userid or username
    userid?: number | null,
    username?: string | null
  ): Promise<any> {
    let qry: Query = { text: "", values: [] };
    if (userid && userid > 0) {
      qry.text = `delete from ${this.tableName} where userid = $1`;
      qry.values = [userid];
      return this.run(qry);
    } else if (username && username.length) {
      qry.text = `delete from ${this.tableName} where username = $1`;
      qry.values = [username];
      return this.run(qry);
    }
  }

  async persistSession(
    id: string | undefined,
    sess: SessionData,
    ctx?: Context | {
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
    // persist this session
    // Same at update the data and expiry for this session
    if (!id) return;
    let qry: Query;
    qry = {
      text: `update ${this.tableName} set data=$1, expire=$2 where id=$3`,
      values: [sess.data, sess.expire, id],
    };
    // console.log("persistSession:", qry);
    return this.run(qry);
  }
}
