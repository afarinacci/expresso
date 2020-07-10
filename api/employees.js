const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

const timesheetsRouter = require('./timesheets.js');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = { $employeeId: employeeId };
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

// GET / Returns a 200 response containing all saved currently-employed employees (is_current_employee is equal to 1) on the employees property of the response body

// POST / Creates a new employee with the information from the employee property of the request body and saves it to the database. Returns a 201 response with the newly-created employee on the employee property of the response body
// If any required fields are missing, returns a 400 response

// GET /:employeeId Returns a 200 response containing the employee with the supplied employee ID on the employee property of the response body
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response

// PUT /:employeeId Updates the employee with the specified employee ID using the information from the employee property of the request body and saves it to the database. Returns a 200 response with the updated employee on the employee property of the response body
// If any required fields are missing, returns a 400 response
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response

// DELETE /:employeeId Updates the employee with the specified employee ID to be unemployed (is_current_employee equal to 0). Returns a 200 response.
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response

module.exports = employeesRouter;
