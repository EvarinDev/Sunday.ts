import { TypedEmitter } from "tiny-typed-emitter";
import type { ManagerEventEmitter, ManagerOptions } from "../types/Manager";
import { Node } from "./Node";
import type { PlayerCreate } from "../types/Player";
import { Player } from "./Player";
import { Collection } from "@discordjs/collection";
import type { VoiceState } from "discord.js";
import type { VoicePacket, VoiceServer } from "../types/Discord";

export class Manager extends TypedEmitter<ManagerEventEmitter> {
    options: ManagerOptions;
    public readonly players = new Collection<string, Player>();
    public readonly nodes = new Collection<string, Node>();
    constructor(options: ManagerOptions) {
        super();
        this.options = options;
        for (const node of options.nodes) {
            this.nodes.set(node.host, new Node(node));
        }
    }

    private get priorityNode(): Node {
        const filteredNodes = this.nodes.filter((node) => node.connected && node.options.priority > 0);
        const totalWeight = filteredNodes.reduce((total, node) => total + node.options.priority, 0);
        const weightedNodes = filteredNodes.map((node) => ({
            node,
            weight: node.options.priority / totalWeight,
        }));
        const randomNumber = Math.random();

        let cumulativeWeight = 0;

        for (const { node, weight } of weightedNodes) {
            cumulativeWeight += weight;
            if (randomNumber <= cumulativeWeight) {
                return node;
            }
        }

        return this.options.useNode === "leastLoad" ? this.leastLoadNode.first() : this.leastPlayersNode.first();
    }

    private get leastLoadNode(): Collection<string, Node> {
        return this.nodes
            .filter((node) => node.connected)
            .sort((a, b) => {
                const aload = a.stats.cpu ? (a.stats.cpu.lavalinkLoad / a.stats.cpu.cores) * 100 : 0;
                const bload = b.stats.cpu ? (b.stats.cpu.lavalinkLoad / b.stats.cpu.cores) * 100 : 0;
                return aload - bload;
            });
    }

    private get leastPlayersNode(): Collection<string, Node> {
        return this.nodes.filter((node) => node.connected).sort((a, b) => a.stats.players - b.stats.players);
    }

    public get useableNodes(): Node {
        return this.options.usePriority ? this.priorityNode : this.options.useNode === "leastLoad" ? this.leastLoadNode.first() : this.leastPlayersNode.first();
    }

    public create(options: PlayerCreate): Player {
        if (this.players.has(options.guild_id)) {
            return this.players.get(options.guild_id);
        }

        return new Player(this, options);
    }

    public init() {
        this.emit("raw", "Manager initialized");
        for (const node of this.nodes.values()) {
            try {
                node.on("connect", () => {
                    this.emit("NodeConnect", node);
                }).on("disconnect", () => {
                    this.emit("NodeDisconnect", node);
                }).on("error", (err) => {
                    this.emit("NodeError", node, err);
                }).on("stats", (stats) => {
                    this.emit("NodeStats", node, stats);
                }).on("ready", () => {
                    this.emit("NodeReady", node);
                }).on("raw", (data) => {
                    this.emit("NodeRaw", node, data);
                });
                node.connect();
            } catch (err) {
                this.emit("NodeError", node, err);
            }
        }
    }
    public async updateVoiceState(data: VoicePacket | VoiceServer | VoiceState): Promise<void> {
		if ("t" in data && !["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(data.t)) return;
		const update = "d" in data ? data.d : data;
		if (!update || (!("token" in update) && !("session_id" in update))) return;
		const player = this.players.get(update.guild_id);
		if (!player) return;
		if ("token" in update) {
            // @ts-ignore
            if (!player.voiceState) player.voiceState = { event: {} };
            player.voiceState.event = update;
        
            const {
                sessionId,
                event: { token, endpoint },
            } = player.voiceState;
            console.log(player.voiceState)
            await player.node.rest.updatePlayer({
                guildId: player.guild_id,
                data: { voice: { token, endpoint, sessionId } },
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