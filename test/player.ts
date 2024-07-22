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
manager.on("NodeRaw", async (node) => {
    console.log(`sent raw data: ${JSON.stringify(node)}`);
});
client.on("ready", () => {
    manager.init();
});
manager.on("PlayerCreate", (player) => {
    console.log(`Player created in guild ${player.guild}`);
});
manager.on("NodeError" , (node, error) => {
    console.log(`Node ${node.options.host} has an error: ${error.message}`);
});
client.on("messageCreate", async (message) => {
    console.log(message.content)
    if (message.content === "message") {
        let player = manager.create({
            voiceChannel: message.member?.voice.channel?.id as string,
            textChannel: message.channel.id,
            guild: message.guild?.id as string,
            selfDeafen: true,
            selfMute: false,
        })
        if (player.state !== "CONNECTED") await player.connect();
    }
})
client.on("raw", (data) => manager.updateVoiceState(data));
client.login("");