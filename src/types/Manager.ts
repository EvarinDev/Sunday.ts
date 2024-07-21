import { Node } from "../structures/Node";
import { Player, Track, UnresolvedTrack } from "../structures/Player";
import { TrackEndEvent, TrackExceptionEvent, TrackStartEvent, TrackStuckEvent, WebSocketClosedEvent } from "../structures/Utils";

export interface ManagerEventEmitter {
    NodeReady: (node: Node) => void;
    /**
     * Emitted when a Node is created.
     * @event Manager#NodeCreate
     */
    NodeCreate: (node: Node) => void;

    /**
     * Emitted when a Node is destroyed.
     * @event Manager#NodeDestroy
     */
    NodeDestroy: (node: Node) => void;

    /**
     * Emitted when a Node connects.
     * @event Manager#NodeConnect
     */
    NodeConnect: (node: Node) => void;

    /**
     * Emitted when a Node reconnects.
     * @event Manager#NodeReconnect
     */
    NodeReconnect: (node: Node) => void;

    /**
     * Emitted when a Node disconnects.
     * @event Manager#NodeDisconnect
     */
    NodeDisconnect: (node: Node, reason: { code: number; reason: string }) => void;

    /**
     * Emitted when a Node has an error.
     * @event Manager#NodeError
     */
    NodeError: (node: Node, error: Error) => void;

    /**
     * Emitted whenever any Lavalink event is received.
     * @event Manager#NodeRaw
     */
    NodeRaw: (payload: unknown) => void;

    /**
     * Emitted when a player is created.
     * @event Manager#playerCreate
     */
    PlayerCreate: (player: Player) => void;

    /**
     * Emitted when a player is destroyed.
     * @event Manager#playerDestroy
     */
    PlayerDestroy: (player: Player) => void;

    /**
     * Emitted when a player queue ends.
     * @event Manager#queueEnd
     */
    QueueEnd: (
        player: Player,
        track: Track | UnresolvedTrack,
        payload: TrackEndEvent
    ) => void;

    /**
     * Emitted when a player is moved to a new voice channel.
     * @event Manager#playerMove
     */
    PlayerMove: (player: Player, initChannel: string, newChannel: string) => void;

    /**
     * Emitted when a player is disconnected from it's current voice channel.
     * @event Manager#playerDisconnect
     */
    PlayerDisconnect: (player: Player, oldChannel: string) => void;

    /**
     * Emitted when a track starts.
     * @event Manager#trackStart
     */
    TrackStart: (player: Player, track: Track, payload: TrackStartEvent) => void;

    /**
     * Emitted when a track ends.
     * @event Manager#trackEnd
     */
    TrackEnd: (player: Player, track: Track, payload: TrackEndEvent) => void;

    /**
     * Emitted when a track gets stuck during playback.
     * @event Manager#trackStuck
     */
    TrackStuck: (player: Player, track: Track, payload: TrackStuckEvent) => void;

    /**
     * Emitted when a track has an error during playback.
     * @event Manager#trackError
     */
    TrackError: (
        player: Player,
        track: Track | UnresolvedTrack,
        payload: TrackExceptionEvent
    ) => void;

    /**
     * Emitted when a voice connection is closed.
     * @event Manager#socketClosed
     */
    SocketClosed: (player: Player, payload: WebSocketClosedEvent) => void;
}
