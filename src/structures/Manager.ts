/* eslint-disable no-async-promise-executor */
import { Collection } from "@discordjs/collection";
import { VoiceState } from "..";
import { Node } from "./Node";
import { Player, PlayerOptions, Track } from "./Player";
import {
    LoadTypeV3,
    LoadTypeV4,
    Plugin,
    Structure,
    TrackData,
    TrackUtils,
    VoicePacket,
    VoiceServer,
} from "./Utils";
import { TypedEmitter } from "tiny-typed-emitter";
import { ManagerEventEmitter } from "../types/Manager";
import { NodeOptions } from "../types/Node";

const REQUIRED_KEYS = ["event", "guildId", "op", "sessionId"];

function check(options: ManagerOptions) {
    if (!options) throw new TypeError("ManagerOptions must not be empty.");

    if (typeof options.send !== "function")
        throw new TypeError('Manager option "send" must be present and a function.');

    if (
        typeof options.clientId !== "undefined" &&
        !/^\d+$/.test(options.clientId)
    )
        throw new TypeError('Manager option "clientId" must be a non-empty string.');

    if (
        typeof options.nodes !== "undefined" &&
        !Array.isArray(options.nodes)
    )
        throw new TypeError('Manager option "nodes" must be a array.');

    if (
        typeof options.shards !== "undefined" &&
        typeof options.shards !== "number"
    )
        throw new TypeError('Manager option "shards" must be a number.');

    if (
        typeof options.plugins !== "undefined" &&
        !Array.isArray(options.plugins)
    )
        throw new TypeError('Manager option "plugins" must be a Plugin array.');

    if (
        typeof options.autoPlay !== "undefined" &&
        typeof options.autoPlay !== "boolean"
    )
        throw new TypeError('Manager option "autoPlay" must be a boolean.');

    if (
        typeof options.trackPartial !== "undefined" &&
        !Array.isArray(options.trackPartial)
    )
        throw new TypeError('Manager option "trackPartial" must be a string array.');

    if (
        typeof options.clientName !== "undefined" &&
        typeof options.clientName !== "string"
    )
        throw new TypeError('Manager option "clientName" must be a string.');

    if (
        typeof options.defaultSearchPlatform !== "undefined" &&
        typeof options.defaultSearchPlatform !== "string"
    )
        throw new TypeError('Manager option "defaultSearchPlatform" must be a string.');
}

export class Manager extends TypedEmitter<ManagerEventEmitter> {
    public static readonly DEFAULT_SOURCES: Record<SearchPlatform, string> = {
        "youtube music": "ytmsearch",
        "youtube": "ytsearch",
        "soundcloud": "scsearch"
    }

    /** The map of players. */
    public readonly players = new Collection<string, Player>();
    /** The map of nodes. */
    public readonly nodes = new Collection<string, Node>();
    /** The options that were set. */
    public readonly options: ManagerOptions;
    private initiated = false;

    /** Returns the least used Nodes. */
    public get leastUsedNodes(): Collection<string, Node> {
        return this.nodes
            .filter((node) => node.connected)
            .sort((a, b) => b.calls - a.calls);
    }

    /** Returns the least system load Nodes. */
    public get leastLoadNodes(): Collection<string, Node> {
        return this.nodes
            .filter((node) => node.connected)
            .sort((a, b) => {
                const aload = a.stats.cpu
                    ? (a.stats.cpu.systemLoad / a.stats.cpu.cores) * 100
                    : 0;
                const bload = b.stats.cpu
                    ? (b.stats.cpu.systemLoad / b.stats.cpu.cores) * 100
                    : 0;
                return aload - bload;
            });
    }

