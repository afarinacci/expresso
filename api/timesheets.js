const express = require('express');
const timesheetsRouter = express.Router({ mergeParams: true });
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = { $timesheetId: timesheetId };
  db.get(sql, values, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

// GET / Returns a 200 response containing all saved timesheets related to the employee with the supplied employee ID on the timesheets property of the response body
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response

// POST / Creates a new timesheet, related to the employee with the supplied employee ID, with the information from the timesheet property of the request body and saves it to the database. Returns a 201 response with the newly-created timesheet on the timesheet property of the response body
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response

// PUT /:timesheetId Updates the timesheet with the specified timesheet ID using the information from the timesheet property of the request body and saves it to the database. Returns a 200 response with the updated timesheet on the timesheet property of the response body
// If any required fields are missing, returns a 400 response
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response
// If an timesheet with the supplied timesheet ID doesn’t exist, returns a 404 response

// DELETE /:timesheetId Deletes the timesheet with the supplied timesheet ID from the database. Returns a 204 response
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response
// If an timesheet with the supplied timesheet ID doesn’t exist, returns a 404 response

module.exports = timesheetsRouter;
