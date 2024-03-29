const util = require('util');
const Long = require('long');
const User = require('./User');
const Role = require('./Role');
const Emoji = require('./Emoji');
const Presence = require('./Presence').Presence;
const GuildMember = require('./GuildMember');
const Constants = require('../util/Constants');
const Collection = require('../util/Collection');
const Util = require('../util/Util');
const Snowflake = require('../util/Snowflake');

/**
 * Represents a guild (or a server) on Discord.
 * <info>It's recommended to see if a guild is available before performing operations or reading data from it. You can
 * check this with `guild.available`.</info>
 */
class Guild {
  constructor(client, data) {
    /**
     * The client that created the instance of the guild
     * @name Guild#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * A collection of members that are in this guild. The key is the member's ID, the value is the member
     * @type {Collection<Snowflake, GuildMember>}
     */
    this.members = new Collection();

    /**
     * A collection of channels that are in this guild. The key is the channel's ID, the value is the channel
     * @type {Collection<Snowflake, GuildChannel>}
     */
    this.channels = new Collection();

    /**
     * A collection of roles that are in this guild. The key is the role's ID, the value is the role
     * @type {Collection<Snowflake, Role>}
     */
    this.roles = new Collection();

    /**
     * A collection of presences in this guild
     * @type {Collection<Snowflake, Presence>}
     */
    this.presences = new Collection();

    /**
     * Whether the bot has been removed from the guild
     * @type {boolean}
     */
    this.deleted = false;

    if (!data) return;
    if (data.unavailable) {
      /**
       * Whether the guild is available to access. If it is not available, it indicates a server outage
       * @type {boolean}
       */
      this.available = false;

      /**
       * The Unique ID of the guild, useful for comparisons
       * @type {Snowflake}
       */
      this.id = data.id;
    } else {
      this.setup(data);
      if (!data.channels) this.available = false;
    }
  }

  /* eslint-disable complexity */
  /**
   * Sets up the guild.
   * @param {*} data The raw data of the guild
   * @private
   */
  setup(data) {
    /**
     * The name of the guild
     * @type {string}
     */
    this.name = data.name;

    /**
     * The hash of the guild icon
     * @type {?string}
     */
    this.icon = data.icon;

    /**
     * The hash of the guild splash image (VIP only)
     * @type {?string}
     */
    this.splash = data.splash;

    /**
     * The region the guild is located in
     * @type {string}
     */
    this.region = data.region;

    /**
     * The full amount of members in this guild
     * @type {number}
     */
    this.memberCount = data.member_count || this.memberCount;

    /**
     * Whether the guild is "large" (has more than 250 members)
     * @type {boolean}
     */
    this.large = Boolean('large' in data ? data.large : this.large);

    /**
     * An array of guild features
     * @type {Object[]}
     */
    this.features = data.features;

    /**
     * The ID of the application that created this guild (if applicable)
     * @type {?Snowflake}
     */
    this.applicationID = data.application_id;

    /**
     * The time in seconds before a user is counted as "away from keyboard"
     * @type {?number}
     */
    this.afkTimeout = data.afk_timeout;

    /**
     * The ID of the voice channel where AFK members are moved
     * @type {?string}
     */
    this.afkChannelID = data.afk_channel_id;

    /**
     * The ID of the system channel
     * @type {?Snowflake}
     */
    this.systemChannelID = data.system_channel_id;

    /**
     * Whether embedded images are enabled on this guild
     * @type {boolean}
     */
    this.embedEnabled = data.embed_enabled;

    /**
     * The verification level of the guild
     * @type {number}
     */
    this.verificationLevel = data.verification_level;

    /**
     * The explicit content filter level of the guild
     * @type {number}
     */
    this.explicitContentFilter = data.explicit_content_filter;

    /**
     * The required MFA level for the guild
     * @type {number}
     */
    this.mfaLevel = data.mfa_level;

    /**
     * The timestamp the client user joined the guild at
     * @type {number}
     */
    this.joinedTimestamp = data.joined_at ? new Date(data.joined_at).getTime() : this.joinedTimestamp;

    /**
     * The value set for a guild's default message notifications
     * @type {DefaultMessageNotifications|number}
     */
    this.defaultMessageNotifications = Constants.DefaultMessageNotifications[data.default_message_notifications] ||
      data.default_message_notifications;

    /**
     * The type of premium tier:
     * * 0: NONE
     * * 1: TIER_1
     * * 2: TIER_2
     * * 3: TIER_3
     * @typedef {number} PremiumTier
     */

    /**
     * The premium tier on this guild
     * @type {PremiumTier}
     */
    this.premiumTier = data.premium_tier;

    /**
     * The total number of users currently boosting this server
     * @type {?number}
     * @name Guild#premiumSubscriptionCount
     */
    if (typeof data.premium_subscription_count !== 'undefined') {
      this.premiumSubscriptionCount = data.premium_subscription_count;
    }

    /**
     * The hash of the guild banner
     * @type {?string}
     */
    this.banner = data.banner;

    /**
     * The description of the guild, if any
     * @type {?string}
     */
    this.description = data.description;

    /**
     * The embed channel ID, if enabled
     * @type {?string}
     * @name Guild#embedChannelID
     */
    if (typeof data.embed_channel_id !== 'undefined') this.embedChannelID = data.embed_channel_id;

    /**
     * The maximum amount of members the guild can have
     * <info>You will need to fetch the guild using {@link Guild#fetch} if you want to receive this parameter</info>
     * @type {?number}
     * @name Guild#maximumMembers
     */
    if (typeof data.max_members !== 'undefined') this.maximumMembers = data.max_members || 250000;

    /**
     * The maximum amount of presences the guild can have
     * <info>You will need to fetch the guild using {@link Guild#fetch} if you want to receive this parameter</info>
     * @type {?number}
     * @name Guild#maximumPresences
     */
    if (typeof data.max_presences !== 'undefined') this.maximumPresences = data.max_presences || 5000;

    /**
     * Whether widget images are enabled on this guild
     * @type {?boolean}
     * @name Guild#widgetEnabled
     */
    if (typeof data.widget_enabled !== 'undefined') this.widgetEnabled = data.widget_enabled;

    /**
     * The widget channel ID, if enabled
     * @type {?string}
     * @name Guild#widgetChannelID
     */
    if (typeof data.widget_channel_id !== 'undefined') this.widgetChannelID = data.widget_channel_id;

    /**
     * The vanity URL code of the guild, if any
     * @type {?string}
     */
    this.vanityURLCode = data.vanity_url_code;

    this.id = data.id;
    this.available = !data.unavailable;
    this.features = data.features || this.features || [];

    if (data.members) {
      this.members.clear();
      for (const guildUser of data.members) this._addMember(guildUser, false);
    }

    if (data.owner_id) {
      /**
       * The user ID of this guild's owner
       * @type {Snowflake}
       */
      this.ownerID = data.owner_id;
    }

    if (data.channels) {
      this.channels.clear();
      for (const channel of data.channels) this.client.dataManager.newChannel(channel, this);
    }

    if (data.roles) {
      this.roles.clear();
      for (const role of data.roles) {
        const newRole = new Role(this, role);
        this.roles.set(newRole.id, newRole);
      }
    }

    if (data.presences) {
      for (const presence of data.presences) {
        this._setPresence(presence.user.id, presence);
      }
    }

    this._rawVoiceStates = new Collection();
    if (data.voice_states) {
      for (const voiceState of data.voice_states) {
        this._rawVoiceStates.set(voiceState.user_id, voiceState);
        const member = this.members.get(voiceState.user_id);
        const voiceChannel = this.channels.get(voiceState.channel_id);
        if (member && voiceChannel) {
          member.serverMute = voiceState.mute;
          member.serverDeaf = voiceState.deaf;
          member.selfMute = voiceState.self_mute;
          member.selfDeaf = voiceState.self_deaf;
          member.selfStream = voiceState.self_stream || false;
          member.voiceSessionID = voiceState.session_id;
          member.voiceChannelID = voiceState.channel_id;
          voiceChannel.members.set(member.user.id, member);
        }
      }
    }

    if (!this.emojis) {
      /**
       * A collection of emojis that are in this guild
       * The key is the emoji's ID, the value is the emoji
       * @type {Collection<Snowflake, Emoji>}
       */
      this.emojis = new Collection();
      for (const emoji of data.emojis) this.emojis.set(emoji.id, new Emoji(this, emoji));
    } else {
      this.client.actions.GuildEmojisUpdate.handle({
        guild_id: this.id,
        emojis: data.emojis,
      });
    }
  }

