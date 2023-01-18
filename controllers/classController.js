const AnimalClass = require("../models/class");
const async = require("async");
const Animal = require("../models/animal");
const { body, validationResult } = require("express-validator");

// Display list of all Authors.
exports.class_list = function (req, res, next) {
  AnimalClass.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_classes) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("class_list", {
        title: "Class List",
        class_list: list_classes,
      });
    });
};

// Display detail page for a specific Class.
exports.class_detail = (req, res, next) => {
  async.parallel(
    {
      animalclass(callback) {
        AnimalClass.findById(req.params.id).exec(callback);
      },
      classes_animals(callback) {
        Animal.find({ animalclass: req.params.id }, "name binomial description").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      if (results.animalclass == null) {
        // No results.
        const err = new Error("Class not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("class_detail", {
        title: "Class Detail",
        animalclass: results.animalclass,
        class_animals: results.classes_animals,
      });
    }
  );
};

// Display Author create form on GET.
exports.class_create_get = (req, res, next) => {
  res.render("class_form", { title: "Create Class" });
};

// Handle Author create on POST.
exports.class_create_post = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Class must be specified.")
    .isAlphanumeric()
    .withMessage("Class has non-alphanumeric characters."),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("class_form", {
        title: "Create Class",
        animalclass: req.body,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    // Create an Author object with escaped and trimmed data.
    const animalclass = new AnimalClass({
      name: req.body.name,
    });
    animalclass.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new author record.
      res.redirect(animalclass.url);
    });
  },
];

// Display Author delete form on GET.
exports.class_delete_get = (req, res, next) => {
  async.parallel(
    {
      animalclass(callback) {
        AnimalClass.findById(req.params.id).exec(callback);
      },
      animalclasses_animals(callback) {
        Animal.find({ animalclass: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.animalclass == null) {
        // No results.
        res.redirect("/wildlife/classes");
      }
      // Successful, so render.
      res.render("class_delete", {
        title: "Delete Class",
        animalclass: results.animalclass,
        animalclass_animals: results.animalclasses_animals,
      });
    }
  );
};

// Handle Author delete on POST.
exports.class_delete_post = (req, res, next) => {
  async.parallel(
    {
      animalclass(callback) {
        AnimalClass.findById(req.body.animalclassid).exec(callback);
      },
      animalclasses_animals(callback) {
        Animal.find({ animalclass: req.body.animalclassid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.animalclasses_animals.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render("class_delete", {
          title: "Delete Class",
          animalclass: results.animalclass,
          animalclass_animals: results.animalclasses_animals,
        });
        return;
      }
      // Author has no books. Delete object and redirect to the list of authors.
      AnimalClass.findByIdAndRemove(req.body.animalclassid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect("/wildlife/classes");
      });
    }
  );
};


// Display book update form on GET.
exports.class_update_get = (req, res, next) => {
  // Get book, authors and genres for form.
  async.parallel(
    {
      animalclass(callback) {
        AnimalClass.findById(req.params.id)
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.animalclass == null) {
        // No results.
        const err = new Error("Class not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("class_form", {
        title: "Update Class",
        animalclass: results.animalclass,
      });
    }
  );
};

// Handle book update on POST.
exports.class_update_post = [

  // Validate and sanitize fields.
  body("name", "Class name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const animalclass = new AnimalClass({
      name: req.body.name,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(

        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render("class_form", {
            title: "Update Class",
            animalclass,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    AnimalClass.findByIdAndUpdate(req.params.id, animalclass, {}, (err, theclass) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to book detail page.
      res.redirect(theclass.url);
    });
  },
];
