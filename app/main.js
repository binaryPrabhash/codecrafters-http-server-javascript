const net = require("net");
const fs = require("fs")
const path = require("node:path");
const { dirname } = require("path");

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {

    socket.on("data", (data) => {
        console.log(data.toString())
        const method = data.toString().split(" ")[0]
        const url = data.toString().split(" ")[1]
        const headers = data.toString().split("\r\n")
        if (url === "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n")
            socket.end()
        } else if (url.startsWith("/echo/")) {
            const bodyText = url.split("/echo/")[1]
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${bodyText.length}\r\n\r\n${bodyText}`)
            socket.end()
        } else if (url === "/user-agent") {
            const userAgent = headers[2].split("User-Agent: ")[1]
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`)
            socket.end()
        } else if (url.startsWith("/files/")) {
            const filename = url.split("/files/")[1]
            const directory = process.argv[3]

            if (method === "GET") {
                if (fs.existsSync(`${directory}/${filename}`)) {
                    const content = fs.readFileSync(`${directory}/${filename}`).toString()
                    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`)
                    socket.end()
                } else {
                    socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
                    socket.end()
                }
            } else if (method === "POST") {
                let bodyContent = data.toString().split("\r\n")
                bodyContent = bodyContent[bodyContent.length - 1]
                fs.writeFile(path.join(directory, filename), bodyContent, (err) => {
                    if (err) throw err
                    console.log("File created successfully")
                    socket.write("HTTP/1.1 201 Created\r\n\r\n")
                    socket.end()
                })
            }
        } else {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
            socket.end()
        }
    })

    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
