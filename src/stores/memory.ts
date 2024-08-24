import { Store } from "../store";
import { SessionData } from "../session";

export class MemoryStore implements Store {
    private sessions: Map<string, SessionData>;

    constructor() {
        this.sessions = new Map();
    }

    getSession(id: string) {
        return this.sessions.has(id) ? this.sessions.get(id) : null;
    }

    createSession(id: string, data: SessionData): void | Promise<void> {
        this.sessions.set(id, data);
    }

    deleteSession(id: string): void | Promise<void> {
        this.sessions.delete(id);
    }

    persistSession(id: string, data: SessionData): void | Promise<void> {
        this.sessions.set(id, data);
    }

    deleteExpiredSessions(ts: string | null | undefined): Promise<void> | void {
        
    }

    deleteUserSessions(userid?: number | null, username?: string | null): Promise<void> | void {
        
    }
}
