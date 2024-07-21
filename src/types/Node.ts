/* The `interface NodeEventEmitter` is defining a structure for an object that can emit specific events
related to a Node. It specifies four event types along with their corresponding callback functions: */
interface NodeEventEmitter {
    ready: () => void;
    raw: (data: unknown) => void;
    stats: (stats: NodeStats) => void;
    connect: () => void;
    error(error: Error): void;
    disconnect: (data: unknown) => void;
}

/* The `interface NodeConfig` is defining a structure for configuring a Node. It specifies the
properties that can be set for a Node, including the host (as a string), port (as a number),
password (as a string), and an optional property secure (as a boolean). This interface provides a
blueprint for creating objects that hold configuration settings for a Node. */
interface NodeConfig {
    host: string;
    port: number;
    password: string;
    secure?: boolean;
    clientName?: string;
    version?: number;
    priority?: number;
    resumeStatus?: string;
    resumeTimeout?: number;
}

/* The `interface NodeStats` is defining a structure for representing statistical data related to a
Node. It includes various properties such as `frameStats`, `players`, `playingPlayers`, `uptime`,
`memory`, and `cpu`. Each property has a specific data type associated with it: */
interface NodeStats {
    frameStats: {
        sent: number,
        nulled: number,
        deficit: number
    },
    players: number,
    playingPlayers: number,
    uptime: number,
    memory: {
        free: number,
        used: number,
        allocated: number,
        reservable: number,
    },
    cpu: {
        cores: number,
        systemLoad: number,
        lavalinkLoad: number,
    },
}

export type {
    NodeEventEmitter,
    NodeConfig,
    NodeStats
}