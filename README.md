# `solid-use-lanyard`

<p>
  <a href="https://www.npmjs.com/package/solid-use-lanyard">
    <img src="https://img.shields.io/npm/v/solid-use-lanyard">
    <img src="https://img.shields.io/bundlephobia/min/solid-use-lanyard">
  </a>
</p>


A SolidJS wrapper around the [Lanyard](https://github.com/Phineas/lanyard) API. Supports both REST and WebSocket modes, and includes full support for TypeScript.



## Installation

```bash
yarn add solid-use-lanyard
npm install solid-use-lanyard
```

## Usage

```jsx
import useLanyard, { appAssetUrl, userAvatarUrl } from 'solid-use-lanyard'

const Component = () => {
  // Default: WebSocket API
  const presence = useLanyard('user_id')
  // presence: () => Presence | undefined

  // Advanced properties
  const { presence, close, closed } = useLanyard('user_id')
  // equivalent to:
  const { presence, close, closed } = useLanyard({ type: 'socket', id: 'user_id' })
  // presence: () => Presence | undefined
  // close: () => void
  // closed: () => boolean

  // Multiple users
  const { presence, close, closed, latestUpdate } = useLanyard({ type: 'socket', ids: ['user_id1', 'user_id2'] })
  // All users
  const { presence, close, closed, latestUpdate } = useLanyard({ type: 'socket', all: true })
  // presence: () => { [id: string]: Presence }
  // close: () => void
  // closed: () => boolean
  // latestUpdate: () => Presence & { user_id: string }

  // The WebSocket client will automatically reconnect if the connection is lost


  // REST API (single API call only)
  const presence = useLanyard({ type: 'rest', id: 'user_id' })
  // presence: () => Presence | undefined

  // REST with auto-refresh
  const presence = useLanyard({ type: 'rest', id: 'user_id', refreshInterval: 1000 /* ms */ })
  // presence: () => Presence | undefined
  
  // Advanced properties
  const { presence, cancel } = useLanyard({ type: 'rest', id: 'user_id', refreshInterval: 1000 /* ms */ })
  // presence: () => Presence | undefined
  // cancel: () => void


  // Helpers
  const avatar = userAvatarUrl('user_id', 'webp' | 'png' | 'jpg' | 'jpeg' | 'gif') // default: 'webp'
  // avatar: string

  const asset = appAssetUrl(activity.application_id, activity.assets?.large_image, 'webp' | 'png' | 'jpg' | 'jpeg' | 'gif') // default: 'webp'
  // asset: string

  // (easily make these reactive by wrapping them in a function)


  // Example single-user component:
  return presence() && (
    <For each={presence().activities}>
      {(activity) => (
        <div>
          <img src={appAssetUrl(activity.application_id, activity.assets?.large_image)} />
          <h1>{activity.name}</h1>
          <p>{activity.details}</p>
          <p>{activity.state}</p>
        </div>
      )}
    </For>
  )
}
```
