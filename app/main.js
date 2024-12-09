const net = require("net");

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {

    socket.on("data", (data) => {
        const path = data.toString().split(" ")[1]

        const responseText = path === "/" ? "200 OK" : "404 Not Found"
        socket.write(`HTTP/1.1 ${responseText}\r\n\r\n`)
    })

    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
