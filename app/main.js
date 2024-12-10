const net = require("net")
const fs = require("fs")
const path = require("node:path")
const zlib = require("zlib")

console.log("Logs from your program will appear here!")

const server = net.createServer((socket) => {

    socket.on("data", (data) => {
        const [statusLine, ...rest] = data.toString().split("\r\n")
        const headersList = rest.slice(0, -1)
        const bodyContent = rest[rest.length - 1]

        const headers = headersList.reduce((acc, header) => {
            if (header.trim() === "") return acc
            const [key, ...valueParts] = header.split(":")
            const value = valueParts.join(":").trim()
            acc[key.trim()] = value
            return acc
        }, {})

        const [method, url, httpVersion] = statusLine.split(" ")
        if (url === "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n")
            socket.end()
        } else if (url.startsWith("/echo/")) {
            const urlTextContent = url.split("/echo/")[1]
            if (headers.hasOwnProperty('Accept-Encoding')) {
                if (headers['Accept-Encoding'].split(",").map((val) => val.trim()).includes("gzip")) {
                    const urlTextEncoded = zlib.gzipSync(urlTextContent)
                    socket.write(`HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\ncontent-Type: text/plain\r\nContent-Length: ${urlTextEncoded.length}\r\n\r\n`)
                    socket.write(urlTextEncoded)
                    socket.end()
                } else {
                    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${urlTextContent.length}\r\n\r\n${urlTextContent}`)
                    socket.end()
                }
            } else {
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${urlTextContent.length}\r\n\r\n${urlTextContent}`)
                socket.end()
            }
        } else if (url === "/user-agent") {
            const userAgent = headers['User-Agent']
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
