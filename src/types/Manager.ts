import type { Node } from "../structures/Node";
import type { Player } from "../structures/Player";
import type { NodeConfig, NodeStats } from "./Node";

/* The `ManagerEventEmitter` interface is defining a set of event listener functions that can be used
to handle various events related to nodes and players in a manager system. Each property in the
interface represents a specific event type along with the expected parameters and return type of the
event handler function. */
interface ManagerEventEmitter {
    NodeConnect: (node: Node) => void;
    NodeDisconnect: (node: Node) => void;
    NodeError: (node: Node, error: Error) => void;
    NodeStats: (node: Node, stats: NodeStats) => void;
    NodeReady: (node: Node) => void;
    NodeRaw: (node: Node, data: unknown) => void;
    PlayerCreate: (player: Player) => void;
    PlayerDestroy: (player: Player) => void;
    PlayerConnect: (player: Player) => void;
    PlayerDisconnect: (player: Player, voiceChannel: string) => void;
    PlayerError: (player: Player, error: Error) => void;
    PlayerUpdate: (player: Player, state: unknown) => void;
    PlayerVoiceUpdate: (player: Player, state: unknown) => void;
    PlayerMove: (player: Player, oldChannel: string, newChannel: string) => void;
    PlayerStateUpdate: (player: Player, state: unknown) => void;
    raw: (data: unknown) => void;
}

interface Payload {
    op: number;
    d: {
        guild_id: string;
        channel_id: string;
        self_mute: boolean;
        self_deaf: boolean;
    }
}

/* The `ManagerOptions` interface is defining a set of properties that can be used when creating an
instance of a manager. Here's what each property does: */
interface ManagerOptions {
    nodes: NodeConfig[];
    clientName?: string;
    usePriority?: boolean;
    clientId: string;
    useNode?: "leastLoad" | "leastPlayers";
    send: (guild_id: string, payload: Payload) => void;
}

export type {
    ManagerEventEmitter,
    ManagerOptions
}