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
menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  }
  db.run(
    `INSERT INTO Menu (title) VALUES ($title)`,
    {
      $title: title,
    },
    function (error) {
      if (error) {
        next(error);
      } else {
        db.get(
          `SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
          (error, menu) => {
            res.status(201).json({ menu: menu });
          }
        );
      }
    }
  );
});

// GET /:menuId
menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({ menu: req.menu });
});

// PUT /:menuId
menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  }
  db.run(
    `UPDATE Menu SET title = $title WHERE Menu.id = $menuId`,
    {
      $title: title,
      $menuId: req.params.menuId,
    },
    (error) => {
      if (error) {
        next(error);
      } else {
        db.get(
          `SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
          (error, menu) => {
            res.status(200).json({ menu: menu });
          }
        );
      }
    }
  );
});

// DELETE /:menuId
menusRouter.delete('/:menuId', (req, res, next) => {
  db.get(
    `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`,
    { $menuId: req.params.menuId },
    (error, menuItem) => {
      if (error) {
        next(error);
      } else if (menuItem) {
        return res.sendStatus(400);
      } else {
        db.run(
          `DELETE FROM Menu WHERE Menu.id = $menuId`,
          { $menuId: req.params.menuId },
          (error) => {
            if (error) {
              next(error);
            } else {
              res.sendStatus(204);
            }
          }
        );
      }
    }
  );
});

module.exports = menusRouter;
