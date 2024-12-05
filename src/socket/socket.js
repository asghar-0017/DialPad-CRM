const { logger } = require("../../logger");

const setupSockets = (io) => {
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
};

module.exports = setupSockets;
