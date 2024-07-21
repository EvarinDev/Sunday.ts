import { TypedEmitter } from "tiny-typed-emitter";
import { WebSocket } from "ws";
import type { NodeConfig, NodeEventEmitter, NodeStats } from "../types/Node";
import { Rest } from "./Rest";

/* This TypeScript class extends TypedEmitter with a generic type of NodeEventEmitter. */
export class Node extends TypedEmitter<NodeEventEmitter> {
    /* The line `public socket: WebSocket | null = null;` in the Node class is declaring a public
    property named `socket` with a type of `WebSocket` or `null`. This means that the `socket`
    property can hold a value of type `WebSocket` (imported from the "ws" module) representing a
    WebSocket connection, or it can be `null` if no value is assigned to it. This property is
    initialized with a default value of `null` when a new instance of the Node class is created. */
    public socket: WebSocket | null = null;

    /* The line `public options: NodeConfig;` in the Node class is declaring a public property named
    `options` with a type of `NodeConfig`. This means that the `options` property can hold values
    that conform to the structure defined by the `NodeConfig` type. The `NodeConfig` type likely
    represents a configuration object containing various settings or parameters related to a Node
    instance, such as `host`, `password`, and `port`. */
    public options: NodeConfig;
    /* The line `public stats: NodeStats | null = null;` in the Node class is declaring a public
    property named `stats` with a type of `NodeStats` or `null`. This means that the `stats`
    property can hold a value of type `NodeStats` (defined elsewhere in the codebase) or it can be
    `null` if no value is assigned to it. */
    public stats: NodeStats | null = null;
    session_id: string | null = null;
    /* The line `public rest: Rest | null = null;` in the Node class is declaring a public property
    named `rest` of type `Rest` or `null`. */
    public rest: Rest | null = null;

    /**
     * The function checks if a WebSocket connection is open and returns a boolean value accordingly.
     * @returns The `get connected` method returns a boolean value indicating whether the WebSocket
     * connection is open or not. It returns `true` if the socket is open and `false` if the socket is
     * either closed or not initialized.
     */
    public get connected(): boolean {
        if (!this.socket) return false;
        return this.socket.readyState === WebSocket.OPEN;
    }
    /**
     * The constructor initializes a Rest object with the provided NodeConfig options.
     * @param {NodeConfig} options - The `options` parameter is an object that contains configuration
     * settings for a Node instance. It typically includes properties such as `host`, `password`, and
     * `port` that are used to establish a connection to a server or service.
     */
    constructor(options: NodeConfig) {
        super();
        this.options = options;
        this.rest = new Rest({
            host: options.host,
            password: options.password,
            port: options.port,
        })
    }
    /**
     * The `connect` function establishes a WebSocket connection with specified headers and event
     * handlers for connection, closure, error, and message reception.
     * @returns If the `connect()` method is called when `this.connected` is already `true`, the method
     * will return early without establishing a new connection.
     */
    public connect() {
        if (this.connected) return;
        const headers = Object.assign({
            "Authorization": this.options.password,
            "Client-Name": "Lavalink",
            "User-Id": "213",
        })
        this.socket = new WebSocket(`ws${this.options.secure ? "s" : ""}://${this.options.host}:${this.options.port}/v4/websocket`, { headers });
        this.socket.on("open", () => {
            this.emit("connect");
        });
        this.socket.on("close", () => {
            console.log("Connection closed");
        });
        this.socket.on("error", (error) => {
            console.error(error);
        });
        this.socket.on("message", this.onMessage.bind(this));
    }
    /**
     * The function `onMessage` processes incoming data, parses it as JSON, and emits events based on
     * the payload's operation type.
     * @param {Buffer | string} data - The `data` parameter in the `onMessage` function can be either a
     * Buffer or a string. If it is an array, the function concatenates the buffers in the array. If it
     * is an ArrayBuffer, it converts it to a Buffer. Then it parses the data as JSON and emits a
     */
    private onMessage(data: Buffer | string) {
        if (Array.isArray(data)) data = Buffer.concat(data);
        else if (data instanceof ArrayBuffer) data = Buffer.from(data);
        const payload = JSON.parse(data.toString());
        this.emit("raw", payload);
        switch (payload?.op) {
            case "ready": {
                this.session_id = payload.session_id;
                this.emit("ready");
                break;
            }
            case "stats": {
                this.stats = payload;
                this.emit("stats", payload);
                break;
            }
        }
    }
}