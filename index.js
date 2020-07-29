const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const port = 8844;

app.use(express.static("public"));
app.get("/", () => {
  // Serve public/index.html by default
});
server.listen(port);

console.log(`IDE running on http://localhost: ${port}.`);