  /**
   * The timestamp the guild was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return Snowflake.deconstruct(this.id).timestamp;
  }

  /**
   * The time the guild was created
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * Embed channel for this guild
   * @type {?TextChannel}
   * @readonly
   */
  get embedChannel() {
    return this.channels.get(this.embedChannelID) || null;
  }

  /**
   * Widget channel for this guild
   * @type {?TextChannel}
   * @readonly
   */
  get widgetChannel() {
    return this.channels.get(this.widgetChannelID) || null;
  }

  /**
   * The time the client user joined the guild
   * @type {Date}
   * @readonly
   */
  get joinedAt() {
    return new Date(this.joinedTimestamp);
  }

  /**
   * If this guild is verified
   * @type {boolean}
   * @readonly
   */
  get verified() {
    return this.features.includes('VERIFIED');
  }

  /**
   * The URL to this guild's icon
   * @type {?string}
   * @readonly
   */
  get iconURL() {
    if (!this.icon) return null;
    return Constants.Endpoints.Guild(this).Icon(this.client.options.http.cdn, this.icon);
  }

  /**
   * The URL to this guild's banner.
   * @type {?string}
   * @readonly
   */
  get bannerURL() {
    if (!this.banner) return null;
    return Constants.Endpoints.Guild(this).Banner(this.client.options.http.cdn, this.banner);
  }

  /**
   * The acronym that shows up in place of a guild icon.
   * @type {string}
   * @readonly
   */
  get nameAcronym() {
    return this.name.replace(/\w+/g, name => name[0]).replace(/\s/g, '');
  }

  /**
   * The URL to this guild's splash
   * @type {?string}
   * @readonly
   */
  get splashURL() {
    if (!this.splash) return null;
    return Constants.Endpoints.Guild(this).Splash(this.client.options.http.cdn, this.splash);
  }

  /**
   * The owner of the guild
   * @type {?GuildMember}
   * @readonly
   */
  get owner() {
    return this.members.get(this.ownerID);
  }

  /**
   * AFK voice channel for this guild
   * @type {?VoiceChannel}
   * @readonly
   */
  get afkChannel() {
    return this.client.channels.get(this.afkChannelID) || null;
  }

  /**
   * System channel for this guild
   * @type {?GuildChannel}
   * @readonly
   */
  get systemChannel() {
    return this.client.channels.get(this.systemChannelID) || null;
  }

  /**
   * If the client is connected to any voice channel in this guild, this will be the relevant VoiceConnection
   * @type {?VoiceConnection}
   * @readonly
   */
  get voiceConnection() {
    if (this.client.browser) return null;
    return this.client.voice.connections.get(this.id) || null;
  }

  /**
   * The position of this guild
   * <warn>This is only available when using a user account.</warn>
   * @type {?number}
   * @readonly
   * @deprecated
   */
  get position() {
    if (this.client.user.bot) return null;
    if (!this.client.user.settings.guildPositions) return null;
    return this.client.user.settings.guildPositions.indexOf(this.id);
  }

  /**
   * Whether the guild is muted
   * <warn>This is only available when using a user account.</warn>
   * @type {?boolean}
   * @readonly
   * @deprecated
   */
  get muted() {
    if (this.client.user.bot) return null;
    try {
      return this.client.user.guildSettings.get(this.id).muted;
    } catch (err) {
      return false;
    }
  }

  /**
   * The type of message that should notify you
   * <warn>This is only available when using a user account.</warn>
   * @type {?MessageNotificationType}
   * @readonly
   * @deprecated
   */
  get messageNotifications() {
    if (this.client.user.bot) return null;
    try {
      return this.client.user.guildSettings.get(this.id).messageNotifications;
    } catch (err) {
      return null;
    }
  }

  /**
   * Whether to receive mobile push notifications
   * <warn>This is only available when using a user account.</warn>
   * @type {?boolean}
   * @readonly
   * @deprecated
   */
  get mobilePush() {
    if (this.client.user.bot) return null;
    try {
      return this.client.user.guildSettings.get(this.id).mobilePush;
    } catch (err) {
      return false;
    }
  }

