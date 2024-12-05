const AdminAuthRoute = require("./authRoute");
const agentRoute = require("./agentRoute");
const leadsRoute = require("./leadsRoute");
const sheetRoute = require("./sheetRoute");
const labelRoute = require("./labelRoute");
// const followUpRoute = require("./followUpRoute");
// const otherRoute = require("./otherRoute");
const TrashRoute = require("./trashRoute");
const messageRoute = require("./messagingRoute");
const taskToAgents = require("./taskToAgents");
const cloudnaryRoute = require("./cloudnaryRoute");

const setupRoutes = (app, io) => {
  AdminAuthRoute(app, io);
  agentRoute(app, io);
  leadsRoute(app, io);
  sheetRoute(app, io);
  labelRoute(app, io);
//   followUpRoute(app, io);
//   otherRoute(app, io);
  TrashRoute(app);
  messageRoute(app, io);
  cloudnaryRoute(app);
  taskToAgents(app);
};

module.exports = setupRoutes;
