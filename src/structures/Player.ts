import type { VoiceState } from "../types/Discord";
import type { PlayerCreate } from "../types/Player";
import type { Manager } from "./Manager";
import type { Node } from "./Node";
import { Queue } from "./Queue";

export class Player {
    manager: Manager;
    options: PlayerCreate;
    node: Node;
    voiceChannel: string;
    state: "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "DISCONNECTING" | "DESTROYING" = "DISCONNECTED";
    guild_id: string;
    public voiceState: VoiceState;
    paused: boolean = false;
    playing: boolean = false;
    textChannel: string
    public readonly queue = new Queue();
    constructor(manager: Manager, options: PlayerCreate) {
        this.manager = manager;
        if (!this.manager) throw new RangeError("Manager has not been initiated.");
        this.options = options;
        this.voiceChannel = options.voiceChannel;
        this.voiceState = Object.assign({
			op: "voiceUpdate",
			guild_id: options.guild_id,
		});
        if (options.voiceChannel) this.voiceChannel = options.voiceChannel;
		if (options.textChannel) this.textChannel = options.textChannel;
        const node = this.manager.nodes.get(options.node);
		this.node = node || this.manager.useableNodes;
		if (!this.node) throw new RangeError("No available nodes.");
        this.guild_id = options.guild_id;
        this.manager.players.set(options.guild_id, this);
        this.manager.emit("PlayerCreate", this);
    }

    public connect(): this {
		if (!this.voiceChannel) throw new RangeError("No voice channel has been set.");
		this.state = "CONNECTING";

		this.manager.options.send(this.guild_id, {
			op: 4,
			d: {
				guild_id: this.guild_id,
				channel_id: this.voiceChannel,
				self_mute: this.options.selfMute || false,
				self_deaf: this.options.selfDeafen || false,
			},
		});

		this.state = "CONNECTED";
		return this;
	}
    public disconnect(): this {
		if (this.voiceChannel === null) return this;
		this.state = "DISCONNECTING";

		this.pause(true);
		this.manager.options.send(this.guild_id, {
			op: 4,
			d: {
				guild_id: this.guild_id,
				channel_id: null,
				self_mute: false,
				self_deaf: false,
			},
		});

		this.voiceChannel = null;
		this.state = "DISCONNECTED";
		return this;
	}

	/** Destroys the player. */
	public destroy(disconnect = true): void {
		this.state = "DESTROYING";

		if (disconnect) {
			this.disconnect();
		}

		//this.node.rest.destroyPlayer(this.guild);
		this.manager.emit("PlayerDestroy", this);
		this.manager.players.delete(this.guild_id);
	}
    public pause(pause: boolean): this {
		if (typeof pause !== "boolean") throw new RangeError('Pause can only be "true" or "false".');

		if (this.paused === pause || !this.queue.totalSize) return this;

		const oldPlayer = { ...this };

		this.playing = !pause;
		this.paused = pause;

		this.node.rest.updatePlayer({
			guildId: this.guild_id,
			data: {
				paused: pause,
			},
		});

		this.manager.emit("PlayerStateUpdate", oldPlayer, this);
		return this;
	}
}