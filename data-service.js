var exports = module.exports = {};

const Sequelize = require('sequelize');
var sequelize = new Sequelize('dfva5fgj1r3vnf','swotfpraivoljq','dea810702079ca69f68be08b544969d613c4efad28d0beac90b7ef53d1621fc0',{
    host:'ec2-54-243-28-109.compute-1.amazonaws.com',
    dialect:'postgres',
    port: 5432,
    dialectOptions:{
        ssl: true
    }
});


let employee = sequelize.define('employee', {

    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
});

let department = sequelize.define('department', {

    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING

});

/////// AS A SINGLE DEPARTMENT CAN HAVE MANY EMPLOYEES, SO DEPARTMENT IS A FOREIGN KEY TO EMPLOYEES....
/* This will ensure that our Employee model gets a "department" column that will act as a foreign key to the
Department model. When a Department is deleted, any associated Employee's will have a "null" value set to
their "department" foreign key.
*/

department.hasMany(employee, { foreignKey: 'department' });


module.exports.initialize = function () {

    return new Promise((resolve, reject) => {

        sequelize.sync().then(() => {
            resolve();
        }).catch(() => {

            reject("unable to sync the database");

        });
    });
}

module.exports.getAllEmployees = () => {
    console.log("getting all employees!!")

    return new Promise((resolve, reject) => {

        employee.findAll().then(() => {
            resolve(employee.findAll())


        }).catch(() => { reject("no results returned") });
    });
}


module.exports.getDepartments = () => {
    return new Promise((resolve, reject) => {

        department.findAll().
            then(() => {
                resolve(department.findAll())

            }).catch(() => {


                reject("no results returned")

            });
    });
}

////////////////////////////   getEmployeesByDepartment(department) Function


module.exports.getEmployeesByDepartment = (department) => {

    return new Promise((resolve, reject) => {

        employee.findAll({
            where: {
                department: department
            }
        }).
            then(() =>
                resolve(employee.findAll({
                    where: {
                        department: department
                    }

                }))).catch(() => {

                    reject("no results returned");

                });
    });

}

/////////////////////////     getEmployeesByManager(manager) Function 

module.exports.getEmployeesByManager = (manager) => {

    return new Promise((resolve, reject) => {

        employee.findAll({
            where: {
                employeeManagerNum: manager

            }
        }).then(() =>

            resolve(employee.findAll({
                where: {
                    employeeManagerNum: manager

                }
            })))
            .catch(() => {
                reject("no results returned");
            })
    });

}

/////////////  Add the getEmployeesByStatus(status) Function 

module.exports.getEmployeesByStatus = (status) => {


    return new Promise((resolve, reject) => {

        employee.findAll({
            where: {
                status: status
            }
        }).then(() =>

            resolve(employee.findAll({
                where: {
                    status: status

                }
            })))
            .catch(() => {
                reject("no results returned");
            })
    });
}



//////////////////////////      getEmployeeByNum(num) Function 

module.exports.getEmployeeByNum = (num) => {

    return new Promise((resolve, reject) => {

        employee.findAll({
            where: {
                employeeNum: num

            }
        }).then(() =>

            resolve(employee.findAll({
                where: {
                    employeeNum: num

                }
            })))
            .catch(() => {
                reject("no results returned");
            })
    });
}


// definig a function to add employees to the array of employee

module.exports.addEmployee = function (employeeData) {
    var EmployeeData = employeeData;
    return new Promise(function (resolve, reject) {
        EmployeeData.isManager = employeeData.isManager ? true : false;
        for (var param in employeeData) {
            EmployeeData[param] = employeeData[param] === "" ? null : employeeData[param];
        }
        employee.create(employeeData)
            .then((result) => resolve(result))
            .catch(error => reject("unable to create employee: " + error));
    });
}

///////////////// addDepartment(departmentData)

module.exports.addDepartment = (departmentData) => {

    for (const prop in departmentData) {
        if (departmentData.prop == " ") {
            prop = null;
        }
    }

    return new Promise((resolve, reject) => {
        department.create(departmentData).then(() => {
            resolve(data)
        })
            .catch(() => {
                reject("unable to create department");
            })
        console.log(departmentData);
    });

}

module.exports.updateDepartment = function (departmentData) {
    for (prop in departmentData) {
        if (prop == "") prop = null;
    }
    return new Promise((resolve, reject) => {
        department.update(departmentData, { where: { departmentId: departmentData.departmentId } })
            .then(() => resolve(department.update(departmentData, { where: { departmentId: departmentData.departmentId } })))
            .catch(() => reject("unable to update department"))
    });
};

/////////////////////  getDepartmentById(id)
module.exports.getDepartmentById = (id) => {

    return new Promise((resolve, reject) => {

        department.findAll({
            where: {
                departmentId: id

            }
        }).then(() =>

            resolve(department.findAll({
                where: {
                    departmentId: id

                }
            })))
            .catch(() => {
                reject("no results return");
            })
    });
}


//////////////////////    deleteDepartmentById(id)


module.exports.deleteDepartmentById = (id) => {

    return new Promise((resolve, reject) => {
        department.destroy({
            where: {
                departmentId: id

            }
        }).then(() => {
            resolve(department.destroy({
                where: {
                    departmentId: id

                }
            }))
        })

            .catch(() => {
                reject("no results returned");
            })

    });

}

///////////////////////


module.exports.updateEmployee = function (employeeData) {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for (prop in employeeData) {
        if (prop == "") prop = null;
    }
    return new Promise((resolve, reject) => {
        employee.update(employeeData, { where: { employeeNum: employeeData.employeeNum } })
            .then(() => resolve(employee.update(employeeData, { where: { employeeNum: employeeData.employeeNum } })))
            .catch(() => reject("unable to update employee"))
    });
};

///////////////////// delete employee by empnum

exports.deleteEmployeeByNum = function (empNum) {
    return new Promise((resolve, reject) => {
        employee.destroy({ where: { employeeNum: empNum } })
            .then(() => resolve(employee.destroy({ where: { employeeNum: empNum } })))
            .catch(() => reject("unable to delete employee"))
    });
};