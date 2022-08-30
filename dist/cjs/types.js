"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFlags = exports.ActivityFlags = exports.ActivityType = exports.Opcode = void 0;
var Opcode;
(function (Opcode) {
    Opcode[Opcode["Event"] = 0] = "Event";
    Opcode[Opcode["Hello"] = 1] = "Hello";
    Opcode[Opcode["Initialize"] = 2] = "Initialize";
    Opcode[Opcode["Heartbeat"] = 3] = "Heartbeat";
})(Opcode = exports.Opcode || (exports.Opcode = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType[ActivityType["Playing"] = 0] = "Playing";
    ActivityType[ActivityType["Streaming"] = 1] = "Streaming";
    ActivityType[ActivityType["Listening"] = 2] = "Listening";
    ActivityType[ActivityType["Watching"] = 3] = "Watching";
    ActivityType[ActivityType["Custom"] = 4] = "Custom";
    ActivityType[ActivityType["Competing"] = 5] = "Competing";
})(ActivityType = exports.ActivityType || (exports.ActivityType = {}));
var ActivityFlags;
(function (ActivityFlags) {
    ActivityFlags[ActivityFlags["Instance"] = 1] = "Instance";
    ActivityFlags[ActivityFlags["Join"] = 2] = "Join";
    ActivityFlags[ActivityFlags["Spectate"] = 4] = "Spectate";
    ActivityFlags[ActivityFlags["JoinRequest"] = 8] = "JoinRequest";
    ActivityFlags[ActivityFlags["Sync"] = 16] = "Sync";
    ActivityFlags[ActivityFlags["Play"] = 32] = "Play";
    ActivityFlags[ActivityFlags["PartyPiracyFriends"] = 64] = "PartyPiracyFriends";
    ActivityFlags[ActivityFlags["PartyPiracyVoiceChannel"] = 128] = "PartyPiracyVoiceChannel";
    ActivityFlags[ActivityFlags["Embedded"] = 256] = "Embedded";
})(ActivityFlags = exports.ActivityFlags || (exports.ActivityFlags = {}));
/**
 * https://discord.com/developers/docs/resources/user#user-object-user-flags
 */
var UserFlags;
(function (UserFlags) {
    /**
     * Discord Employee
     */
    UserFlags[UserFlags["Staff"] = 1] = "Staff";
    /**
     * Partnered Server Owner
     */
    UserFlags[UserFlags["Partner"] = 2] = "Partner";
    /**
     * HypeSquad Events Coordinator
     */
    UserFlags[UserFlags["Hypesquad"] = 4] = "Hypesquad";
    /**
     * Bug Hunter Level 1
     */
    UserFlags[UserFlags["BugHunterLevel1"] = 8] = "BugHunterLevel1";
    /**
     * House Bravery Member
     */
    UserFlags[UserFlags["HypeSquadOnlineHouse1"] = 64] = "HypeSquadOnlineHouse1";
    /**
     * House Brilliance Member
     */
    UserFlags[UserFlags["HypeSquadOnlineHouse2"] = 128] = "HypeSquadOnlineHouse2";
    /**
     * House Balance Member
     */
    UserFlags[UserFlags["HypeSquadOnlineHouse3"] = 256] = "HypeSquadOnlineHouse3";
    /**
     * Early Nitro Supporter
     */
    UserFlags[UserFlags["PremiumEarlySupporter"] = 512] = "PremiumEarlySupporter";
    /**
     * User is a [team](https://discord.com/developers/docs/topics/teams)
     */
    UserFlags[UserFlags["TeamPseudoUser"] = 1024] = "TeamPseudoUser";
    /**
     * Bug Hunter Level 2
     */
    UserFlags[UserFlags["BugHunterLevel2"] = 16384] = "BugHunterLevel2";
    /**
     * Verified Bot
     */
    UserFlags[UserFlags["VerifiedBot"] = 65536] = "VerifiedBot";
    /**
     * Early Verified Bot Developer
     */
    UserFlags[UserFlags["VerifiedDeveloper"] = 131072] = "VerifiedDeveloper";
    /**
     * Discord Certified Moderator
     */
    UserFlags[UserFlags["CertifiedModerator"] = 262144] = "CertifiedModerator";
    /**
     * Bot uses only [HTTP interactions](https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction) and is shown in the online member list
     */
    UserFlags[UserFlags["BotHTTPInteractions"] = 524288] = "BotHTTPInteractions";
    /**
     * User has been identified as spammer
     */
    UserFlags[UserFlags["Spammer"] = 1048576] = "Spammer";
})(UserFlags = exports.UserFlags || (exports.UserFlags = {}));
//# sourceMappingURL=types.js.map