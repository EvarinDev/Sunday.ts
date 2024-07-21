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
- [⛏️ Built Using ](#️-built-using-)
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
- [ ] Multi version
- [ ] Plugin

## 🎈 Usage <a name="usage"></a>

```ts
import { Client } from "discord.js";
import { Manager } from "sunday.ts";

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
            version: "v4",
        },
    ],
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
client.on("ready", () => {
    manager.init();
});
manager.on("PlayerCreate", (player) => {
    console.log(`Player created in guild ${player.guild}`);
});
manager.on("NodeError" , (node, error) => {
    console.log(`Node ${node.options.host} has an error: ${error.message}`);
});
client.on("raw", (data) => manager.updateVoiceState(data));
client.login("");
```

## ⛏️ Built Using <a name = "built_using"></a>

- [WebSocket](https://github.com/websockets/ws) - WebSocket Client
- [Axios](https://github.com/axios/axios) - HTTP Request
## Credits

- [Erela.Js](https://github.com/MenuDocs/erela.js)

See also the list of [contributors](https://github.com/FAYStarNext/Sunday.ts/contributors) who participated in this project.