var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createEffect, createSignal, onCleanup } from 'solid-js';
import { Opcode, } from './types';
const REST_URL = 'https://api.lanyard.rest/v1/users';
const SOCKET_URL = 'wss://api.lanyard.rest/socket';
const request = (url) => __awaiter(void 0, void 0, void 0, function* () {
    if ('fetch' in globalThis) {
        return globalThis.fetch(url).then((r) => r.json());
    }
    const { default: axios } = yield import('axios');
    const res = yield axios.get(url);
    return res.data;
});
export const appAssetUrl = (applicationId, assetId, type = 'webp') => {
    if (assetId.startsWith('mp:')) {
        return `https://media.discordapp.net/${assetId.slice(3)}`;
    }
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${assetId}.webp`;
};
export const userAvatarUrl = (userId, type = 'webp') => {
    return `https://api.lanyard.rest/${userId}.${type}`;
};
// function useLanyard(opts: RestOpts): LanyardClient<RestOpts>
// function useLanyard(opts: RestRefreshOpts): LanyardClient<RestRefreshOpts>
// function useLanyard(opts: SocketOpts): LanyardClient<SocketOpts>
// function useLanyard<T extends readonly string[]>(
//   opts: SocketMultiIdOpts<T>
// ): LanyardClient<SocketMultiIdOpts<T>>
// function useLanyard(opts: SocketAllOpts): LanyardClient<SocketAllOpts>
// function useLanyard(id: string): LanyardClient<string>
function useLanyard(opts) {
    const rest = (id, interval) => {
        const [presence, setPresence] = createSignal();
        let intervalId;
        const getPresence = () => __awaiter(this, void 0, void 0, function* () {
            request(`${REST_URL}/${id}`).then(({ data }) => {
                setPresence(Object.assign(Object.assign({}, data), { user_id: id }));
            });
        });
        getPresence();
        if (interval) {
            intervalId = setInterval(() => getPresence(), interval);
        }
        onCleanup(() => {
            clearInterval(intervalId);
        });
        if (interval) {
            const client = presence;
            client.cancel = () => {
                clearInterval(intervalId);
            };
            client.presence = presence;
            return client;
        }
        else {
            return presence;
        }
    };
    if (typeof opts === 'string') {
        opts = { type: 'socket', id: opts };
    }
    if (opts.type === 'rest') {
        return rest(opts.id, opts.refreshInterval);
    }
    const [heartbeat, setHeartbeat] = createSignal();
    const [closed, setClosed] = createSignal(false);
    const [presence, setPresence] = createSignal({}, { equals: false });
    const [socket, setSocket] = createSignal(new WebSocket(SOCKET_URL));
    const setEventListeners = (socket) => {
        socket.onopen = () => {
            const data = 'id' in opts
                ? { subscribe_to_id: opts.id }
                : 'ids' in opts
                    ? { subscribe_to_ids: [...opts.ids] }
                    : { subscribe_to_all: true };
            const message = {
                op: 2,
                d: data,
            };
            socket.send(JSON.stringify(message));
        };
        socket.onmessage = ({ data: payload }) => __awaiter(this, void 0, void 0, function* () {
            const message = JSON.parse(payload);
            switch (message.op) {
                case Opcode.Hello: {
                    const { heartbeat_interval } = message.d;
                    setHeartbeat(setInterval(() => {
                        const message = { op: 3 };
                        socket.send(JSON.stringify(message));
                    }, heartbeat_interval));
                    break;
                }
                case Opcode.Event: {
                    const data = message.d;
                    if ('activities' in data) {
                        if (!('id' in opts)) {
                            throw new Error('got single presence data object but we specified multiple ids or all');
                        }
                        setPresence((prev) => {
                            prev[opts.id] = data;
                            return prev;
                        });
                    }
                    else {
                        setPresence(data);
                    }
                    break;
                }
            }
        });
        socket.onclose = () => {
            clearInterval(heartbeat());
            if (!closed()) {
                // not closed by us, reconnect after a delay
                setTimeout(() => {
                    setSocket(new WebSocket(SOCKET_URL));
                }, 2000);
            }
        };
    };
    createEffect(() => {
        setEventListeners(socket());
    });
    onCleanup(() => {
        setClosed(true);
        socket().close();
        clearInterval(heartbeat());
    });
    const client = ('id' in opts ? () => presence()[opts.id] : presence);
    client.close = () => {
        setClosed(true);
        socket().close();
    };
    client.closed = closed;
    client.presence = client;
    return client;
}
export default useLanyard;
export * from './types';
//# sourceMappingURL=lanyard.js.map