  /**
   * Whether to suppress everyone messages
   * <warn>This is only available when using a user account.</warn>
   * @type {?boolean}
   * @readonly
   * @deprecated
   */
  get suppressEveryone() {
    if (this.client.user.bot) return null;
    try {
      return this.client.user.guildSettings.get(this.id).suppressEveryone;
    } catch (err) {
      return null;
    }
  }

  /**
   * The `@everyone` role of the guild
   * @type {Role}
   * @readonly
   */
  get defaultRole() {
    return this.roles.get(this.id);
  }

  /**
   * The client user as a GuildMember of this guild
   * @type {?GuildMember}
   * @readonly
   */
  get me() {
    return this.members.get(this.client.user.id);
  }

  /**
   * Fetches a collection of roles in the current guild sorted by position
   * @type {Collection<Snowflake, Role>}
   * @readonly
   * @private
   */
  get _sortedRoles() {
    return this._sortPositionWithID(this.roles);
  }

  /**
   * Returns the GuildMember form of a User object, if the user is present in the guild.
   * @param {UserResolvable} user The user that you want to obtain the GuildMember of
   * @returns {?GuildMember}
   * @example
   * // Get the guild member of a user
   * const member = guild.member(message.author);
   */
  member(user) {
    return this.client.resolver.resolveGuildMember(this, user);
  }

  /**
   * Fetches this guild.
   * @returns {Promise<Guild>}
   */
  fetch() {
    return this.client.rest.methods.getGuild(this).then(data => {
      this.setup(data);

      return this;
    });
  }

  /**
   * An object containing information about a guild member's ban.
   * @typedef {Object} BanInfo
   * @property {User} user User that was banned
   * @property {?string} reason Reason the user was banned
   */

  /**
   * Fetch a ban for a user.
   * @returns {Promise<BanInfo>}
   * @param {UserResolvable} user The user to fetch the ban for
   * @example
   * // Get ban
   * guild.fetchBan(message.author)
   *   .then(({ user, reason }) => console.log(`${user.tag} was banned for the reason: ${reason}.`))
   *   .catch(console.error);
   */
  fetchBan(user) {
    return this.client.rest.methods.getGuildBan(this, user);
  }

  /**
   * Fetch a collection of banned users in this guild.
   * @returns {Promise<Collection<Snowflake, User|BanInfo>>}
   * @param {boolean} [withReasons=false] Whether or not to include the ban reason(s)
   * @example
   * // Fetch bans in guild
   * guild.fetchBans()
   *   .then(bans => console.log(`This guild has ${bans.size} bans`))
   *   .catch(console.error);
   */
  fetchBans(withReasons = false) {
    if (withReasons) return this.client.rest.methods.getGuildBans(this);
    return this.client.rest.methods.getGuildBans(this)
      .then(bans => {
        const users = new Collection();
        for (const ban of bans.values()) users.set(ban.user.id, ban.user);
        return users;
      });
  }

  /**
   * Fetch a collection of invites to this guild.
   * Resolves with a collection mapping invites by their codes.
   * @returns {Promise<Collection<string, Invite>>}
   * @example
   * // Fetch invites
   * guild.fetchInvites()
   *   .then(invites => console.log(`Fetched ${invites.size} invites`))
   *   .catch(console.error);
   * @example
   * // Fetch invite creator by their id
   * guild.fetchInvites()
   *  .then(invites => console.log(invites.find(invite => invite.inviter.id === '84484653687267328')))
   *  .catch(console.error);
   */
  fetchInvites() {
    return this.client.rest.methods.getGuildInvites(this);
  }

  /**
   * Fetches the vanity url invite code to this guild.
   * Resolves with a string matching the vanity url invite code, not the full url.
   * @returns {Promise<string>}
   * @example
   * // Fetch invites
   * guild.fetchVanityCode()
   *   .then(code => {
   *     console.log(`Vanity URL: https://discord.gg/${code}`);
   *   })
   *   .catch(console.error);
   */
  fetchVanityCode() {
    if (!this.features.includes('VANITY_URL')) {
      return Promise.reject(new Error('This guild does not have the VANITY_URL feature enabled.'));
    }
    return this.client.rest.methods.getGuildVanityCode(this);
  }


  /**
   * Fetch all webhooks for the guild.
   * @returns {Promise<Collection<Snowflake, Webhook>>}
   * @example
   * // Fetch webhooks
   * guild.fetchWebhooks()
   *   .then(webhooks => console.log(`Fetched ${webhooks.size} webhooks`))
   *   .catch(console.error);
   */
  fetchWebhooks() {
    return this.client.rest.methods.getGuildWebhooks(this);
  }

  /**
   * Fetch available voice regions.
   * @returns {Promise<Collection<string, VoiceRegion>>}
   * @example
   * // Fetch voice regions
   * guild.fetchVoiceRegions()
   *   .then(console.log)
   *   .catch(console.error);
   */
  fetchVoiceRegions() {
    return this.client.rest.methods.fetchVoiceRegions(this.id);
  }

  /**
   * The Guild Embed object
   * @typedef {Object} GuildEmbedData
   * @property {boolean} enabled Whether the embed is enabled
   * @property {?ChannelResolvable} channel The embed channel
   */

  /**
   * Fetches the guild embed.
   * @returns {Promise<GuildEmbedData>}
   * @example
   * // Fetches the guild embed
   * guild.fetchEmbed()
   *   .then(embed => console.log(`The embed is ${embed.enabled ? 'enabled' : 'disabled'}`))
   *   .catch(console.error);
   */
  fetchEmbed() {
    return this.client.rest.methods.fetchEmbed(this.id);
  }

  /**
   * Fetch audit logs for this guild.
   * @param {Object} [options={}] Options for fetching audit logs
   * @param {Snowflake|GuildAuditLogsEntry} [options.before] Limit to entries from before specified entry
   * @param {Snowflake|GuildAuditLogsEntry} [options.after] Limit to entries from after specified entry
   * @param {number} [options.limit] Limit number of entries
   * @param {UserResolvable} [options.user] Only show entries involving this user
   * @param {AuditLogAction} [options.type] Only show entries involving this action type
   * @returns {Promise<GuildAuditLogs>}
   * @example
   * // Output audit log entries
   * guild.fetchAuditLogs()
   *   .then(audit => console.log(audit.entries.first()))
   *   .catch(console.error);
   */
  fetchAuditLogs(options) {
    return this.client.rest.methods.getGuildAuditLogs(this, options);
  }

