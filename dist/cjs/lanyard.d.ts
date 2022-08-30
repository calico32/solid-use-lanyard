import { Accessor } from 'solid-js';
import { Presence, PresenceWithId, Snowflake } from './types';
export declare const appAssetUrl: (applicationId?: string, assetId?: string, type?: string) => string | undefined;
export declare const userAvatarUrl: (userId: string, type?: string) => string;
interface RestOpts {
    type: 'rest';
    id: Snowflake;
}
interface RestRefreshOpts extends RestOpts {
    /**
     * Time interval, in milliseconds, between data fetches. Defaults to no interval (single fetch only).
     */
    refreshInterval: number;
}
interface SocketOpts {
    type?: 'socket';
    id: Snowflake;
}
interface SocketMultiIdOpts<T extends readonly string[] = readonly string[]> {
    type?: 'socket';
    ids: T;
}
interface SocketAllOpts {
    type?: 'socket';
    all: true;
}
declare type LanyardOpts = RestOpts | RestRefreshOpts | SocketOpts | SocketMultiIdOpts | SocketAllOpts | string;
interface RestRefreshClient<T> {
    (): T;
    presence: () => T;
    cancel(): void;
}
interface SocketClient<T> {
    (): T;
    presence: () => T;
    close: () => void;
    closed: () => boolean;
}
interface LatestUpdate {
    latestUpdate: Accessor<PresenceWithId | undefined>;
}
declare type LanyardClient<T extends LanyardOpts> = T extends RestRefreshOpts ? RestRefreshClient<Presence | undefined> : T extends RestOpts ? Accessor<Presence | undefined> : T extends SocketOpts | string ? SocketClient<Presence | undefined> : T extends SocketMultiIdOpts<infer U> ? SocketClient<{
    [key in U[number]]: Presence;
}> & LatestUpdate : T extends SocketAllOpts ? SocketClient<{
    [key: Snowflake]: Presence;
}> & LatestUpdate : never;
declare function useLanyard<T extends LanyardOpts>(opts: T): LanyardClient<T>;
export default useLanyard;
export * from './types';
