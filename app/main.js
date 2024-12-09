const net = require("net");

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {

    socket.on("data", (data) => {
        const path = data.toString().split(" ")[1]
        let responseText
        let bodyText
        if (path.startsWith("/")) {
            responseText = "200 OK"
            if (path.startsWith("/echo/")) {
                bodyText = path.split("/")[2]
            }
        } else {
            responseText = "404 Not Found"
            bodyText = ""
        }
        socket.write(`HTTP/1.1 ${responseText}\r\nContent-Type: text/plain\r\nContent-Length: ${bodyText.length}\r\n\r\n${bodyText}`)
    })

    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
