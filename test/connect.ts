import { Node } from '../src/index'
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
node.rest?.get("/loadtracks?identifier=dQw4w9WgXcQ").catch(console.error);