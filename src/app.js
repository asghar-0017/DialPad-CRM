const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const { logger } = require("../logger");
const AdminAuthRoute = require("./routes/authRoute");
const agentRoute = require("./routes/agentRoute");
const leadRoute = require("./routes/leadRoute");
const followUpRoute = require("./routes/followUpRoute");
const otherRoute = require("./routes/otherRoute");
const TrashRoute = require("./routes/trashRoute");
const messageRoute = require("./routes/messagingRoute");
const taskToAgents = require("./routes/taskToAgents");
const cloudnaryRoute = require("./routes/cloudnaryRoute");
const dataSource = require("./infrastructure/psql");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const helmet = require("helmet");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
  transports: ["websocket", "polling"],
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.use((req, res, next) => {
  logger.info(`Received request: ${req.method} ${req.url}`);
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

app.get("/", async (req, res) => {
  res.send({
    code: 200,
    status: "OK",
    message: "Express server is running",
  });
});

AdminAuthRoute(app, io);
agentRoute(app, io);
leadRoute(app, io);
followUpRoute(app, io);
otherRoute(app, io);
TrashRoute(app);
messageRoute(app, io);
cloudnaryRoute(app);
taskToAgents(app);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    logger.error("Bad JSON:", err.message);
    return res
      .status(400)
      .send({
        code: 400,
        status: "Bad Request",
        message: "Invalid JSON payload",
      });
  }
  next();
});

const onlineAgents = new Map();
const onlineAdmins = new Map();

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);
  socket.on("agent_connected", (agentId) => {
    onlineAgents.set(agentId, socket.id);
    console.log(`Agent ${agentId} is online`);
    io.emit("online_agents", Array.from(onlineAgents.keys()));
  });

  socket.on("admin_connected", (adminId) => {
    onlineAdmins.set(adminId, socket.id);
    logger.info(`Admin ${adminId} is online`);

    io.emit("admin_online", { adminId, online: true });
  });

  socket.on("send_message", (data) => {
    console.log("data of socket", data);
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    for (const [agentId, socketId] of onlineAgents.entries()) {
      if (socketId === socket.id) {
        onlineAgents.delete(agentId);
        console.log(`Agent ${agentId} is offline`);
        break;
      }
    }

    for (const [adminId, socketId] of onlineAdmins.entries()) {
      if (socketId === socket.id) {
        onlineAdmins.delete(adminId);
        logger.info(`Admin ${adminId} is offline`);
        io.emit("admin_online", { adminId, online: false });
        break;
      }
    }
    io.emit("online_agents", Array.from(onlineAgents.keys()));
    console.log(`User disconnected: ${socket.id}`);
  });
});
const StartServer = async () => {
  try {
    await dataSource.initialize();
    logger.info("Database connection has been established");

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      logger.info(`Server is listening on ${PORT}`);
      logger.info("Socket.io instance is initialized");
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

module.exports = { StartServer, io };
