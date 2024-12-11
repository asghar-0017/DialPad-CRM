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

const setupRoutes = (app) => {
  AdminAuthRoute(app);
  agentRoute(app);
  leadsRoute(app);
  sheetRoute(app);
  labelRoute(app);
//   followUpRoute(app, io);
//   otherRoute(app, io);
  TrashRoute(app);
  messageRoute(app);
  cloudnaryRoute(app);
  taskToAgents(app);
};

module.exports = setupRoutes;
