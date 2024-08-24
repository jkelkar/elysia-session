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
      const store = options.store
      const sess = new Session()
      const cookieName = options.cookieName || "session"
      const cookie = ctx.cookie[cookieName]
      let sid: string | undefined= ''
      let session: SessionData | undefined | null
      let sd: SessionData | null |undefined
      let createRequired = false

      // first clear all expired sessions
      const expireTS: string|null |undefined = sess.getExpiry(options.expireAfter)
      await store.deleteExpiredSessions(expireTS)

      if (cookie) {
        sid = cookie.value;
        // cookie.set({
        //   ...options.cookieOptions,
        // });
        try {
          sd = await store.getSession(sid) // as SessionData;
          // console.log('sd:', sd)
          if (sd) {
            session = sd
          } else {
            createRequired = true
          }
          // session = JSON.parse(sd[0]) // .data);
          // console.log('session:', session)
        } catch {
          createRequired = true;
        }

        if (session != undefined) {
          // can also save userid and username - if we want to handle all sessions for a user, mainly for deletion
          sess.setCache(session);

          if (sess.valid()) {
            sess.reUpdate(options.expireAfter);
          } else {
            await store.deleteSession(sid);
            createRequired = true;
          }
        } else {
          createRequired = true;
        }
      } else {
        createRequired = true;
      }

      if (createRequired) {
        // const initialData : SessionData= {
        //   data: {},
        //   expire: '',
        //   userid: 0,
        //   username: '',
        //   // delete: false,
        //   // accessed: ''
        // };
        sid = cookie.value || nanoid(24);
        await store.createSession(sid, initialData);
        sess.setCache(initialData);
        session = initialData
      }

      if (!(store instanceof CookieStore)) {
        ctx.cookie[cookieName].set({
          value: sid,
          ...options.cookieOptions,
        });
      }

      await store.persistSession(sid, sess.getCache());
      session = await store.getSession(sid)

      if (!session) {
        session = initialData

        return {
          session: session
        }
      }
    })
    .onAfterResponse(async (ctx) => {
      const store = options.store;
      const sess = new Session() // ctx.session;
      const cookieName = options.cookieName || "session";
      const cookie = ctx.cookie[cookieName];
      let sid :any= "";
      sess.loadCache(ctx.session)
      if (cookie) {
        sid = cookie.value
        sess.reUpdate(options.expireAfter);
        await store.persistSession(sid, sess.getCache());
      }
    });
};
