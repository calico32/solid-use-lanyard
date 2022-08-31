import { Accessor, batch, createEffect, createSignal, onCleanup } from 'solid-js'
import {
  ClientSocketMessage,
  Opcode,
  Presence,
  PresenceWithId,
  ServerSocketMessage,
  Snowflake,
  SocketInitialize,
} from './types'

const REST_URL = 'https://api.lanyard.rest/v1/users'
const SOCKET_URL = 'wss://api.lanyard.rest/socket'

export const appAssetUrl = (
  applicationId?: string,
  assetId?: string,
  type = 'webp'
): string | undefined => {
  if (!applicationId || !assetId) return

  if (assetId.startsWith('mp:')) {
    return `https://media.discordapp.net/${assetId.slice(3)}`
  }

  return `https://cdn.discordapp.com/app-assets/${applicationId}/${assetId}.${type}`
}

export const userAvatarUrl = (userId: string, type = 'webp'): string => {
  return `https://api.lanyard.rest/${userId}.${type}`
}

interface RestOpts {
  type: 'rest'
  id: Snowflake
}

interface RestRefreshOpts extends RestOpts {
  /**
   * Time interval, in milliseconds, between data fetches. Defaults to no interval (single fetch only).
   */
  refreshInterval: number
}

interface SocketOpts {
  type?: 'socket'
  id: Snowflake
}
interface SocketMultiIdOpts<T extends readonly string[] = readonly string[]> {
  type?: 'socket'
  ids: T
}
interface SocketAllOpts {
  type?: 'socket'
  all: true
}

type LanyardOpts =
  | RestOpts
  | RestRefreshOpts
  | SocketOpts
  | SocketMultiIdOpts
  | SocketAllOpts
  | string

interface RestRefreshClient<T> {
  (): T
  presence: () => T
  cancel(): void
}

interface SocketClient<T> {
  (): T
  presence: () => T
  close: () => void
  closed: () => boolean
}

interface LatestUpdate {
  latestUpdate: Accessor<PresenceWithId | undefined>
}

type LanyardClient<T extends LanyardOpts> = T extends RestRefreshOpts
  ? RestRefreshClient<Presence | undefined>
  : T extends RestOpts
  ? Accessor<Presence | undefined>
  : T extends SocketOpts | string
  ? SocketClient<Presence | undefined>
  : T extends SocketMultiIdOpts<infer U>
  ? SocketClient<{ [key in U[number]]: Presence }> & LatestUpdate
  : T extends SocketAllOpts
  ? SocketClient<{ [key: Snowflake]: Presence }> & LatestUpdate
  : never

// function useLanyard(opts: RestOpts): LanyardClient<RestOpts>
// function useLanyard(opts: RestRefreshOpts): LanyardClient<RestRefreshOpts>
// function useLanyard(opts: SocketOpts): LanyardClient<SocketOpts>
// function useLanyard<T extends readonly string[]>(
//   opts: SocketMultiIdOpts<T>
// ): LanyardClient<SocketMultiIdOpts<T>>
// function useLanyard(opts: SocketAllOpts): LanyardClient<SocketAllOpts>
// function useLanyard(id: string): LanyardClient<string>
function useLanyard<T extends LanyardOpts>(opts: T): LanyardClient<T> {
  const rest = (id: string, interval?: number): Accessor<Presence | undefined> => {
    const [presence, setPresence] = createSignal<Presence>()
    let intervalId: number | undefined

    const getPresence = async () => {
      fetch(`${REST_URL}/${id}`)
        .then((r) => r.json())
        .then(({ data }: { data: Presence }) => {
          setPresence({
            ...data,
            user_id: id,
          })
        })
    }

    getPresence()

    if (interval) {
      intervalId = setInterval(() => getPresence(), interval) as any as number
    }

    onCleanup(() => {
      clearInterval(intervalId)
    })

    if (interval) {
      const client = presence as RestRefreshClient<Presence | undefined>
      client.cancel = () => {
        clearInterval(intervalId)
      }
      client.presence = presence
      return client
    } else {
      return presence
    }
  }

  if (typeof opts === 'string') {
    opts = { type: 'socket', id: opts } as Exclude<T, string>
  }

  if (opts.type === 'rest') {
    return rest((opts as RestOpts).id, (opts as RestRefreshOpts).refreshInterval) as any
  }

  const [heartbeat, setHeartbeat] = createSignal<number>()
  const [closed, setClosed] = createSignal(false)
  const [presence, setPresence] = createSignal<{ [key: string]: Presence }>({}, { equals: false })
  const [socket, setSocket] = createSignal<WebSocket>(new WebSocket(SOCKET_URL))
  const [latestUpdate, setLatestUpdate] = createSignal<PresenceWithId>()

  const setEventListeners = (socket: WebSocket) => {
    socket.onopen = () => {
      const data: SocketInitialize['d'] =
        'id' in opts
          ? { subscribe_to_id: opts.id }
          : 'ids' in opts
          ? { subscribe_to_ids: [...opts.ids] }
          : { subscribe_to_all: true }

      const message: SocketInitialize = {
        op: 2,
        d: data,
      }
      socket.send(JSON.stringify(message))
    }

    socket.onmessage = async ({ data: payload }) => {
      const message = JSON.parse(payload) as ServerSocketMessage
      switch (message.op) {
        case Opcode.Hello: {
          const { heartbeat_interval } = message.d
          setHeartbeat(
            setInterval(() => {
              const message: ClientSocketMessage = { op: 3 }
              socket.send(JSON.stringify(message))
            }, heartbeat_interval) as any as number
          )
          break
        }

        case Opcode.Event: {
          const data = message.d

          if ('activities' in data) {
            if (!('id' in opts)) {
              throw new Error(
                'got single presence data object but we specified multiple ids or all'
              )
            }
            setPresence((prev) => {
              prev[(opts as any).id] = data as Presence
              return prev
            })
          } else {
            batch(() => {
              setPresence((prev) => {
                return {
                  ...prev,
                  ...data,
                }
              })
              const [latestUpdateId, latestUpdate] = Object.entries(data)[0] as [
                Snowflake,
                Presence
              ]
              setLatestUpdate({
                ...latestUpdate,
                user_id: latestUpdateId,
              })
            })
          }
          break
        }
      }
    }

    socket.onclose = () => {
      clearInterval(heartbeat())
      if (!closed()) {
        // not closed by us, reconnect after a delay
        setTimeout(() => {
          setSocket(new WebSocket(SOCKET_URL))
        }, 2000)
      }
    }
  }

  createEffect(() => {
    setEventListeners(socket())
  })

  onCleanup(() => {
    setClosed(true)
    socket().close()
    clearInterval(heartbeat())
  })

  const client = (
    'id' in opts ? () => presence()[(opts as any).id] : presence
  ) as SocketClient<any> & LatestUpdate
  client.close = () => {
    setClosed(true)
    socket().close()
  }
  client.closed = closed
  client.presence = client

  if ('ids' in opts || 'all' in opts) {
    client.latestUpdate = latestUpdate
  }

  return client as any
}

export default useLanyard
export * from './types'
