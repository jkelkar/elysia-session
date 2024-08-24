import { Store } from "../../store";
import { SessionData, SessionPayload } from "../../session";
import { Database } from "bun:sqlite";


export interface SqliteData {
  id: string,
  data: SessionPayload,
  username: string,
  userid: number,
  expire: string
}

export class BunSQLiteStore implements Store {
  private db: Database;
  private tableName: string;

  constructor(db: Database, tableName: string) {
    this.db = db;
    this.tableName = tableName;
    this.db
      .query(
        `CREATE TABLE IF NOT EXISTS ${this.tableName} 
          (id varchar(40) PRIMARY KEY, expire varchar(40), userid integer, username varchar(30), data text)`
        // Sqlite does not have a native JSON data type, we need to use data type text
      )
      .run();
  }

  async getSession(id: string | undefined): Promise<any> {
    if (!id) return null;
    const query = this.db.query(
      `SELECT id, expire, userid, username, data FROM ${this.tableName} WHERE id = $id`
    );
    const result = await query.get({ $id: id });
    if (!result) {
      return null;
    } else {
      // @ts-expect-error - data property is not defined in type
      result.data = JSON.parse(result.data);
      return result;
    } 
  }

  async createSession(
    id: string | undefined,
    sess: SessionData
  ): Promise<any> {
    let query;
    if (!id) {
      throw new Error("Parameter has no value");
    }
    try {
      query = this.db.query(
        `INSERT INTO ${this.tableName} (id, expire, userid, username, data) VALUES ($id, $expire, $userid, $username, $data)`
      );
      return query.run({
        $id: id,
        $expire: sess.expire,
        $userid: sess.userid,
        $username: sess.username,
        $data: JSON.stringify(sess.data),
      });
    } catch (e) {
      query = this.db.query(
        `UPDATE ${this.tableName} SET data = $data, expire = $expire WHERE id = $id`
      );
      return query.run({
        $id: id,
        $expire: sess.expire,
        $data: JSON.stringify(sess.data),
      });
    }
  }

  async deleteSession(id?: string | undefined): Promise<any> {
    if (!id) return;
    const query = this.db.query(`DELETE FROM ${this.tableName} WHERE id = $id`);
    return query.run({ $id: id });
  }

  async deleteExpiredSessions(ts: string | null | undefined): Promise<any> {
    if (ts) {
      const query = this.db.query(`delete from ${this.tableName} where expire <= $ts`);
      return query.run({ $ts: ts });
    }
  }

  async deleteUserSessions(
    userid?: number | null,
    username?: string | null
  ): Promise<any> {
    let query;
    if (userid && userid > 0) {
      query = this.db.query(
        `delete from ${this.tableName} where userid = $userid`
      );
      return query.run({ $userid: userid });
    } else if (username && username.length) {
      query = this.db.query(
        `delete from ${this.tableName} where username = $username`
      );
      return query.run({ $username: username });
    }
  }

  async persistSession(
    id: string | undefined,
    sess: SessionData
    /*
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
      */
  ): Promise<any> {
    // void | Promise<void> {
    if (!id) return;
    const query = this.db.query(
      `UPDATE ${this.tableName} SET data = $data, expire = $expire WHERE id = $id`
    );
    return query.run({
      $id: id,
      $expire: sess.expire,
      $data: JSON.stringify(sess.data),
    });
  }
}
