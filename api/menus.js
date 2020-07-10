const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

const menuItemsRouter = require('./menuItems.js');

menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = { $menuId: menuId };
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

// GET / Returns a 200 response containing all saved menus on the menus property of the response body
menusRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ menus: menus });
    }
  });
});

// POST / Creates a new menu with the information from the menu property of the request body and saves it to the database. Returns a 201 response with the newly-created menu on the menu property of the response body
// If any required fields are missing, returns a 400 response

// GET /:menuId
menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({ menu: req.menu });
});

// PUT /:menuId

// DELETE /:menuId

module.exports = menusRouter;
