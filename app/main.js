const net = require("net");
const fs = require("fs")
const path = require("node:path")

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {

    socket.on("data", (data) => {
        const url = data.toString().split(" ")[1]
        const headers = data.toString().split("\r\n")
        if (url === "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n")
        } else if (url.startsWith("/echo/")) {
            const bodyText = url.split("/echo/")[1]
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${bodyText.length}\r\n\r\n${bodyText}`)
        } else if (url === "/user-agent") {
            const userAgent = headers[2].split("User-Agent: ")[1]
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`)
        } else if (url.startsWith("/files/")) {
            const filename = url.split("/files/")[1]
            const directory = process.argv[3]

            if (fs.existsSync(`${directory}/${filename}`)) {
                const content = fs.readFileSync(`${directory}/${filename}`).toString()
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`)

            } else {
                socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
            }
        } else {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
        }
        socket.end()
    })

    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
