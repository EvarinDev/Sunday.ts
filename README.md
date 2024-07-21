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
- [🚀 Deployment ](#-deployment-)
- [⛏️ Built Using ](#️-built-using-)
- [✍️ Authors ](#️-authors-)

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
import { Node } from "sunday.ts"
const node = new Node({
    host: 'localhost',
    port: 2333,
    password: 'youshallnotpass',
});

node.on("ready", () => {
    console.log("Ready");
});
node.on("stats", () => {
    console.log(node.stats);
});
node.on("raw", (data) => {
    console.log(data);
});
node.connect();
node.rest?.on("get", (data) => console.log(data));
node.rest?.get("/loadtracks?identifier=dQw4w9WgXcQ")
```

## 🚀 Deployment <a name = "deployment"></a>

Add additional notes about how to deploy this on a live system.

## ⛏️ Built Using <a name = "built_using"></a>

- [WebSocket](https://github.com/websockets/ws) - WebSocket Client
- [Axios](https://github.com/axios/axios) - HTTP Request

## ✍️ Authors <a name = "authors"></a>

- [FAYStarNext](https://github.com/FAYStarNext) - Idea & Initial work

See also the list of [contributors](https://github.com/FAYStarNext/Sunday.ts/contributors) who participated in this project.