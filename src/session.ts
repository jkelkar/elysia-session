
/*
  This is the enhanced version of session where all sessions for a particular user can be removed at once.
  This also allows deleting sessions where they have expired.
*/

export interface SessionPayload {
  [key:string]: any 
}

export interface SessionData {
  data: SessionPayload,
  username: string,
  userid: number,
  expire: string,
  // delete: boolean,
  // accessed: string
}

export class Session {
  private _cache: SessionData;

  constructor() {
    this._cache = {
      data: {},
      username: '',
      userid: 0,
      expire: '',
      // delete: false,
      // accessed: '',
    };
  }

  loadCache(cache: SessionData|undefined) {
    if (cache) {
      this._cache = cache
    }
  }

  setCache(cache: SessionPayload, userid?: number, username?: string) {
    this._cache.data = cache;
    this._cache.username = username || ''
    this._cache.userid = userid || 0
  }

  getCache(): SessionData {
    return this._cache;
  }

  setExpire(expiration: string) {
    this._cache.expire = expiration;
  }

  getExpiry(expirationSecs: number) : string | null | undefined{
    let ts : string
     if (expirationSecs) {
       ts =  new Date(Date.now() + expirationSecs * 1000).toISOString()
     } else {
      ts = new Date(Date.now()).toISOString();
     }
     return ts
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

  // updateAccessed() {
  //   this._cache.accessed = new Date().toISOString();
  // }

  /*
  // why dont we just expose _data as session??
  get(key: string) {
    const entry = this._cache._data[key];
    if (!entry) return null;
    const value = entry; 
    return value;
  }

  set(key: string, value: unknown) {
    this._cache._data[key] = value;
  }
    */
}
