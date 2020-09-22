var moment = require('moment');
var sql = require('@/app/db/database')

//@route    POST 5500/admin/role/add
//@desc     Add Role
//@access   Private
module.exports.AddRole = function (req, res) {
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({
      status: req.user_info.status, message: req.user_info.message,
      error: req.user_info.message, Records: []
    });
  } else {
    //Pull all key from body
    let { role_name } = req.body;

    //Replace white space with single
    role_name = role_name.trim().replace(/  +/g, ' ').toLowerCase();

    //Assign value for additional key
    let created_date = new Date()
    let created_by = req["user_info"]["user_id"] || 0
    let modified_date = new Date()
    let modified_by = req["user_info"]["user_id"] || 0
    let userrole_active = "Y"
    let is_active = "Y"

    //Make an object with all keys
    let role_details = {
      role_name,
      created_date,
      created_by,
      modified_date,
      modified_by,
      userrole_active,
      is_active
    }

    let find_query = `SELECT * from userrole WHERE role_name='${role_details.role_name}'`
    if (role_name !== "") {
      if (role_name == "super admin" || role_name == "hospital" || role_name == "user" || role_name == "dist") {

        //Check for roles exists or not
        sql.query(find_query, (err_find_roles, roles) => {
          if (err_find_roles) {
            res.status(200).json({
              status: false,
              message: "SQL error while finding record",
              Records: [],
              error: err_find_roles
            });
          } else {

            //If role name same return response
            if (roles.length > 0 && roles[0]["role_name"] == role_details.role_name) {
              res.status(200).json({
                status: false,
                message: "Role name already exists!",
                Records: [],
                error: "Role name already exists!"
              });
            } else {

              //Insert new roles
              sql.query("INSERT INTO userrole SET ?", role_details, function (error, result) {
                if (error) {
                  res.status(200).json({
                    status: false,
                    message: "SQL error while creating new record",
                    Records: [],
                    error: error
                  });
                } else {

                  //find the inserted records
                  sql.query(find_query, (find_upd_err, new_role) => {
                    if (find_upd_err) {
                      res.status(200).json({
                        status: false,
                        message: "SQL error while finding record",
                        Records: [],
                        error: find_upd_err
                      });
                    } else {
                      //Return success response
                      res.status(200).json({
                        status: true,
                        message: "New role created successfully!",
                        Records: new_role,
                        error: null
                      });
                    }
                  })
                }
              });
            }
          }
        })
      } else {
        res.status(200).json({
          status: false,
          message: "Invalid role name",
          Records: [],
          error: "Invalid role name"
        });
      }
    } else {
      res.status(200).json({
        status: false,
        message: "Please provide role name",
        Records: [],
        error: "Please provide role name"
      });
    }
  }
}

//@route    POST 5500/admin/role/edit/:role_id
//@desc     Edit role
//@access   Private
module.exports.EditRole = function (req, res) {
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({
      status: req.user_info.status, message: req.user_info.message,
      error: req.user_info.message, Records: []
    });
  } else {
    let { role_id } = req.params
    if (!role_id) {
      res.status(200).json({
        status: false,
        message: "Role id missing",
        Records: [],
        error: "Role id missing"
      });
    } else {

      //Pull all key from body
      let { role_name } = req.body;

      //Replace white space with single
      role_name = role_name.trim().replace(/  +/g, ' ').toLowerCase();

      let find_query = `SELECT * from userrole WHERE role_id='${role_id}' AND is_active='Y'`;

      //Check for role id
      sql.query(find_query, (err, role) => {
        if (err) {
          res.status(200).json({
            status: false,
            message: "SQL error while finding record",
            Records: [],
            error: err
          });
        } else {

          //check for records
          if (role.length > 0) {
            if (role_name == "") {
              res.status(200).json({
                status: false,
                message: "Please provide some role name",
                Records: [],
                error: "Please provide some role name"
              });
            } else {

              if (role_name == "super admin" || role_name == "hospital" || role_name == "user") {

                //Assign value for additional key
                let modified_date = moment().format('YYYY-MM-DD HH:mm:ss');
                let modified_by = 0

                //Make an query
                let update_query = `UPDATE userrole SET role_name='${role_name}', modified_date=CAST('${modified_date}' AS DATETIME), modified_by='${modified_by}' WHERE role_id='${role_id}' AND is_active= 'Y'`;

                //Query to DB
                sql.query(update_query, (err, update_role) => {

                  if (!err) {
                    sql.query(find_query, (find_error, updated_role) => {
                      if (find_error) {
                        res.status(200).json({
                          status: false,
                          message: "SQL error while finding record",
                          Records: [],
                          error: find_error
                        });
                      } else {
                        res.status(200).json({
                          status: true,
                          message: `Role updated successfully!`,
                          Records: updated_role,
                          error: null
                        });
                      }
                    })
                  } else {
                    res.status(200).json({
                      status: false,
                      message: "SQL error while updating record",
                      Records: [],
                      error: err
                    });
                  }
                })
              } else {
                res.status(200).json({
                  status: false,
                  message: "Invalid role name",
                  Records: [],
                  error: "Invalid role name"
                });
              }
            }
          } else {
            //Return response
            res.status(200).json({
              status: false,
              message: "No role found with requested id!",
              Records: [],
              error: "No role found with requested id!"
            });
          }
        }
      })
    }
  }
}

