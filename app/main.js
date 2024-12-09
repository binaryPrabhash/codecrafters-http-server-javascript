const net = require("net");

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {

    socket.on("data", (data) => {
        const path = data.toString().split(" ")[1]
        const headers = data.toString().split("\r\n")
        if (path === "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n")
        } else if (path.startsWith("/echo/")) {
            const bodyText = path.split("/echo/")[1]
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${bodyText.length}\r\n\r\n${bodyText}`)
        } else if (path === "/user-agent") {
            const userAgent = headers[2].split("User-Agent: ")[1]
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
