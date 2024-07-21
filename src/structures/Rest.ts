import { TypedEmitter } from "tiny-typed-emitter";
import type { RestConfig, RestEventEmitter } from "../types/Rest";
import axios, { type AxiosInstance } from "axios";
import type { Node } from "./Node";
import type { PlayOptions } from "../types/Player";

export class Rest extends TypedEmitter<RestEventEmitter> {
    /* The line `public req: AxiosInstance` in the TypeScript class `Rest` is declaring a public
    property named `req` of type `AxiosInstance`. This property is used to store an instance of
    Axios, which is a popular JavaScript library used for making HTTP requests. By storing an
    instance of Axios in the `req` property, the `Rest` class can utilize Axios methods to make HTTP
    requests such as GET and POST to interact with REST APIs based on the provided configuration
    options. */
    public req: AxiosInstance
    /* The line `public config: RestConfig;` in the TypeScript class `Rest` is declaring a public
    property named `config` of type `RestConfig`. This property is used to store the configuration
    options provided when initializing an instance of the `Rest` class. */
    public config: RestConfig;
    /**
     * The constructor function initializes a REST client with the provided configuration options.
     * @param {RestConfig} options - The `options` parameter in the constructor function seems to be an
     * object of type `RestConfig`. It likely contains configuration options for making REST API
     * requests. Some of the properties in the `options` object could include:
     */
    /** The Node that this Rest instance is connected to. */
	private node: Node;
	/** The ID of the current session. */
	private sessionId: string;
	/** The password for the Node. */
	private readonly password: string;
	/** The URL of the Node. */

	constructor(node: Node) {
        super();
		this.node = node;
		this.req = axios.create({
            baseURL: `http${node.options.secure ? "s" : ""}://${node.options.host}:${node.options.port}/v4`,
            headers: {
                "Authorization": node.options.password
            }
        });
		this.password = node.options.password;
	}
    /**
     * The function `get` sends a GET request to a specified path and emits events based on the response
     * or error.
     * @param {string} path - The `path` parameter in the `get` method is a string that represents the
     * URL path to make the GET request to.
     * @param [options] - The `options` parameter in the `get` method is an optional object that allows
     * you to pass additional configuration or data to the HTTP request being made. It is a key-value
     * pair object where the keys are strings and the values can be of any type. These options can
     * include headers, query parameters
     */
    public async get(path: string, options?: { [key: string]: any }) {
        await this.req.get(path, options).then((res) => {
            this.emit("get", res.data);
            return res.data;
        }).catch((err) => {
            this.emit("error", err);
        });
    }
    /**
     * This TypeScript function sends a POST request using the provided path and options, emitting
     * events for successful responses and errors.
     * @param {string} path - The `path` parameter is a string that represents the URL path where the
     * POST request will be sent.
     * @param [options] - The `options` parameter in the `post` method is an optional object that can
     * contain key-value pairs for additional configuration or data to be sent in the POST request. It
     * allows for flexibility in customizing the request based on specific requirements.
     */
    public async post(path: string, options?: { [key: string]: any }) {
        await this.req.post(path, options).then((res) => {
            this.emit("post", res.data);
            return res.data;
        }).catch((err) => {
            this.emit("error", err);
        });
    }
    public async updatePlayer(options: PlayOptions): Promise<unknown> {
		return await this.patch(`/sessions/${this.sessionId}/players/${options.guildId}?noReplace=false`, options.data);
	}
    public async patch(path: string, data: any) {
        this.req.patch(path, data).then((res) => {
            this.emit("patch", res.data);
            return res.data;
        }).catch((err) => {
            this.emit("error", err);
        });
    }
    public setSessionId(sessionId: string): string {
		this.sessionId = sessionId;
		return this.sessionId;
	}
}