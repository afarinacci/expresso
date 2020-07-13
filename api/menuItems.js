const express = require('express');
const menuItemsRouter = express.Router({ mergeParams: true });
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = { $menuItemId: menuItemId };
  db.get(sql, values, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

// GET / Returns a 200 response containing all saved menu items related to the menu with the supplied menu ID on the menuItems property of the response body
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response
menuItemsRouter.get('/', (req, res, next) => {
  db.all(
    `SELECT * FROM MenuItem WHERE MenuItem.menu_id=${req.params.menuId}`,
    (err, menuItems) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ menuItems: menuItems });
      }
    }
  );
});

// POST /
// Creates a new menu item, related to the menu with the supplied menu ID, with the information from the menuItem property of the request body and saves it to the database. Returns a 201 response with the newly-created menu item on the menuItem property of the response body
// If any required fields are missing, returns a 400 response
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response
menuItemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;
  db.get(
    `SELECT * FROM Menu WHERE Menu.id = $menuId`,
    { $menuId: menuId },
    (error, menu) => {
      if (error) {
        next(error);
      } else {
        if (!name || !inventory || !price || !menu) {
          return res.sendStatus(400);
        }
        db.run(
          `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)`,
          {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: menuId,
          },
          function (error) {
            if (error) {
              next(error);
            } else {
              db.get(
                `SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
                (error, menuItem) => {
                  res.status(201).json({ menuItem: menuItem });
                }
              );
            }
          }
        );
      }
    }
  );
});

// PUT /:menuItemId Updates the menu item with the specified menu item ID using the information from the menuItem property of the request body and saves it to the database. Returns a 200 response with the updated menu item on the menuItem property of the response body
// If any required fields are missing, returns a 400 response
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response
// If a menu item with the supplied menu item ID doesn’t exist, returns a 404 response
menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const menuItemId = req.params.menuItemId;
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;
  db.get(
    `SELECT * FROM Menu WHERE Menu.id = $menuId`,
    { $menuId: menuId },
    (error, menu) => {
      if (error) {
        next(error);
      } else {
        if (!name || !inventory || !price || !menu) {
          return res.sendStatus(400);
        }
        db.run(
          `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE MenuItem.id = $menuItemId`,
          {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: menuId,
            $menuItemId: menuItemId,
          },
          function (error) {
            if (error) {
              next(error);
            } else {
              db.get(
                `SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
                (error, menuItem) => {
                  res.status(200).json({ menuItem: menuItem });
                }
              );
            }
          }
        );
      }
    }
  );
});

// DELETE /:menuItemId Deletes the menu item with the supplied menu item ID from the database. Returns a 204 response.
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response
// If a menu item with the supplied menu item ID doesn’t exist, returns a 404 response
menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run(
    `DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId`,
    { $menuItemId: req.params.menuItemId },
    (error) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
      }
    }
  );
});

module.exports = menuItemsRouter;
