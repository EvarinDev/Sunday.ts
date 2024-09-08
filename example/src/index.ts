import { Client } from "discord.js";
import { Manager } from "../../src";
import "dotenv/config";

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
            resumeStatus: true,
        },
    ],
    caches: {
        enabled: true,
        time: 60000,
    },
    clientId: "1234567890",
    send(guild_id, payload) {
        const guild = client.guilds.cache.get(guild_id);
        if (guild) guild.shard.send(payload);
    },
});

manager.on("NodeConnect", (node) => {
    console.log(`Node ${node.options.host} connected`);
});
manager.on("PlayerCreate", (player) => {
    console.log(`Player created in guild ${player.guild}`);
});
manager.on("NodeError" , (node, error) => {
    console.log(`Node ${node.options.host} has an error: ${error.message}`);
});

// Helper function to handle the 'play' command
async function handlePlayCommand(message: any, args: string[]) {
    if (!message.member?.voice.channel) return message.reply('you need to join a voice channel.');
    if (!args.length) return message.reply('you need to give me a URL or a search term.');
    
    const search = args.join(' ');
    const start = performance.now();
    let res;
    let end;
    
    try {
        res = await searchTracks(search);
        end = `Time took: ${Math.round(performance.now() - start)}ms.`;
    } catch (err) {
        return message.reply(`there was an error while searching: ${err}`);
    }
    
    if (res.loadType === 'error') return message.reply('there was no tracks found with that query.');
    
    const player = manager.create({
        guild: message.guild?.id as string,
        voiceChannel: message.member?.voice.channel.id,
        textChannel: message.channel.id,
        volume: 100,
    });
    
    player.connect();
    player.queue.add(res.tracks[0]);
    if (!player.playing && !player.paused && !player.queue.size) player.play();
    
    return message.reply(`enqueuing ${res.tracks[0].title}. ${end}`);
}

// Helper function to handle the search logic
async function searchTracks(search: string) {
    const res = await manager.search({ query: search });
    if (res.loadType === 'empty') throw res;
    if (res.loadType === 'playlist') throw Error('Playlists are not supported with this command.');
    return res;
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    
    const [command, ...args] = message.content.slice(0).split(/\s+/g);
    if (command === 'play') {
        await handlePlayCommand(message, args);
    }
});
client.on("raw", (data) => manager.updateVoiceState(data));
client.on("ready" , () => {
    manager.init(client.user?.id as string);
    console.log(`Logged in as ${client.user?.tag} | Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
});
client.login(process.env.TOKEN);