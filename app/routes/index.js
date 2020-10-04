let UploadRoutes = require("@/routes/UploadRoutes")
let UserRoutes = require("@/routes/UserRoutes");
let CakeRoutes = require("@/routes/CakeRoutes");
let OrderRoutes = require("@/routes/OrderRoutes");
let RoleRoutes = require("@/routes/RoleRoutes")
let UnitRoutes = require("@/routes/UnitRoutes")
let TestController = require("@/controller/test")

module.exports = (app) => {
  //Test API(Some loops or somthing that is test)
  app.use("/test", TestController.Test);

  //Upload comman routes
  app.use("/api", UploadRoutes);

  //Admin Level APIS
  app.use("/admin/role", RoleRoutes);
  // app.use("/admin/user", UserRoutes)

  //Unit master routes
  app.use("/admin/unit", UnitRoutes);

  //App Level APIS
  app.use("/app/user", UserRoutes)
  //Cake routes for app
  app.use("/app/cake", CakeRoutes)
  //Order routes(When user place order).
  app.use("/app/order", OrderRoutes)
};