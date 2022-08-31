"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAvatarUrl = exports.appAssetUrl = void 0;
const solid_js_1 = require("solid-js");
const types_1 = require("./types");
const REST_URL = 'https://api.lanyard.rest/v1/users';
const SOCKET_URL = 'wss://api.lanyard.rest/socket';
const request = (url) => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(url).then((r) => r.json());
});
const appAssetUrl = (applicationId, assetId, type = 'webp') => {
    if (!applicationId || !assetId)
        return;
    if (assetId.startsWith('mp:')) {
        return `https://media.discordapp.net/${assetId.slice(3)}`;
    }
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${assetId}.${type}`;
};
exports.appAssetUrl = appAssetUrl;
const userAvatarUrl = (userId, type = 'webp') => {
    return `https://api.lanyard.rest/${userId}.${type}`;
};
exports.userAvatarUrl = userAvatarUrl;
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
        const [presence, setPresence] = (0, solid_js_1.createSignal)();
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
        (0, solid_js_1.onCleanup)(() => {
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
    const [heartbeat, setHeartbeat] = (0, solid_js_1.createSignal)();
    const [closed, setClosed] = (0, solid_js_1.createSignal)(false);
    const [presence, setPresence] = (0, solid_js_1.createSignal)({}, { equals: false });
    const [socket, setSocket] = (0, solid_js_1.createSignal)(new WebSocket(SOCKET_URL));
    const [latestUpdate, setLatestUpdate] = (0, solid_js_1.createSignal)();
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
                case types_1.Opcode.Hello: {
                    const { heartbeat_interval } = message.d;
                    setHeartbeat(setInterval(() => {
                        const message = { op: 3 };
                        socket.send(JSON.stringify(message));
                    }, heartbeat_interval));
                    break;
                }
                case types_1.Opcode.Event: {
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
                        (0, solid_js_1.batch)(() => {
                            setPresence((prev) => {
                                return Object.assign(Object.assign({}, prev), data);
                            });
                            const [latestUpdateId, latestUpdate] = Object.entries(data)[0];
                            setLatestUpdate(Object.assign(Object.assign({}, latestUpdate), { user_id: latestUpdateId }));
                        });
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
    (0, solid_js_1.createEffect)(() => {
        setEventListeners(socket());
    });
    (0, solid_js_1.onCleanup)(() => {
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
    if ('ids' in opts || 'all' in opts) {
        client.latestUpdate = latestUpdate;
    }
    return client;
}
exports.default = useLanyard;
__exportStar(require("./types"), exports);
//# sourceMappingURL=lanyard.js.map