  /**
   * Adds a user to the guild using OAuth2. Requires the `CREATE_INSTANT_INVITE` permission.
   * @param {UserResolvable} user User to add to the guild
   * @param {Object} options Options for the addition
   * @param {string} options.accessToken An OAuth2 access token for the user with the `guilds.join` scope granted to the
   * bot's application
   * @param {string} [options.nick] Nickname to give the member (requires `MANAGE_NICKNAMES`)
   * @param {Collection<Snowflake, Role>|Role[]|Snowflake[]} [options.roles] Roles to add to the member
   * (requires `MANAGE_ROLES`)
   * @param {boolean} [options.mute] Whether the member should be muted (requires `MUTE_MEMBERS`)
   * @param {boolean} [options.deaf] Whether the member should be deafened (requires `DEAFEN_MEMBERS`)
   * @returns {Promise<GuildMember>}
   */
  addMember(user, options) {
    user = this.client.resolver.resolveUserID(user);
    if (this.members.has(user)) return Promise.resolve(this.members.get(user));
    return this.client.rest.methods.putGuildMember(this, user, options);
  }

  /**
   * Fetch a single guild member from a user.
   * @param {UserResolvable} user The user to fetch the member for
   * @param {boolean} [cache=true] Insert the member into the members cache
   * @returns {Promise<GuildMember>}
   * @example
   * // Fetch a guild member
   * guild.fetchMember(message.author)
   *   .then(console.log)
   *   .catch(console.error);
   */
  fetchMember(user, cache = true) {
    const userID = this.client.resolver.resolveUserID(user);
    if (!userID) return Promise.reject(new Error('Invalid id provided.'));
    const member = this.members.get(userID);
    if (member && member.joinedTimestamp) return Promise.resolve(member);
    return this.client.rest.methods.getGuildMember(this, userID, cache);
  }

  /**
   * Fetches all the members in the guild, even if they are offline. If the guild has less than 250 members,
   * this should not be necessary.
   * @param {string} [query=''] Limit fetch to members with similar usernames
   * @param {number} [limit=0] Maximum number of members to request
   * @returns {Promise<Guild>}
   * @example
   * // Fetch guild members
   * guild.fetchMembers()
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Fetches a maximum of 1 member with the given query
   * guild.fetchMembers('hydrabolt', 1)
   *   .then(console.log)
   *   .catch(console.error);
   */
  fetchMembers(query = '', limit = 0) {
    return new Promise((resolve, reject) => {
      if (this.memberCount === this.members.size) {
        resolve(this);
        return;
      }
      this.client.ws.send({
        op: Constants.OPCodes.REQUEST_GUILD_MEMBERS,
        d: {
          guild_id: this.id,
          query,
          limit,
        },
      });
      const handler = (members, guild) => {
        if (guild.id !== this.id) return;
        if (this.memberCount === this.members.size || members.length < 1000) {
          this.client.removeListener(Constants.Events.GUILD_MEMBERS_CHUNK, handler);
          resolve(this);
        }
      };
      this.client.on(Constants.Events.GUILD_MEMBERS_CHUNK, handler);
      this.client.setTimeout(() => reject(new Error('Members didn\'t arrive in time.')), 120 * 1000);
    });
  }

  /**
   * Performs a search within the entire guild.
   * <warn>This is only available when using a user account.</warn>
   * @param {MessageSearchOptions} [options={}] Options to pass to the search
   * @returns {Promise<MessageSearchResult>}
   * @deprecated
   * @example
   * guild.search({
   *   content: 'discord.js',
   *   before: '2016-11-17'
   * })
   *   .then(res => {
   *     const hit = res.messages[0].find(m => m.hit).content;
   *     console.log(`I found: **${hit}**, total results: ${res.totalResults}`);
   *   })
   *   .catch(console.error);
   */
  search(options = {}) {
    return this.client.rest.methods.search(this, options);
  }

  /**
   * The data for editing a guild.
   * @typedef {Object} GuildEditData
   * @property {string} [name] The name of the guild
   * @property {string} [region] The region of the guild
   * @property {number} [verificationLevel] The verification level of the guild
   * @property {number} [explicitContentFilter] The level of the explicit content filter
   * @property {ChannelResolvable} [afkChannel] The AFK channel of the guild
   * @property {ChannelResolvable} [systemChannel] The system channel of the guild
   * @property {number} [afkTimeout] The AFK timeout of the guild
   * @property {Base64Resolvable} [icon] The icon of the guild
   * @property {GuildMemberResolvable} [owner] The owner of the guild
   * @property {Base64Resolvable} [splash] The splash screen of the guild
   */

  /**
   * Updates the guild with new information - e.g. a new name.
   * @param {GuildEditData} data The data to update the guild with
   * @param {string} [reason] Reason for editing the guild
   * @returns {Promise<Guild>}
   * @example
   * // Set the guild name and region
   * guild.edit({
   *   name: 'Discord Guild',
   *   region: 'london',
   * })
   *   .then(g => console.log(`Changed guild name to ${g} and region to ${g.region}`))
   *   .catch(console.error);
   */
  edit(data, reason) {
    const _data = {};
    if (data.name) _data.name = data.name;
    if (data.region) _data.region = data.region;
    if (typeof data.verificationLevel !== 'undefined') _data.verification_level = Number(data.verificationLevel);
    if (typeof data.afkChannel !== 'undefined') {
      _data.afk_channel_id = this.client.resolver.resolveChannelID(data.afkChannel);
    }
    if (typeof data.systemChannel !== 'undefined') {
      _data.system_channel_id = this.client.resolver.resolveChannelID(data.systemChannel);
    }
    if (data.afkTimeout) _data.afk_timeout = Number(data.afkTimeout);
    if (typeof data.icon !== 'undefined') _data.icon = data.icon;
    if (data.owner) _data.owner_id = this.client.resolver.resolveUser(data.owner).id;
    if (typeof data.splash !== 'undefined') _data.splash = data.splash;
    if (typeof data.explicitContentFilter !== 'undefined') {
      _data.explicit_content_filter = Number(data.explicitContentFilter);
    }
    if (typeof data.defaultMessageNotifications !== 'undefined') {
      _data.default_message_notifications = typeof data.defaultMessageNotifications === 'string' ?
        Constants.DefaultMessageNotifications.indexOf(data.defaultMessageNotifications) :
        Number(data.defaultMessageNotifications);
    }
    return this.client.rest.methods.updateGuild(this, _data, reason);
  }

