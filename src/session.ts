// interface SessionDataEntry {
//   value: unknown;
//   flash: boolean;
// }

export interface SessionData {
  _data: Record<string, unknown>; // SessionDataEntry>;
  _expire: string | null;
  _delete: boolean;
  _accessed: string | null;
}
// export interface Obj {
//   [key: string]: string | undefined
// }

export class Session {
  private _cache: SessionData;
  constructor() {
    this._cache = {
      _data: {},
      _expire: null,
      _delete: false,
      _accessed: null,
    };
  }

  setCache(cache: SessionData) {
    console.log("Cache:", cache);
    this._cache = cache;
    for (const prop in this._cache._data) {
      (<any>this)[prop] = this._cache._data[prop];
    }
    console.log("sc:", this);
  }

  getCache(): SessionData {
    console.log("Session:", Object.keys(this));
    for (const prop in this) {
      // console.log('Prop:', prop)
      if (prop !== "_cache" && typeof (<any>this)[prop] !== "function") {
        console.log("X:", prop, typeof (<any>this)[prop], (<any>this)[prop]);
        this._cache._data[prop] = (<any>this)[prop];
        console.log("gc, data:", this._cache._data);
      }
    }
    return this._cache;
  }

  setExpire(expiration: string) {
    this._cache._expire = expiration;
  }

  reUpdate(expiration?: number | null) {
    if (expiration)
      this.setExpire(new Date(Date.now() + expiration * 1000).toISOString());
  }

  delete() {
    this._cache._delete = true;
  }

  valid() {
    return (
      this._cache._expire === null ||
      new Date(this._cache._expire).getTime() > Date.now()
    );
  }

  updateAccessed() {
    this._cache._accessed = new Date().toISOString();
  }

  get(key: string) {
    const entry = this._cache._data[key];
    if (!entry) return null;
    const value = entry; // .value;
    // if (entry.flash) delete this._cache._data[key];
    return value;
  }

  set(key: string, value: unknown) {
    this._cache._data[key] = value;
    // {
    //   value,
    //   flash: false,
    // };
  }

  // flash(key: string, value: unknown) {
  //   this._cache._data[key] = {
  //     value,
  //     flash: true,
  //   };
  // }
}
