import type Elysia from "elysia";
import { Store } from "./store";
import { Session, SessionData, SessionPayload } from "./session";
import { nanoid } from "nanoid";
import { CookieStore } from "./stores/cookie";
import { CookieOptions } from "elysia/dist/cookies";

export interface SessionOptions {
  store: Store;
  expireAfter: number;
  cookieName?: string;
  cookieOptions?: CookieOptions;
}

 const initialData : SessionData= {
    data : {},
    expire: '',
    userid: 0,
    username: '',
  };

export const sessionPlugin = (options: SessionOptions) => (app: Elysia) => {
  return app
    .derive(async (ctx) => {
      const store = options.store;
      const sess = new Session();
      const cookieName = options.cookieName || "session";
      const cookie = ctx.cookie[cookieName];
      let id: string | undefined= '';
      let session: SessionData | undefined | null;
      let sd: SessionData | null |undefined;
      let createRequired = false;

      // first clear all expired sessions
      const expireTS: string | null | undefined = sess.getExpiry();
      await store.deleteExpiredSessions(expireTS);

      if (cookie) {
        id = cookie.value;
        try {
          sd = await store.getSession(id) // as SessionData;
          if (sd) {
            session = sd;
          } else {
            createRequired = true;
          }
        } catch {
          createRequired = true;
        }

        if (session != undefined) {
          // can also save userid and username - if we want to handle all sessions for a user, mainly for deletion
          sess.setCache(session);

          if (sess.valid()) {
            sess.reUpdate(options.expireAfter);
          } else {
            await store.deleteSession(id);
            createRequired = true;
          }
        } else {
          createRequired = true;
        }
      } else {
        createRequired = true;
      }

      if (createRequired) {
        id = cookie.value || nanoid(24);
        await store.createSession(id, initialData);
        sess.setCache(initialData);
        session = initialData;
      }

      if (!(store instanceof CookieStore)) {
        ctx.cookie[cookieName].set({
          value: id,
          ...options.cookieOptions
        });
      }
      sess.reUpdate(options.expireAfter);
      await store.persistSession(id, sess.getCache());
      session = await store.getSession(id);

      if (!session) {
        session = initialData;
      }
      return {
        sessionData: session,
        session: session.data
      }
    })
    .onAfterResponse(async (ctx) => {
      const store = options.store;
      const sess = new Session() // ctx.session;
      const cookieName = options.cookieName || "session";
      const cookie = ctx.cookie[cookieName];
      let id :any= "";
      sess.loadCache(ctx.sessionData, ctx.session)
      if (cookie) {
        id = cookie.value;
        sess.reUpdate(options.expireAfter);
        await store.persistSession(id, sess.getCache());
      }
    });
};
