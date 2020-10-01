let UserRoutes = require("@/routes/UserRoutes");
let CakeRoutes = require("@/routes/CakeRoutes");
let RoleRoutes = require("@/routes/RoleRoutes")
let TestController = require("@/controller/test")

module.exports = (app) => {
  //Test API(Some loops or somthing that is test)
  app.use("/test", TestController.Test);

  //Admin Level APIS
  app.use("/admin/role", RoleRoutes);
  // app.use("/admin/user", UserRoutes)

  //App Level APIS
  app.use("/app/user", UserRoutes)
  //Cake routes for app
  app.use("/app/cake", CakeRoutes)
};