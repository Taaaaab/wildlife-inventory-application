const express = require("express");
const router = express.Router();

// Require controller modules.
const animal_controller = require("../controllers/animalController");
const class_controller = require("../controllers/classController");
const order_controller = require("../controllers/orderController");
const preserve_status_controller = require("../controllers/preservestatusController");

/// ROUTES ///

// GET home page.
router.get("/", animal_controller.index);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get("/animal/create", animal_controller.animal_create_get);

// POST request for creating Book.
router.post("/animal/create", animal_controller.animal_create_post);

// GET request to delete Book.
router.get("/animal/:id/delete", animal_controller.animal_delete_get);

// POST request to delete Book.
router.post("/animal/:id/delete", animal_controller.animal_delete_post);

// GET request to update Book.
router.get("/animal/:id/update", animal_controller.animal_update_get);

// POST request to update Book.
router.post("/animal/:id/update", animal_controller.animal_update_post);

// GET request for one Book.
router.get("/animal/:id", animal_controller.animal_detail);

// GET request for list of all Book items.
router.get("/animals", animal_controller.animal_list);

/// CLASS ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
router.get("/class/create", class_controller.class_create_get);

// POST request for creating Author.
router.post("/class/create", class_controller.class_create_post);

// GET request to delete Author.
router.get("/class/:id/delete", class_controller.class_delete_get);

// POST request to delete Author.
router.post("/class/:id/delete", class_controller.class_delete_post);

// GET request to update Author.
router.get("/class/:id/update", class_controller.class_update_get);

// POST request to update Author.
router.post("/class/:id/update", class_controller.class_update_post);

// GET request for one Author.
router.get("/class/:id", class_controller.class_detail);

// GET request for list of all Authors.
router.get("/classes", class_controller.class_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get("/order/create", order_controller.order_create_get);

//POST request for creating Genre.
router.post("/order/create", order_controller.order_create_post);

// GET request to delete Genre.
router.get("/order/:id/delete", order_controller.order_delete_get);

// POST request to delete Genre.
router.post("/order/:id/delete", order_controller.order_delete_post);

// GET request to update Genre.
router.get("/order/:id/update", order_controller.order_update_get);

// POST request to update Genre.
router.post("/order/:id/update", order_controller.order_update_post);

// GET request for one Genre.
router.get("/order/:id", order_controller.order_detail);

// GET request for list of all Genre.
router.get("/orders", order_controller.order_list);

/// BOOKINSTANCE ROUTES ///

// GET request for creating a BookInstance. NOTE This must come before route that displays BookInstance (uses id).
router.get(
  "/preservestatus/create",
  preserve_status_controller.preservestatus_create_get
);

// POST request for creating BookInstance.
router.post(
  "/preservestatus/create",
  preserve_status_controller.preservestatus_create_post
);

// GET request to delete BookInstance.
router.get(
  "/preservestatus/:id/delete",
  preserve_status_controller.preservestatus_delete_get
);

// POST request to delete BookInstance.
router.post(
  "/preservestatus/:id/delete",
  preserve_status_controller.preservestatus_delete_post
);

// GET request to update BookInstance.
router.get(
  "/preservestatus/:id/update",
  preserve_status_controller.preservestatus_update_get
);

// POST request to update BookInstance.
router.post(
  "/preservestatus/:id/update",
  preserve_status_controller.preservestatus_update_post
);

// GET request for one BookInstance.
router.get("/preservestatus/:id", preserve_status_controller.preservestatus_detail);

// GET request for list of all BookInstance.
router.get("/preservestatuses", preserve_status_controller.preservestatus_list);

module.exports = router;
