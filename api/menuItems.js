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

// POST /
// Creates a new menu item, related to the menu with the supplied menu ID, with the information from the menuItem property of the request body and saves it to the database. Returns a 201 response with the newly-created menu item on the menuItem property of the response body
// If any required fields are missing, returns a 400 response
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response

// PUT /:menuItemId Updates the menu item with the specified menu item ID using the information from the menuItem property of the request body and saves it to the database. Returns a 200 response with the updated menu item on the menuItem property of the response body
// If any required fields are missing, returns a 400 response
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response
// If a menu item with the supplied menu item ID doesn’t exist, returns a 404 response

// DELETE /:menuItemId Deletes the menu item with the supplied menu item ID from the database. Returns a 204 response.
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response
// If a menu item with the supplied menu item ID doesn’t exist, returns a 404 response

module.exports = menuItemsRouter;
