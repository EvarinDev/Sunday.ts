export interface VoiceState {
	op: "voiceUpdate";
	guildId: string;
	event: VoiceServer;
	sessionId?: string;
}

export interface VoiceServer {
	token: string;
	guild_id: string;
	endpoint: string;
}

export interface VoiceState {
	guild_id: string;
	user_id: string;
	session_id: string;
	channel_id: string;
}

export interface VoicePacket {
	t?: "VOICE_SERVER_UPDATE" | "VOICE_STATE_UPDATE";
	d: VoiceState | VoiceServer;
}