    /**
     * Initiates the Manager class.
     * @param options
     */
    constructor(options: ManagerOptions) {
        super();

        check(options);

        Structure.get("Player").init(this);
        Structure.get("Node").init(this);
        TrackUtils.init(this);

        if (options.trackPartial) {
            TrackUtils.setTrackPartial(options.trackPartial);
            delete options.trackPartial;
        }

        this.options = {
            plugins: [],
            nodes: [
                { identifier: "default", host: "localhost" }
            ],
            shards: 1,
            autoPlay: true,
            clientName: "Sunday.ts",
            defaultSearchPlatform: "youtube",
            ...options,
        };

        if (this.options.plugins) {
            for (const [index, plugin] of this.options.plugins.entries()) {
                if (!(plugin instanceof Plugin))
                    throw new RangeError(`Plugin at index ${index} does not extend Plugin.`);
                plugin.load(this);
            }
        }

        if (this.options.nodes) {
            this.options.nodes.forEach((nodeOptions, index) => {
                const node = new (Structure.get("Node"))(nodeOptions);
                this.nodes.set(index.toString(), node);
            });
        }
    }

    /**
     * Initiates the Manager.
     * @param clientId
     */
    public init(clientId?: string): this {
        if (this.initiated) return this;
        if (typeof clientId !== "undefined") this.options.clientId = clientId;

        if (typeof this.options.clientId !== "string")
            throw new Error('"clientId" set is not type of "string"');

        if (!this.options.clientId)
            throw new Error(
                '"clientId" is not set. Pass it in Manager#init() or as a option in the constructor.'
            );

        for (const node of this.nodes.values()) {
            try {
                node.connect();
            } catch (err) {
                this.emit("NodeError", node, err);
            }
        }

        this.initiated = true;
        return this;
    }

