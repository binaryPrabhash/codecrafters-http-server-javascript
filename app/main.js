const net = require("net");

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {

    socket.on("data", (data) => {
        const path = data.toString().split(" ")[1]
        const userAgent = data.toString().split("User-Agent: ")[1].split("\r")[0]
        if (path === "/user-agent") {
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`)
        } else {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
        }
    })

    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
