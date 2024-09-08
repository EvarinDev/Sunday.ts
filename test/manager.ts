import { Manager } from "../src";

let client = new Manager({
    nodes: [
        {
            host: 'localhost',
            port: 2333,
            password: 'youshallnotpass',
        },
    ],
    clientId: "1234567890",
    caches: {
        enabled: true,
        time: 60000,
    },
    send(guild_id, payload) {
        console.log(`Sending payload to guild ${guild_id}: ${JSON.stringify(payload)}`);
    },
});

client.on("NodeConnect", (node) => {
    console.log(`Node ${node.options.host} connected`);
});
client.on("NodeRaw", (node) => {
    console.log(node)
});
client.init()