    /**
     * Searches the enabled sources based off the URL or the `source` property.
     * @param query
     * @param requester
     * @returns The search result.
     */
    public async search(
        query: string | SearchQuery,
        requester?: unknown
    ): Promise<SearchResult> {
        const node = this.leastUsedNodes.first();
        if (!node) throw new Error("No available nodes.");
    
        const _query: SearchQuery = typeof query === "string" ? { query } : query;
        const _source = Manager.DEFAULT_SOURCES[_query.source ?? this.options.defaultSearchPlatform] ?? _query.source;
    
        let search = _query.query;
        if (!/^https?:\/\//.test(search)) {
            search = `${_source}:${search}`;
        }
    
        try {
            const res = await node.rest.get(`/loadtracks?identifier=${encodeURIComponent(search)}`);
    
            if (!res) {
                throw new Error("Query not found.");
            }
    
            const result: SearchResult = {
                loadType: res.loadType,
                exception: res.exception ?? null,
                tracks: res.tracks?.map((track: TrackData) =>
                    TrackUtils.build(track, requester)
                ) ?? [],
            };
    
            if (result.loadType === "PLAYLIST_LOADED") {
                result.playlist = {
                    name: res.playlistInfo.name,
                    selectedTrack: res.playlistInfo.selectedTrack === -1 ? null :
                        TrackUtils.build(
                            res.tracks[res.playlistInfo.selectedTrack],
                            requester
                        ),
                    duration: result.tracks
                        .reduce((acc: number, cur: Track) => acc + (cur.duration || 0), 0),
                };
            }
    
            return result;
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }    
    /**
     * Decodes the base64 encoded tracks and returns a TrackData array.
     * @param tracks
     */
    public decodeTracks(tracks: string[]): Promise<TrackData[]> {
        return new Promise(async (resolve, reject) => {
            const node = this.nodes.first();
            if (!node) throw new Error("No available nodes.");
            const res = await node.rest.post(`/decodetracks`, JSON.stringify(tracks))
            if (!res) {
                return reject(new Error("No data returned from query."));
            }
            return res;
        });
    }

    /**
     * Decodes the base64 encoded track and returns a TrackData.
     * @param track
     */
    public async decodeTrack(track: string): Promise<TrackData> {
        const res = await this.decodeTracks([track]);
        return res[0];
    }

    /**
     * Creates a player or returns one if it already exists.
     * @param options
     */
    public create(options: PlayerOptions): Player {
        if (this.players.has(options.guild)) {
            return this.players.get(options.guild);
        }

        return new (Structure.get("Player"))(options);
    }

    /**
     * Returns a player or undefined if it does not exist.
     * @param guild
     */
    public get(guild: string): Player | undefined {
        return this.players.get(guild);
    }

    /**
     * Destroys a player if it exists.
     * @param guild
     */
    public destroy(guild: string): void {
        this.players.delete(guild);
    }

    /**
     * Creates a node or returns one if it already exists.
     * @param options
     */
    public createNode(options: NodeOptions): Node {
        if (this.nodes.has(options.identifier || options.host)) {
            return this.nodes.get(options.identifier || options.host);
        }

        return new (Structure.get("Node"))(options);
    }

    /**
     * Destroys a node if it exists.
     * @param identifier
     */
    public destroyNode(identifier: string): void {
        const node = this.nodes.get(identifier);
        if (!node) return;
        node.destroy()
        this.nodes.delete(identifier)
    }

    /**
     * Sends voice data to the Lavalink server.
     * @param data
     */
    public async updateVoiceState(data: VoicePacket | VoiceServer | VoiceState): Promise<void> {
		if ("t" in data && !["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(data.t)) return;

		const update = "d" in data ? data.d : data;

		if (!update || (!("token" in update) && !("session_id" in update))) return;

		const player = this.players.get(update.guild_id);

		if (!player) return;
		if ("token" in update) {
			player.voiceState.event = update;

			const {
				event: { token, endpoint },
			} = player.voiceState;

			await player.node.rest.updatePlayer({
				guildId: player.guild,
				data: { voice: { token, endpoint, sessionId: player.sessionId } },
			});

			return;
		}

		if (update.user_id !== this.options.clientId) return;
		if (update.channel_id) {
			if (player.voiceChannel !== update.channel_id) {
				this.emit("PlayerMove", player, player.voiceChannel, update.channel_id);
			}

			player.voiceState.sessionId = update.session_id;
			player.voiceChannel = update.channel_id;
			return;
		}

		this.emit("PlayerDisconnect", player, player.voiceChannel);
		player.voiceChannel = null;
		player.voiceState = Object.assign({});
		player.destroy();
		return;
	}
}

export interface Payload {
    /** The OP code */
    op: number;
    d: {
        guild_id: string;
        channel_id: string | null;
        self_mute: boolean;
        self_deaf: boolean;
    };
}

export interface ManagerOptions {
    /** The array of nodes to connect to. */
    nodes?: NodeOptions[];
    /** The client ID to use. */
    clientId?: string;
    /** Value to use for the `Client-Name` header. */
    clientName?: string;
    /** The shard count. */
    shards?: number;
    /** A array of plugins to use. */
    plugins?: Plugin[];
    /** Whether players should automatically play the next song. */
    autoPlay?: boolean;
    /** An array of track properties to keep. `track` will always be present. */
    trackPartial?: string[];
    /** The default search platform to use, can be "youtube", "youtube music", or "soundcloud". */
    defaultSearchPlatform?: SearchPlatform;
    /**
     * Function to send data to the websocket.
     * @param id
     * @param payload
     */
    send(id: string, payload: Payload): void;
}

export type SearchPlatform = "youtube" | "youtube music" | "soundcloud";

export interface SearchQuery {
    /** The source to search from. */
    source?: SearchPlatform | string;
    /** The query to search for. */
    query: string;
}

export interface SearchResult {
    /** The load type of the result. */
    loadType:  LoadTypeV3 | LoadTypeV4;
    /** The array of tracks from the result. */
    tracks: Track[];
    /** The playlist info if the load type is PLAYLIST_LOADED. */
    playlist?: PlaylistInfo;
    /** The exception when searching if one. */
    exception?: {
        /** The message for the exception. */
        message: string;
        /** The severity of exception. */
        severity: string;
    };
}

export interface PlaylistInfo {
    /** The playlist name. */
    name: string;
    /** The playlist selected track. */
    selectedTrack?: Track;
    /** The duration of the playlist. */
    duration: number;
}

export interface LavalinkResult {
    tracks: TrackData[];
    loadType: LoadTypeV3 | LoadTypeV4;
    exception?: {
        /** The message for the exception. */
        message: string;
        /** The severity of exception. */
        severity: string;
    };
    playlistInfo: {
        name: string;
        selectedTrack?: number;
    };
}
