var express = require("express");
var multer = require("multer");
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var clientSessions = require('client-sessions');
var app = express();
var data_server = require("./data-service.js")
var dataServiceAuth = require("./data-service-auth");
var path = require("path")
var fs = require("fs");
const { ppid } = require("process");

var HTTP_PORT = process.env.PORT || 8080;



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Setup client sessions
app.use(clientSessions, ({
  cookieName: "session",      // This is the object name that will be added to 'req'
  secret: "web_application",  
  duration: 2 * 60 *1000,     // Duration of the session in milliseconds (2 seconds).
  activeDuration: 1000 * 60   // the session will be extended for this much of time after every request (1 minute).
}));

// Custom middleware function to ensure all templates will have access to a "session" object.
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Function to check if the user is logged in
function ensureLogin(req, res, next) {
  if(!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};


// using multer library
const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage });


function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

/////////////////////////    Navigation bar fixing     ///////////

app.set('view engine', '.hbs');
app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
});


app.engine('.hbs', exphbs({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    navLink: function (url, options) {
      return '<li' + ((url == app.locals.activeRoute) ? ' class="active"' : '')
        + '><a href="' + url + '">' + options.fn(this) + '</a></li>'
    },

    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlerbars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
}));


//home.hbs
app.get("/", (req, res) => {
  res.render("home");
});

//about.hbs
app.get("/about", (req, res) => {
  res.render("about");
});


//addImages.hbs
app.get("/images/add", ensureLogin, function (req, res) {
  res.render("addImage");
});

// reading images
app.post("/images/add", upload.single("imageFile"), ensureLogin, (req, res) => {
  res.redirect("/images");
});


app.get("/images", ensureLogin, (req, res) => {
  fs.readdir("./public/images/uploaded", function (err, imageFile) {
    res.render("images", { imageFile });
  })
});

//departments.json
app.get("/departments", ensureLogin, (req, res) => {
  data_server.getDepartments()
    .then((data) => {
      if (data.length > 0) {
        res.render("departments", { departments: data })
      }
      else {
        res.render("departments", { "message": "no results" })
      }
    })
    .catch((err) => { res.render("departments", { "message": "no results" }) })
});


//employees.json
app.get("/employees", ensureLogin, (req, res) => {
  if (req.query.status) {
    data_server.getEmployeesByStatus(req.query.status)
      .then((data) => {
        if (data.length > 0) {
          res.render("employees", { employees: data })
        }
        else {
          res.render("employees", { "message": "no data" })
        }
      })
      .catch((err) => { res.render("employees", { "message": "no data" }) })
  }
  else if (req.query.department) {
    data_server.getEmployeesByDepartment(req.query.department)
      .then((data) => {
        if (data.length > 0) {
          res.render("employees", { employees: data })
        }
        else {
          res.render("employees", { "message": "no data" })
        }
      })
      .catch((err) => { res.render("employees", { "message": "no data" }) })
  }
  else if (req.query.manager) {
    data_server.getEmployeesByManager(req.query.manager)
      .then((data) => {
        if (data.length > 0) {
          res.render("employees", { employees: data })
        }
        else {
          res.render("employees", { "message": "no data" })
        }
      })
      .catch((err) => { res.render("employees", { "message": "no data" }) })
  }
  else {
    data_server.getAllEmployees()
      .then((data) => {
        console.log(data);
        if (data.length > 0) {
          res.render("employees", { employees: data })
        } else {
          res.render("employees", { "message": "no data" })
        }
      })
      .catch((err) => {
        res.render("employees", { "message": "no data" })
      });
  }

});


// post route for employees
app.post('/employees/add', ensureLogin, function (req, res) {
  data_server.addEmployee(req.body)
    .then(res.redirect('/employees'))
    .catch((err) => {
      res.status(500).send("Unable to add Employee");
    });
})

app.get("/employees/add", ensureLogin, (req, res) => {
  //res.sendFile(path.join(__dirname+"/views/addEmployee.html"));
  data_server.getDepartments()
    .then((data) => {
      console.log(data);
      res.render("addEmployee", { departments: data })
    })
    .catch((err) => {
      console.log(err);
      res.render("addEmployee", { departments: [] })
    })
});

// update employee data using post
app.post('/employee/update', ensureLogin, (req, res) => {
  console.log('update' + req.body);
  data_server.updateEmployee(req.body)
    .then(res.redirect('/employees'))
    .catch((err) => {
      res.status(500).send("Unable to Update Employee");
    });
});

// new function to get employee by num
app.get("/employee/:empNum", ensureLogin, (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};
  data_server.getEmployeeByNum(req.params.empNum).then((data) => {
    if (data) {
      viewData.employee = data; //store employee data in the "viewData" object as "employee"
    } else {
      viewData.employee = null; // set employee to null if none were returned
    }
  }).catch(() => {
    viewData.employee = null; // set employee to null if there was an error
  }).then(data_server.getDepartments)
    .then((data) => {
      viewData.departments = data; // store department data in the "viewData" object as "departments"
      // loop through viewData.departments and once we have found the departmentId that matches
      // the employee's "department" value, add a "selected" property to the matching
      // viewData.departments object
      for (let i = 0; i < viewData.departments.length; i++) {
        if (viewData.departments[i].departmentId == viewData.employee.department) {
          viewData.departments[i].selected = true;
        }
      }
    }).catch(() => {
      viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
      if (viewData.employee == null) { // if no employee - return an error
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData }); // render the "employee" view
      }
    });
});

// deleting employees
app.get('/employees/delete/:empNum', ensureLogin, (req, res) => {
  data_server.deleteEmployeeByNum(req.params.empNum)
    .then((data) => res.redirect("/employees"))
    .catch(() => res.status(500).send("Unable to Remove Employee / Employee not found"))
})

// get department
app.get("/departments/add", ensureLogin, function (req, res) {
  res.render("addDepartment");
});

// post department
app.post("/departments/add", ensureLogin, (req, res) => {
  data_server.addDepartment(req.body)
    .then(res.redirect("/departments"))
    .catch((err) => {
      res.status(500).send("Unable to add department");
    });
})

// update department
app.post('/department/update', ensureLogin, (req, res) => {
  console.log('update' + req.body);
  data_server.updateDepartment(req.body)
    .then(res.redirect('/departments'))
    .catch((err) => {
      res.status(500).send("Unable to Update department");
    });
});

// get department by department id
app.get("/department/:departmentId", ensureLogin, (req, res) => {
  data_server.getDepartmentById(req.params.departmentId)
    .then((data) => {
      res.render("department", { department: data });
    })
    .catch(() => {
      res.status(404).send("Department Not Found");
    })
})

// delete departments
app.get("/departments/delete/:departmentId", ensureLogin, (req, res) => {
  data_server.deleteDepartmentById(req.params.departmentId)
    .then((data) => {
      res.redirect("/departments");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Department / Department not found)");
    })
})




////////////////////////////////////////////////
app.use(function (req, res) {
  res.status(404).send("Page Not Found");
})


data_server.initialize()
  .then(dataServiceAuth.initialize)
  .then(() => { app.listen(HTTP_PORT, onHttpStart); })
  .catch(err => { console.log(err); })