  /**
   * Edit the level of the explicit content filter.
   * @param {number} explicitContentFilter The new level of the explicit content filter
   * @param {string} [reason] Reason for changing the level of the guild's explicit content filter
   * @returns {Promise<Guild>}
   */
  setExplicitContentFilter(explicitContentFilter, reason) {
    return this.edit({ explicitContentFilter }, reason);
  }

  /**
   * Edits the setting of the default message notifications of the guild.
   * @param {DefaultMessageNotifications|number} defaultMessageNotifications
   * The new setting for the default message notifications
   * @param {string} [reason] Reason for changing the setting of the default message notifications
   * @returns {Promise<Guild>}
   */
  setDefaultMessageNotifications(defaultMessageNotifications, reason) {
    return this.edit({ defaultMessageNotifications }, reason);
  }

  /**
   * Edit the name of the guild.
   * @param {string} name The new name of the guild
   * @param {string} [reason] Reason for changing the guild's name
   * @returns {Promise<Guild>}
   * @example
   * // Edit the guild name
   * guild.setName('Discord Guild')
   *  .then(g => console.log(`Updated guild name to ${g}`))
   *  .catch(console.error);
   */
  setName(name, reason) {
    return this.edit({ name }, reason);
  }

  /**
   * Edit the region of the guild.
   * @param {string} region The new region of the guild
   * @param {string} [reason] Reason for changing the guild's region
   * @returns {Promise<Guild>}
   * @example
   * // Edit the guild region
   * guild.setRegion('london')
   *  .then(g => console.log(`Updated guild region to ${g.region}`))
   *  .catch(console.error);
   */
  setRegion(region, reason) {
    return this.edit({ region }, reason);
  }

  /**
   * Edit the verification level of the guild.
   * @param {number} verificationLevel The new verification level of the guild
   * @param {string} [reason] Reason for changing the guild's verification level
   * @returns {Promise<Guild>}
   * @example
   * // Edit the guild verification level
   * guild.setVerificationLevel(1)
   *  .then(g => console.log(`Updated guild verification level to ${g.verificationLevel}`))
   *  .catch(console.error);
   */
  setVerificationLevel(verificationLevel, reason) {
    return this.edit({ verificationLevel }, reason);
  }

  /**
   * Edit the AFK channel of the guild.
   * @param {ChannelResolvable} afkChannel The new AFK channel
   * @param {string} [reason] Reason for changing the guild's AFK channel
   * @returns {Promise<Guild>}
   * @example
   * // Edit the guild AFK channel
   * guild.setAFKChannel(channel)
   *  .then(g => console.log(`Updated guild AFK channel to ${g.afkChannel.name}`))
   *  .catch(console.error);
   */
  setAFKChannel(afkChannel, reason) {
    return this.edit({ afkChannel }, reason);
  }

  /**
   * Edit the system channel of the guild.
   * @param {ChannelResolvable} systemChannel The new system channel
   * @param {string} [reason] Reason for changing the guild's system channel
   * @returns {Promise<Guild>}
   */
  setSystemChannel(systemChannel, reason) {
    return this.edit({ systemChannel }, reason);
  }

  /**
   * Edit the AFK timeout of the guild.
   * @param {number} afkTimeout The time in seconds that a user must be idle to be considered AFK
   * @param {string} [reason] Reason for changing the guild's AFK timeout
   * @returns {Promise<Guild>}
   * @example
   * // Edit the guild AFK channel
   * guild.setAFKTimeout(60)
   *  .then(g => console.log(`Updated guild AFK timeout to ${g.afkTimeout}`))
   *  .catch(console.error);
   */
  setAFKTimeout(afkTimeout, reason) {
    return this.edit({ afkTimeout }, reason);
  }

  /**
   * Set a new guild icon.
   * @param {Base64Resolvable|BufferResolvable} icon The new icon of the guild
   * @param {string} [reason] Reason for changing the guild's icon
   * @returns {Promise<Guild>}
   * @example
   * // Edit the guild icon
   * guild.setIcon('./icon.png')
   *  .then(console.log)
   *  .catch(console.error);
   */
  setIcon(icon, reason) {
    return this.client.resolver.resolveImage(icon).then(data => this.edit({ icon: data, reason }));
  }

  /**
   * Sets a new owner of the guild.
   * @param {GuildMemberResolvable} owner The new owner of the guild
   * @param {string} [reason] Reason for setting the new owner
   * @returns {Promise<Guild>}
   * @example
   * // Edit the guild owner
   * guild.setOwner(guild.members.first())
   *  .then(g => console.log(`Updated the guild owner to ${g.owner.displayName}`))
   *  .catch(console.error);
   */
  setOwner(owner, reason) {
    return this.edit({ owner }, reason);
  }

  /**
   * Set a new guild splash screen.
   * @param {BufferResolvable|Base64Resolvable} splash The new splash screen of the guild
   * @param {string} [reason] Reason for changing the guild's splash screen
   * @returns {Promise<Guild>}
   * @example
   * // Edit the guild splash
   * guild.setSplash('./splash.png')
   *  .then(console.log)
   *  .catch(console.error);
   */
  setSplash(splash) {
    return this.client.resolver.resolveImage(splash).then(data => this.edit({ splash: data }));
  }

  /**
   * Sets the position of the guild in the guild listing.
   * <warn>This is only available when using a user account.</warn>
   * @param {number} position Absolute or relative position
   * @param {boolean} [relative=false] Whether to position relatively or absolutely
   * @returns {Promise<Guild>}
   * @deprecated
   */
  setPosition(position, relative) {
    if (this.client.user.bot) {
      return Promise.reject(new Error('Setting guild position is only available for user accounts'));
    }
    return this.client.user.settings.setGuildPosition(this, position, relative);
  }

  /**
   * Marks all messages in this guild as read.
   * <warn>This is only available when using a user account.</warn>
   * @returns {Promise<Guild>}
   * @deprecated
   */
  acknowledge() {
    return this.client.rest.methods.ackGuild(this);
  }

