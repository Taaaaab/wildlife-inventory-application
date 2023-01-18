const Animal = require("../models/animal");
const AnimalClass = require("../models/class");
const Order = require("../models/order");
const PreserveStatus = require("../models/preservestatus");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = (req, res) => {
  async.parallel(
    {
      animal_count(callback) {
        Animal.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      preserve_status_count(callback) {
        PreserveStatus.countDocuments({}, callback);
      },
      preserve_status_current_count(callback) {
        PreserveStatus.countDocuments({ status: "Currently in preserve" }, callback);
      },
      class_count(callback) {
        AnimalClass.countDocuments({}, callback);
      },
      order_count(callback) {
        Order.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Wildlife Preserve Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all Books.
exports.animal_list = function (req, res, next) {
  Animal.find({}, "name binomial animalclass")
    .sort({ name: 1 })
    .populate("binomial")
    .populate("animalclass")
    .exec(function (err, list_animals) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("animal_list", { title: "Animal List", animal_list: list_animals });
    });
};

// Display detail page for a specific book.
exports.animal_detail = (req, res, next) => {
  async.parallel(
    {
      animal(callback) {
        Animal.findById(req.params.id)
          .populate("animalclass")
          .populate("order")
          .exec(callback);
      },
      preserve_status(callback) {
        PreserveStatus.find({ animal: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.animal == null) {
        // No results.
        const err = new Error("Animal not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("animal_detail", {
        title: results.animal.name,
        animal: results.animal,
        preserve_statuses: results.preserve_status,
      });
    }
  );
};

// Display book create form on GET.
exports.animal_create_get = (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel(
    {
      animalclasses(callback) {
        AnimalClass.find(callback);
      },
      orders(callback) {
        Order.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("animal_form", {
        title: "Create Animal",
        animalclasses: results.animalclasses,
        orders: results.orders,
      });
    }
  );
};

// Handle animal create on POST.
exports.animal_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.order)) {
      req.body.order =
        typeof req.body.order === "undefined" ? [] : [req.body.order];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("binomial", "Binomial must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("animalclass", "Class must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("order.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const animal = new Animal({
      name: req.body.name,
      binomial: req.body.binomial,
      description: req.body.description,
      animalclass: req.body.animalclass,
      order: req.body.order,
      img: req.body.img,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          animalclasses(callback) {
            AnimalClass.find(callback);
          },
          orders(callback) {
            Order.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const order of results.orders) {
            if (animal.order.includes(order._id)) {
              order.checked = "true";
            }
          }
          res.render("animal_form", {
            title: "Create Animal",
            animalclasses: results.animalclasses,
            orders: results.orders,
            animal,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save book.
    animal.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new book record.
      res.redirect(animal.url);
    });
  },
];

// Display Author delete form on GET.
exports.animal_delete_get = (req, res, next) => {
  async.parallel(
    {
      animal(callback) {
        Animal.findById(req.params.id).exec(callback);
      },
      animals_preservestatuses(callback) {
        PreserveStatus.find({ animal: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.animal == null) {
        // No results.
        res.redirect("/wildlife/animals");
      }
      // Successful, so render.
      res.render("animal_delete", {
        title: "Delete Animal",
        animal: results.animal,
        animal_preservestatuses: results.animals_preservestatuses,
      });
    }
  );
};

// Handle Author delete on POST.
exports.animal_delete_post = (req, res, next) => {
  async.parallel(
    {
      animal(callback) {
        Animal.findById(req.body.animalid).exec(callback);
      },
      animals_preservestatuses(callback) {
        PreserveStatus.find({ animal: req.body.animalid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.animals_preservestatuses.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render("animal_delete", {
          title: "Delete Animal",
          animal: results.animal,
          animal_preservestatuses: results.animals_preservestatuses,
        });
        return;
      }
      // Author has no books. Delete object and redirect to the list of authors.
      Animal.findByIdAndRemove(req.body.animalid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect("/wildlife/animals");
      });
    }
  );
};

// Display book update form on GET.
exports.animal_update_get = (req, res, next) => {
  // Get book, authors and genres for form.
  async.parallel(
    {
      animal(callback) {
        Animal.findById(req.params.id)
          .populate("animalclass")
          .populate("order")
          .exec(callback);
      },
      animalclasses(callback) {
        AnimalClass.find(callback);
      },
      orders(callback) {
        Order.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.animal == null) {
        // No results.
        const err = new Error("Animal not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (const order of results.orders) {
        for (const animalOrder of results.animal.order) {
          if (order._id.toString() === animalOrder._id.toString()) {
            order.checked = "true";
          }
        }
      }
      res.render("animal_form", {
        title: "Update Animal",
        animalclasses: results.animalclasses,
        orders: results.orders,
        animal: results.animal,
      });
    }
  );
};

// Handle book update on POST.
exports.animal_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.order)) {
      req.body.order =
        typeof req.body.order === "undefined" ? [] : [req.body.order];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("binomial", "Binomial name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("animalclass", "Class must not be empty").trim().isLength({ min: 1 }).escape(),
  body("order.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const animal = new Animal({
      name: req.body.name,
      binomial: req.body.binomial,
      description: req.body.description,
      animalclass: req.body.animalclass,
      order: typeof req.body.order === "undefined" ? [] : req.body.order,
      img: req.body.img,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          animalclasses(callback) {
            AnimalClass.find(callback);
          },
          orders(callback) {
            Order.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const order of results.orders) {
            if (animal.order.includes(order._id)) {
              order.checked = "true";
            }
          }
          res.render("animal_form", {
            title: "Update Animal",
            animalclasses: results.animalclasses,
            orders: results.orders,
            animal,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Animal.findByIdAndUpdate(req.params.id, animal, {}, (err, theanimal) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to book detail page.
      res.redirect(theanimal.url);
    });
  },
];