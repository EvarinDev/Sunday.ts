<p align="center">
  <a href="" rel="noopener">
</p>

<h3 align="center">sunday.ts</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/FAYStarNext/Sunday.ts.svg)](https://github.com/FAYStarNext/Sunday.ts/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/FAYStarNext/Sunday.ts.svg)](https://github.com/FAYStarNext/Sunday.ts/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> Sunday a lavalink wrapper
    <br> 
</p>

## 📝 Table of Contents

- [📝 Table of Contents](#-table-of-contents)
- [🧐 About ](#-about-)
- [🏁 Getting Started ](#-getting-started-)
  - [Installing](#installing)
- [Features](#features)
- [🎈 Usage ](#-usage-)
- [Credits](#credits)

## 🧐 About <a name = "about"></a>

Sunday a lavalink wrapper for ( NodeJS, Bun )

## 🏁 Getting Started <a name = "getting_started"></a>

### Installing

To install Sunday.ts, follow these steps:

1. Open your terminal or command prompt.
2. Navigate to the root directory of your project.
3. Run the following command to install Sunday.ts:

  ```sh
  bun i sunday.ts
  ```

  This will install Sunday.ts and its dependencies.

4. Once the installation is complete, you can import Sunday.ts into your project and start using it.

That's it! You have successfully installed Sunday.ts and are ready to start using it in your Node.js project.

## Features
- [x] SearchCache

## 🎈 Usage <a name="usage"></a>

```ts
import { Client } from "discord.js";
import { Manager } from "sunday.ts";
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
manager.on("NodeRaw", async (node) => {
    console.log(`sent raw data: ${JSON.stringify(node)}`);
});
manager.on("PlayerCreate", (player) => {
    console.log(`Player created in guild ${player.guild}`);
});
manager.on("NodeError" , (node, error) => {
    console.log(`Node ${node.options.host} has an error: ${error.message}`);
});
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    const start = performance.now();
    const [command, ...args] = message.content.slice(0).split(/\s+/g);
    if (command === 'play') {
        if (!message.member?.voice.channel) return message.reply('you need to join a voice channel.');
        if (!args.length) return message.reply('you need to give me a URL or a search term.');
        const search = args.join(' ');
        let res;
        let end;
        try {
            // Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
            res = await manager.search({query: search});
            end = `Time took: ${Math.round(performance.now() - start)}ms.`;
            // Check the load type as this command is not that advanced for basics
            if (res.loadType === 'empty') throw res;
            if (res.loadType === 'playlist') {
                throw { message: 'Playlists are not supported with this command.' };
            }
        } catch (err) {
            return message.reply(`there was an error while searching: ${err}`);
        }

        if (res.loadType === 'error') {
            return message.reply('there was no tracks found with that query.');
        }

        // Create the player
        const player = manager.create({
            guild: message.guild?.id as string,
            voiceChannel: message.member?.voice.channel.id,
            textChannel: message.channel.id,
            volume: 100,
        });

        // Connect to the voice channel and add the track to the queue
        player.connect();
        await player.queue.add(res.tracks[0]);
        // Checks if the client should play the track if it's the first one added
        if (!player.playing && !player.paused && !player.queue.size) player.play();

        return message.reply(`enqueuing ${res.tracks[0].title}. ${end}`);
    }
});
manager.on("SearchCacheClear" , (key: string,  values) => {
    console.log(`Cache cleared for ${key} with values: ${values}`);
});
client.on("raw", (data) => manager.updateVoiceState(data));
client.on("ready" , () => {
    manager.init(client.user?.id as string);
    console.log(`Logged in as ${client.user?.tag} | Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
});
client.login(process.env.TOKEN);
```

## Credits

- [Erela.Js](https://github.com/MenuDocs/erela.js)
- [MagmaStream](https://github.com/Blackfort-Hosting/magmastream/)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=EvarinDev/Sunday.ts&type=Date)](https://star-history.com/#EvarinDev/Sunday.ts&Date)

See also the list of [contributors](https://github.com/FAYStarNext/Sunday.ts/contributors) who participated in this project.