  /**
   * Allow direct messages from guild members.
   * <warn>This is only available when using a user account.</warn>
   * @param {boolean} allow Whether to allow direct messages
   * @returns {Promise<Guild>}
   * @deprecated
   */
  allowDMs(allow) {
    const settings = this.client.user.settings;
    if (allow) return settings.removeRestrictedGuild(this);
    else return settings.addRestrictedGuild(this);
  }

  /**
   * Bans a user from the guild.
   * @param {UserResolvable} user The user to ban
   * @param {Object|number|string} [options] Ban options. If a number, the number of days to delete messages for, if a
   * string, the ban reason. Supplying an object allows you to do both.
   * @param {number} [options.days=0] Number of days of messages to delete
   * @param {string} [options.reason] Reason for banning
   * @returns {Promise<GuildMember|User|string>} Result object will be resolved as specifically as possible.
   * If the GuildMember cannot be resolved, the User will instead be attempted to be resolved. If that also cannot
   * be resolved, the user ID will be the result.
   * @example
   * // Ban a user by ID
   * guild.ban('some user ID')
   *   .then(user => console.log(`Banned ${user.username || user.id || user} from ${guild}`))
   *   .catch(console.error);
   * @example
   * // Ban a user by object with reason and days
   * guild.ban(user, { days: 7, reason: 'He needed to go' })
   *   .then(console.log)
   *   .catch(console.error);
   */
  ban(user, options = {}) {
    if (typeof options === 'number') {
      options = { reason: null, 'delete-message-days': options };
    } else if (typeof options === 'string') {
      options = { reason: options, 'delete-message-days': 0 };
    }
    if (options.days) options['delete-message-days'] = options.days;
    return this.client.rest.methods.banGuildMember(this, user, options);
  }

  /**
   * Unbans a user from the guild.
   * @param {UserResolvable} user The user to unban
   * @param {string} [reason] Reason for unbanning the user
   * @returns {Promise<User>}
   * @example
   * // Unban a user by ID (or with a user/guild member object)
   * guild.unban('some user ID')
   *   .then(user => console.log(`Unbanned ${user.username} from ${guild}`))
   *   .catch(console.error);
   */
  unban(user, reason) {
    return this.client.rest.methods.unbanGuildMember(this, user, reason);
  }

  /**
   * Prunes members from the guild based on how long they have been inactive.
   * @param {number} days Number of days of inactivity required to kick
   * @param {boolean} [dry=false] If true, will return number of users that will be kicked, without actually doing it
   * @param {string} [reason] Reason for this prune
   * @returns {Promise<number>} The number of members that were/will be kicked
   * @example
   * // See how many members will be pruned
   * guild.pruneMembers(12, true)
   *   .then(pruned => console.log(`This will prune ${pruned} people!`))
   *   .catch(console.error);
   * @example
   * // Actually prune the members
   * guild.pruneMembers(12)
   *   .then(pruned => console.log(`I just pruned ${pruned} people!`))
   *   .catch(console.error);
   */
  pruneMembers(days, dry = false, reason) {
    if (typeof days !== 'number') throw new TypeError('Days must be a number.');
    return this.client.rest.methods.pruneGuildMembers(this, days, dry, reason);
  }

  /**
   * Syncs this guild (already done automatically every 30 seconds).
   * <warn>This is only available when using a user account.</warn>
   * @deprecated
   */
  sync() {
    if (!this.client.user.bot) this.client.syncGuilds([this]);
  }

  /**
   * Overwrites to use when creating a channel or replacing overwrites
   * @typedef {Object} ChannelCreationOverwrites
   * @property {PermissionResolvable} [allow] The permissions to allow
   * @property {PermissionResolvable} [allowed] The permissions to allow
   * **(deprecated)**
   * @property {PermissionResolvable} [deny] The permissions to deny
   * @property {PermissionResolvable} [denied] The permissions to deny
   * **(deprecated)**
   * @property {GuildMemberResolvable|RoleResolvable} id Member or role this overwrite is for
   */

  /**
   * Creates a new channel in the guild.
   * @param {string} name The name of the new channel
   * @param {string|ChannelData} [typeOrOptions='text']
   * The type of the new channel, one of `text`, `voice`, `category`, `news`, or `store`. **(deprecated, use options)**
   * Alternatively options for the new channel, overriding the following parameters.
   * @param {ChannelCreationOverwrites[]|Collection<Snowflake, PermissionOverwrites>} [permissionOverwrites]
   * Permission overwrites **(deprecated, use options)**
   * @param {string} [reason] Reason for creating this channel **(deprecated, use options)**
   * @returns {Promise<CategoryChannel|TextChannel|VoiceChannel>}
   * @example
   * // Create a new text channel
   * guild.createChannel('new-general', { type: 'text' })
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Create a new category channel with permission overwrites
   * guild.createChannel('new-category', {
   *   type: 'category',
   *   permissionOverwrites: [{
   *     id: guild.id,
   *     deny: ['MANAGE_MESSAGES'],
   *     allow: ['SEND_MESSAGES']
   *   }]
   * })
   *   .then(console.log)
   *   .catch(console.error);
   */
  createChannel(name, typeOrOptions, permissionOverwrites, reason) {
    if (!typeOrOptions || (typeof typeOrOptions === 'string')) {
      if (typeOrOptions) {
        process.emitWarning(
          'Guild#createChannel: Create channels with an options object instead of separate parameters',
          'DeprecationWarning'
        );
      }
      typeOrOptions = {
        type: typeOrOptions,
        permissionOverwrites,
        reason,
      };
    }
    return this.client.rest.methods.createChannel(this, name, typeOrOptions);
  }

  /**
   * The data needed for updating a channel's position.
   * @typedef {Object} ChannelPosition
   * @property {ChannelResolvable} channel Channel to update
   * @property {number} position New position for the channel
   */

  /**
   * Batch-updates the guild's channels' positions.
   * @param {ChannelPosition[]} channelPositions Channel positions to update
   * @returns {Promise<Guild>}
   * @example
   * guild.updateChannels([{ channel: channelID, position: newChannelIndex }])
   *   .then(g => console.log(`Updated channel positions for ${g}`))
   *   .catch(console.error);
   */
  setChannelPositions(channelPositions) {
    channelPositions = channelPositions.map(({ channel, position }) => ({ id: channel.id || channel, position }));
    return this.client.rest.methods.setChannelPositions(this.id, channelPositions);
  }