//@route    GET 5500/admin/role/all
//@route    GET 5500/admin/role/:role_id
//@desc     Get single role(current), Pass id for current or all to all roles
//@access   Private
module.exports.GetUserRole = function (req, res) {
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({
      status: req.user_info.status, message: req.user_info.message,
      error: req.user_info.message, Records: []
    });
  } else {

    //Get role id 
    let { role_id } = req.params;
    if (!role_id) {
      res.status(200).json({
        status: false,
        message: "Role id not found",
        Records: [],
        error: "Role id not found"
      });
    } else if (role_id == 'all') {
      let find_query = `SELECT * from userrole WHERE is_active='Y'`
      //Query to DB
      sql.query(find_query, (find_err, roles) => {
        if (find_err) {
          res.status(200).json({
            status: false,
            message: "SQL error while finding records",
            Records: [],
            error: find_err
          });
        } else {
          res.status(200).json({
            status: true,
            message: `Get all roles successfully!`,
            Records: roles,
            error: null
          });
        }
      })
    }
    else {

      //Make query
      let find_query = `SELECT * from userrole WHERE role_id='${role_id}' AND is_active= 'Y'`;

      //Query to DB
      sql.query(find_query, (find_error, role) => {
        if (find_error) {
          res.status(200).json({
            status: false,
            message: "SQL error while finding record",
            Records: [],
            error: find_error
          });
        } else {

          //Check for length
          if (role.length > 0) {
            res.status(200).json({
              status: true,
              message: `Found the requested role!`,
              Records: role,
              error: null
            });
          } else {
            res.status(200).json({
              status: true,
              message: "No role found",
              Records: [],
              error: "No role found with requested id!"
            });
          }
        }
      })

    }
  }
}

//@route    GET 5500/admin/role/add-admin
//@desc     Get roles based on admins logged in(Super admin and admin)
//@access   Private
module.exports.GetUserRoleToAddUser = function (req, res) {
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({ status: req.user_info.status, message: req.user_info.message, error: req.user_info.message, Records: [] });
  } else {
    let role_ids = [3, 4];
    let find_query = `SELECT * from userrole `
    if (req["user_info"] && req["user_info"]["role_id"] === 1) {
      role_ids.push(req["user_info"]["role_id"])
      role_ids = role_ids.join(',');
      find_query += ` WHERE role_id IN (${role_ids}) AND is_active='Y'`
    } else {
      role_ids = role_ids.join(',');
      find_query += ` WHERE role_id IN (${role_ids}) AND is_active='Y'`
    }
    //Query to DB
    sql.query(find_query, (find_err, roles) => {
      if (find_err) {
        res.status(200).json({ status: false, message: "SQL error while finding records", Records: [], error: find_err });
      } else if (roles && roles.length > 0) {
        res.status(200).json({ status: true, message: `Get all roles successfully!`, Records: roles, error: null });
      } else {
        res.status(200).json({ status: true, message: `No roles found!`, Records: roles, error: null });
      }
    })
  }
}

//@route    DELETE 5500/admin/role/:role_id
//@desc     Remove single role(current)
//@access   Private
module.exports.DeleteRole = function (req, res) {
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({
      status: req.user_info.status, message: req.user_info.message,
      error: req.user_info.message, Records: []
    });
  } else {
    //Get role_id id 
    let role_id = req.params.role_id;

    //Make query
    let find_query = `SELECT * from userrole WHERE role_id='${role_id}' AND is_active= 'Y'`;

    //Query to DB
    sql.query(find_query, (find_error, userrole) => {
      if (find_error) {
        res.status(200).json({
          status: false,
          message: "SQL error while finding record",
          Records: [],
          error: find_error
        });
      } else {
        if (userrole.length > 0) {

          //Assign value for additional key
          let modified_date = moment().format('YYYY-MM-DD HH:mm:ss')
          let modified_by = 0
          let is_active = "N"

          let update_query = `UPDATE userrole SET is_active='${is_active}', modified_date='${modified_date}', modified_by='${modified_by}' WHERE role_id='${role_id}' AND is_active= 'Y'`;

          //Run the update query
          sql.query(update_query, (upd_error, roles) => {
            if (upd_error) {
              res.status(200).json({
                status: false,
                message: "SQL error while updating record",
                Records: [],
                error: upd_error
              });
            } else {
              res.status(200).json({
                status: true,
                message: `Requested roles remove successfully!`,
                Records: [],
                error: null
              });
            }
          })
        } else {
          res.status(200).json({
            status: false,
            message: "No roles found with requested id!",
            Records: [],
            error: "No roles found with requested id!"
          });
        }
      }
    })
  }
}