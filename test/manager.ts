import { Manager } from "../src/structures/Manager";

let client = new Manager({
    nodes: [
        {
            host: 'localhost',
            port: 2333,
            password: 'youshallnotpass',
        },
        {
            host: "ether.lunarnodes.xyz",
            port: 6969,
            password: "lunarnodes.xyz",
        }
    ],
    clientId: "1234567890",
    send(guild_id, payload) {
        console.log(`Sending payload to guild ${guild_id}: ${JSON.stringify(payload)}`);
    },
});

client.on("NodeConnect", (node) => {
    console.log(`Node ${node.options.host} connected`);
});
client.on("NodeRaw", async (node, data) => {
    console.log(`Node ${node.options.host} sent raw data: ${JSON.stringify(data)}`);
});
client.on("raw", (data) => {
    console.log(data);
});
client.init()