  /**
   * The data needed for updating a role's position.
   * @typedef {Object} RolePosition
   * @property {RoleResolvable} role Role to update
   * @property {number} position New position for the role
   */

  /**
   * Batch-updates the guild's role's positions.
   * @param {RolePosition[]} rolePositions Role positions to update
   * @returns {Promise<Guild>}
   */
  setRolePositions(rolePositions) {
    rolePositions = rolePositions.map(({ role, position }) => ({ id: role.id || role, position }));
    return this.client.rest.methods.setRolePositions(this.id, rolePositions);
  }

  /**
   * Edits the guild's embed.
   * @param {GuildEmbedData} embed The embed for the guild
   * @param {string} [reason] Reason for changing the guild's embed
   * @returns {Promise<Guild>}
   */
  setEmbed(embed, reason) {
    return this.client.rest.methods.updateEmbed(this.id, embed, reason)
      .then(() => this);
  }

  /**
   * Creates a new role in the guild with given information.
   * @param {RoleData} [data] The data to update the role with
   * @param {string} [reason] Reason for creating this role
   * @returns {Promise<Role>}
   * @example
   * // Create a new role
   * guild.createRole()
   *   .then(role => console.log(`Created new role with name ${role.name}`))
   *   .catch(console.error);
   * @example
   * // Create a new role with data
   * guild.createRole({
   *   name: 'Super Cool People',
   *   color: 'BLUE',
   * })
   *   .then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`))
   *   .catch(console.error)
   */
  createRole(data = {}, reason) {
    return this.client.rest.methods.createGuildRole(this, data, reason);
  }

  /**
   * Creates a new custom emoji in the guild.
   * @param {BufferResolvable|Base64Resolvable} attachment The image for the emoji
   * @param {string} name The name for the emoji
   * @param {Collection<Snowflake, Role>|Role[]} [roles] Roles to limit the emoji to
   * @param {string} [reason] Reason for creating the emoji
   * @returns {Promise<Emoji>} The created emoji
   * @example
   * // Create a new emoji from a url
   * guild.createEmoji('https://i.imgur.com/w3duR07.png', 'rip')
   *   .then(emoji => console.log(`Created new emoji with name ${emoji.name}`))
   *   .catch(console.error);
   * @example
   * // Create a new emoji from a file on your computer
   * guild.createEmoji('./memes/banana.png', 'banana')
   *   .then(emoji => console.log(`Created new emoji with name ${emoji.name}`))
   *   .catch(console.error);
   */
  createEmoji(attachment, name, roles, reason) {
    if (typeof attachment === 'string' && attachment.startsWith('data:')) {
      return this.client.rest.methods.createEmoji(this, attachment, name, roles, reason);
    } else {
      return this.client.resolver.resolveImage(attachment).then(data =>
        this.client.rest.methods.createEmoji(this, data, name, roles, reason)
      );
    }
  }

  /**
   * Delete an emoji.
   * @param {Emoji|string} emoji The emoji to delete
   * @param {string} [reason] Reason for deleting the emoji
   * @returns {Promise}
   * @deprecated
   */
  deleteEmoji(emoji, reason) {
    if (typeof emoji === 'string') emoji = this.emojis.get(emoji);
    if (!(emoji instanceof Emoji)) throw new TypeError('Emoji must be either an instance of Emoji or an ID');
    return emoji.delete(reason);
  }

  /**
   * Causes the client to leave the guild.
   * @returns {Promise<Guild>}
   * @example
   * // Leave a guild
   * guild.leave()
   *   .then(g => console.log(`Left the guild ${g}`))
   *   .catch(console.error);
   */
  leave() {
    return this.client.rest.methods.leaveGuild(this);
  }

  /**
   * Causes the client to delete the guild.
   * @returns {Promise<Guild>}
   * @example
   * // Delete a guild
   * guild.delete()
   *   .then(g => console.log(`Deleted the guild ${g}`))
   *   .catch(console.error);
   */
  delete() {
    return this.client.rest.methods.deleteGuild(this);
  }

  /**
   * Whether this guild equals another guild. It compares all properties, so for most operations
   * it is advisable to just compare `guild.id === guild2.id` as it is much faster and is often
   * what most users need.
   * @param {Guild} guild The guild to compare with
   * @returns {boolean}
   */
  equals(guild) {
    let equal =
      guild &&
      this.id === guild.id &&
      this.available === !guild.unavailable &&
      this.splash === guild.splash &&
      this.region === guild.region &&
      this.name === guild.name &&
      this.memberCount === guild.member_count &&
      this.large === guild.large &&
      this.icon === guild.icon &&
      Util.arraysEqual(this.features, guild.features) &&
      this.ownerID === guild.owner_id &&
      this.verificationLevel === guild.verification_level &&
      this.embedEnabled === guild.embed_enabled;

    if (equal) {
      if (this.embedChannel) {
        if (this.embedChannel.id !== guild.embed_channel_id) equal = false;
      } else if (guild.embed_channel_id) {
        equal = false;
      }
    }

    return equal;
  }

  /**
   * When concatenated with a string, this automatically concatenates the guild's name instead of the guild object.
   * @returns {string}
   * @example
   * // Logs: Hello from My Guild!
   * console.log(`Hello from ${guild}!`);
   * @example
   * // Logs: Hello from My Guild!
   * console.log('Hello from ' + guild + '!');
   */
  toString() {
    return this.name;
  }

  _addMember(guildUser, emitEvent = true) {
    const existing = this.members.has(guildUser.user.id);
    if (!(guildUser.user instanceof User)) guildUser.user = this.client.dataManager.newUser(guildUser.user);

    guildUser.joined_at = guildUser.joined_at || 0;
    const member = new GuildMember(this, guildUser);
    this.members.set(member.id, member);

    if (this._rawVoiceStates && this._rawVoiceStates.has(member.user.id)) {
      const voiceState = this._rawVoiceStates.get(member.user.id);
      member.serverMute = voiceState.mute;
      member.serverDeaf = voiceState.deaf;
      member.selfMute = voiceState.self_mute;
      member.selfDeaf = voiceState.self_deaf;
      member.voiceSessionID = voiceState.session_id;
      member.voiceChannelID = voiceState.channel_id;
      if (this.client.channels.has(voiceState.channel_id)) {
        this.client.channels.get(voiceState.channel_id).members.set(member.user.id, member);
      } else {
        this.client.emit('warn', `Member ${member.id} added in guild ${this.id} with an uncached voice channel`);
      }
    }

    /**
     * Emitted whenever a user joins a guild.
     * @event Client#guildMemberAdd
     * @param {GuildMember} member The member that has joined a guild
     */
    if (this.client.ws.connection.status === Constants.Status.READY && emitEvent && !existing) {
      this.client.emit(Constants.Events.GUILD_MEMBER_ADD, member);
    }

    return member;
  }

