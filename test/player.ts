import { Client } from "discord.js";
import { Manager } from "../src/structures/Manager";

let client = new Client({
    intents: [
        "Guilds",
        "GuildMembers",
        "MessageContent",
        "GuildMessages",
        "GuildVoiceStates"
    ],
});
let manager = new Manager({
    nodes: [
        {
            host: 'localhost',
            port: 2333,
            password: 'youshallnotpass',
        },
    ],
    clientId: "1234567890",
    send(guild_id, payload) {
        const guild = client.guilds.cache.get(guild_id);
        if (guild) guild.shard.send(payload);
        console.log(`Sending payload to guild ${guild_id}: ${JSON.stringify(payload)}`);
    },
});

manager.on("NodeConnect", (node) => {
    console.log(`Node ${node.options.host} connected`);
});
manager.on("NodeRaw", async (node, data) => {
    console.log(`Node ${node.options.host} sent raw data: ${JSON.stringify(data)}`);
});
manager.on("raw", (data) => {
    console.log(data);
});
client.on("ready", () => {
    manager.init();
});
manager.on("PlayerCreate", (player) => {
    console.log(`Player created in guild ${player.guild_id}`);
});
client.on("messageCreate", (message) => {
    console.log(message.content)
    message.content === "message" && manager.create({
        voiceChannel: message.member?.voice.channel?.id as string,
        textChannel: message.channel.id,
        guild_id: message.guild?.id as string,
        selfDeafen: true,
        selfMute: false,
    }).connect();
})
client.on("raw", (data) => manager.updateVoiceState(data));
client.login("");