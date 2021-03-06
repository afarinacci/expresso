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
timesheetsRouter.get('/', (req, res, next) => {
  const sql = `SELECT * FROM Timesheet WHERE Timesheet.employee_id = ${req.params.employeeId}`;
  db.all(sql, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({ timesheets: timesheets });
    }
  });
});

// POST / Creates a new timesheet, related to the employee with the supplied employee ID, with the information from the timesheet property of the request body and saves it to the database. Returns a 201 response with the newly-created timesheet on the timesheet property of the response body
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response
timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;
  if (!hours || !rate || !date) {
    return res.sendStatus(400);
  }
  db.run(
    `INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)`,
    {
      $hours: hours,
      $rate: rate,
      $date: date,
      $employeeId: employeeId,
    },
    function (error) {
      if (error) {
        next(error);
      } else {
        db.get(
          `SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
          (error, timesheet) => {
            res.status(201).json({ timesheet: timesheet });
          }
        );
      }
    }
  );
});

// PUT /:timesheetId Updates the timesheet with the specified timesheet ID using the information from the timesheet property of the request body and saves it to the database. Returns a 200 response with the updated timesheet on the timesheet property of the response body
// If any required fields are missing, returns a 400 response
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response
// If an timesheet with the supplied timesheet ID doesn’t exist, returns a 404 response
timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;
  if (!hours || !rate || !date) {
    return res.sendStatus(400);
  }
  db.run(
    `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE Timesheet.id = $timesheetId`,
    {
      $hours: hours,
      $rate: rate,
      $date: date,
      $employeeId: employeeId,
      $timesheetId: req.params.timesheetId,
    },
    function (error) {
      if (error) {
        next(error);
      } else {
        db.get(
          `SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
          (error, timesheet) => {
            res.status(200).json({ timesheet: timesheet });
          }
        );
      }
    }
  );
});

// DELETE /:timesheetId Deletes the timesheet with the supplied timesheet ID from the database. Returns a 204 response
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response
// If an timesheet with the supplied timesheet ID doesn’t exist, returns a 404 response
timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.run(
    `DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId`,
    { $timesheetId: req.params.timesheetId },
    (error) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
      }
    }
  );
});

module.exports = timesheetsRouter;
