import { Dispatcher, Pool } from "undici";
import { NodeOptions } from "../types/Node";
import axios, { AxiosInstance } from "axios";
import { PlayOptionsData } from "../types/Rest";

export class Rest {
    public rest: AxiosInstance;
    public options: NodeOptions;
    sessionId: string;
    constructor(options: NodeOptions) {
        this.rest = axios.create({
            baseURL: `http${options.secure ? "s" : ""}://${options.host}:${options.port}${options.version === "v4" ? "/v4" : ""}`,
            headers: {
                Authorization: options.password
            }
        });
    }

    public async get(path: string) {
        return (await this.rest.get(path)).data;
    }
    public async post(path: string, data: unknown) {
        return (await this.rest.post(path, data)).data;
    }
    public async patch(path: string, data: unknown) {
        return (await this.rest.patch(path, data)).data;
    }
    public async delete(path: string, data?: unknown) {
        return (await this.rest.delete(path, data)).data;
    }
    public async put(path: string, data: unknown) {
        return (await this.rest.put(path, data)).data;
    }
    public setSessionId(sessionId: string) {
        this.sessionId = sessionId;
    }
    public async destroyPlayer(guildId: string): Promise<unknown> {
		return await this.delete(`/sessions/${this.sessionId}/players/${guildId}`);
	}
    public async updatePlayer(options: PlayOptionsData): Promise<unknown> {
		return await this.patch(`/sessions/${this.sessionId}/players/${options.guildId}?noReplace=false`, options.data);
	}
}

export type ModifyRequest = (options: Dispatcher.RequestOptions) => void;