  _updateMember(member, data) {
    const oldMember = Util.cloneObject(member);

    if (data.roles) member._roles = data.roles;
    if (typeof data.nick !== 'undefined') member.nickname = data.nick;

    const notSame = member.nickname !== oldMember.nickname || !Util.arraysEqual(member._roles, oldMember._roles);

    if (this.client.ws.connection.status === Constants.Status.READY && notSame) {
      /**
       * Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
       * @event Client#guildMemberUpdate
       * @param {GuildMember} oldMember The member before the update
       * @param {GuildMember} newMember The member after the update
       */
      this.client.emit(Constants.Events.GUILD_MEMBER_UPDATE, oldMember, member);
    }

    return {
      old: oldMember,
      mem: member,
    };
  }

  _removeMember(guildMember) {
    if (guildMember.voiceChannel) guildMember.voiceChannel.members.delete(guildMember.id);
    this.members.delete(guildMember.id);
  }

  _memberSpeakUpdate(user, speaking) {
    const member = this.members.get(user);
    if (member && member.speaking !== speaking) {
      member.speaking = speaking;
      /**
       * Emitted once a guild member starts/stops speaking.
       * @event Client#guildMemberSpeaking
       * @param {GuildMember} member The member that started/stopped speaking
       * @param {boolean} speaking Whether or not the member is speaking
       */
      this.client.emit(Constants.Events.GUILD_MEMBER_SPEAKING, member, speaking);
    }
  }

  _setPresence(id, presence) {
    if (this.presences.get(id)) {
      this.presences.get(id).update(presence);
      return;
    }
    this.presences.set(id, new Presence(presence, this.client));
  }

  /**
   * Set the position of a role in this guild.
   * @param {string|Role} role The role to edit, can be a role object or a role ID
   * @param {number} position The new position of the role
   * @param {boolean} [relative=false] Position Moves the role relative to its current position
   * @returns {Promise<Guild>}
   */
  setRolePosition(role, position, relative = false) {
    if (typeof role === 'string') {
      role = this.roles.get(role);
      if (!role) return Promise.reject(new Error('Supplied role is not a role or snowflake.'));
    }

    position = Number(position);
    if (isNaN(position)) return Promise.reject(new Error('Supplied position is not a number.'));

    let updatedRoles = this._sortedRoles.array();

    Util.moveElementInArray(updatedRoles, role, position, relative);

    updatedRoles = updatedRoles.map((r, i) => ({ id: r.id, position: i }));
    return this.client.rest.methods.setRolePositions(this.id, updatedRoles);
  }

  /**
   * Set the position of a channel in this guild.
   * @param {string|GuildChannel} channel The channel to edit, can be a channel object or a channel ID
   * @param {number} position The new position of the channel
   * @param {boolean} [relative=false] Position Moves the channel relative to its current position
   * @returns {Promise<Guild>}
   */
  setChannelPosition(channel, position, relative = false) {
    if (typeof channel === 'string') {
      channel = this.channels.get(channel);
      if (!channel) return Promise.reject(new Error('Supplied channel is not a channel or snowflake.'));
    }

    position = Number(position);
    if (isNaN(position)) return Promise.reject(new Error('Supplied position is not a number.'));

    let updatedChannels = this._sortedChannels(channel.type).array();

    Util.moveElementInArray(updatedChannels, channel, position, relative);

    updatedChannels = updatedChannels.map((c, i) => ({ id: c.id, position: i }));
    return this.client.rest.methods.setChannelPositions(this.id, updatedChannels);
  }

  /**
   * Fetches a collection of channels in the current guild sorted by position.
   * @param {string} type The channel type
   * @returns {Collection<Snowflake, GuildChannel>}
   * @private
   */
  _sortedChannels(type) {
    return this._sortPositionWithID(this.channels.filter(c => {
      if (type === 'voice' && c.type === 'voice') return true;
      else if (type !== 'voice' && c.type !== 'voice') return true;
      else return type === c.type;
    }));
  }

  /**
   * Sorts a collection by object position or ID if the positions are equivalent.
   * Intended to be identical to Discord's sorting method.
   * @param {Collection} collection The collection to sort
   * @returns {Collection}
   * @private
   */
  _sortPositionWithID(collection) {
    return collection.sort((a, b) =>
      a.position !== b.position ?
        a.position - b.position :
        Long.fromString(b.id).sub(Long.fromString(a.id)).toNumber()
    );
  }
}

/**
 * The `#general` TextChannel of the guild
 * @name Guild#defaultChannel
 * @type {TextChannel}
 * @readonly
 * @deprecated
 */
Object.defineProperty(Guild.prototype, 'defaultChannel', {
  get: util.deprecate(function defaultChannel() {
    return this.channels.get(this.id);
  }, 'Guild#defaultChannel: This property is obsolete, will be removed in v12.0.0, and may not function as expected.'),
});

Guild.prototype.allowDMs =
  util.deprecate(Guild.prototype.allowDMs, 'Guild#allowDMs: userbot methods will be removed');

Guild.prototype.acknowledge =
  util.deprecate(Guild.prototype.acknowledge, 'Guild#acknowledge: userbot methods will be removed');

Guild.prototype.setPosition =
  util.deprecate(Guild.prototype.setPosition, 'Guild#setPosition: userbot methods will be removed');

Guild.prototype.search =
  util.deprecate(Guild.prototype.search, 'Guild#search: userbot methods will be removed');

Guild.prototype.sync =
  util.deprecate(Guild.prototype.sync, 'Guild#sync:, userbot methods will be removed');

Guild.prototype.deleteEmoji =
  util.deprecate(Guild.prototype.deleteEmoji, 'Guild#deleteEmoji: use Emoji#delete instead');

module.exports = Guild;
