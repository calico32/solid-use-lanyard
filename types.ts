export type Snowflake = string

export enum Opcode {
  Event = 0,
  Hello = 1,
  Initialize = 2,
  Heartbeat = 3,
}

export interface Response {
  success: boolean
  data: Presence
}

export interface Presence {
  active_on_discord_web: boolean
  active_on_discord_mobile: boolean
  active_on_discord_desktop: boolean
  listening_to_spotify: boolean
  kv: { [key: string]: string }
  spotify: SpotifyPresence
  discord_user: DiscordUser
  discord_status: string
  activities: Activity[]
}

export interface PresenceWithId extends Presence {
  user_id: Snowflake
}

export interface DiscordUser {
  username: string
  /**
   * Refer to {@link UserFlags}
   */
  public_flags: number
  id: Snowflake
  discriminator: `${number}`
  avatar: string
}

export interface SpotifyPresence {
  track_id: string
  timestamps: {
    start: number
    end: number
  }
  song: string
  artist: string
  album_art_url: string
  album: string
}

export interface Activity {
  type: ActivityType
  timestamps?: {
    start?: number
    end?: number
  }
  state?: string | null
  emoji?: {
    name: string
    id?: Snowflake
    animated?: boolean
  }
  party?: {
    id: string
    size?: {
      current_size: number
      max_size: number
    }
  }
  name: string
  id: string
  url?: string | null
  details?: string | null
  instance?: boolean
  created_at: number
  assets?: {
    small_text?: string
    small_image?: string
    large_text?: string
    large_image?: string
  }
  buttons?: string[]
  flags: ActivityFlags
  application_id?: Snowflake
}

export enum ActivityType {
  Playing = 0,
  Streaming = 1,
  Listening = 2,
  Watching = 3,
  Custom = 4,
  Competing = 5,
}

export enum ActivityFlags {
  Instance = 1 << 0,
  Join = 1 << 1,
  Spectate = 1 << 2,
  JoinRequest = 1 << 3,
  Sync = 1 << 4,
  Play = 1 << 5,
  PartyPiracyFriends = 1 << 6,
  PartyPiracyVoiceChannel = 1 << 7,
  Embedded = 1 << 8,
}

/**
 * https://discord.com/developers/docs/resources/user#user-object-user-flags
 */
export enum UserFlags {
  /**
   * Discord Employee
   */
  Staff = 1 << 0,
  /**
   * Partnered Server Owner
   */
  Partner = 1 << 1,
  /**
   * HypeSquad Events Coordinator
   */
  Hypesquad = 1 << 2,
  /**
   * Bug Hunter Level 1
   */
  BugHunterLevel1 = 1 << 3,
  /**
   * House Bravery Member
   */
  HypeSquadOnlineHouse1 = 1 << 6,
  /**
   * House Brilliance Member
   */
  HypeSquadOnlineHouse2 = 1 << 7,
  /**
   * House Balance Member
   */
  HypeSquadOnlineHouse3 = 1 << 8,
  /**
   * Early Nitro Supporter
   */
  PremiumEarlySupporter = 1 << 9,
  /**
   * User is a [team](https://discord.com/developers/docs/topics/teams)
   */
  TeamPseudoUser = 1 << 10,
  /**
   * Bug Hunter Level 2
   */
  BugHunterLevel2 = 1 << 14,
  /**
   * Verified Bot
   */
  VerifiedBot = 1 << 16,
  /**
   * Early Verified Bot Developer
   */
  VerifiedDeveloper = 1 << 17,
  /**
   * Discord Certified Moderator
   */
  CertifiedModerator = 1 << 18,
  /**
   * Bot uses only [HTTP interactions](https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction) and is shown in the online member list
   */
  BotHTTPInteractions = 1 << 19,
  /**
   * User has been identified as spammer
   */
  Spammer = 1 << 20,
}

export type ServerSocketMessage = SocketEventInitState | SocketEventPresenceUpdate | SocketHello
export type ClientSocketMessage = SocketInitialize | SocketHeartbeat

export interface SocketEventInitState {
  op: 0
  seq: 1
  t: 'INIT_STATE'
  d: Presence | { [key: Snowflake]: Presence }
}

export interface SocketEventPresenceUpdate {
  op: 0
  seq: 2
  t: 'PRESENCE_UPDATE'
  d: PresenceWithId
}

export interface SocketHello {
  op: 1
  d: {
    heartbeat_interval: number
  }
}

export interface SocketInitialize {
  op: 2
  d:
    | { subscribe_to_id?: Snowflake }
    | { subscribe_to_ids?: Snowflake[] }
    | { subscribe_to_all?: true }
}

export interface SocketHeartbeat {
  op: 3
}
