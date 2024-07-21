export interface PlayOptionsData {
	guildId: string;
	data: {
		/** The base64 encoded track. */
		encodedTrack?: string;
		/** The track ID. */
		identifier?: string;
		/** The track time to start at. */
		startTime?: number;
		/** The track time to end at. */
		endTime?: number;
		/** The player volume level. */
		volume?: number;
		/** The player position in a track. */
		position?: number;
		/** Whether the player is paused. */
		paused?: boolean;
		/** The audio effects. */
		filters?: object;
		/** voice payload. */
		voice?: {
			token: string;
			sessionId: string;
			endpoint: string;
		};
		/** Whether to not replace the track if a play payload is sent. */
		noReplace?: boolean;
	};
}