
/*
  This is the enhanced version of session where all sessions for a particular user can be removed at once.
  This also allows deleting sessions where they have expired.
*/
import {Context } from "elysia";

export interface SessionPayload {
  [key:string]: any 
}

export interface SessionData {
  data: SessionPayload,
  username: string,
  userid: number,
  expire: string,
}

export class Session {
  private _cache: SessionData;

  constructor() {
    this._cache = {
      data: {},
      username: '',
      userid: 0,
      expire: ''
    };
  }

  loadCache(cache: SessionData, data: SessionPayload) {
    this._cache = cache;
    Object.assign(this._cache.data, data);
  }

  setCache(cache: SessionData) {
    this._cache = cache;
  }

  getCache(): SessionData {
    return this._cache;
  }

  setExpire(expiration: string) {
    this._cache.expire = expiration;
  }

  getExpiry() : string | null | undefined{
    let ts : string;
    ts = new Date(Date.now()).toISOString();
    return ts;
  }

  reUpdate(expirationSecs: number | null) {
    if (expirationSecs)
      this.setExpire(new Date(Date.now() + expirationSecs * 1000).toISOString());
  }

  valid() {
    return (
      this._cache.expire === null ||
        new Date(this._cache.expire).getTime() > Date.now()
    );
  }

}
