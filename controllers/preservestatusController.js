const PreserveStatus = require("../models/preservestatus");
const { body, validationResult } = require("express-validator");
const Animal = require("../models/animal");
const async = require("async");
const preservestatus = require("../models/preservestatus");

// Display list of all BookInstances.
exports.preservestatus_list = function (req, res, next) {
  PreserveStatus.find()
    .populate("animal")
    .exec(function (err, list_preservestatus) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render("preservestatus_list", {
        title: "Preserve Status List",
        preservestatus_list: list_preservestatus,
      });
    });
};

// Display detail page for a specific PreserveStatus.
exports.preservestatus_detail = (req, res, next) => {
  PreserveStatus.findById(req.params.id)
    .populate("animal")
    .exec((err, preservestatus) => {
      if (err) {
        return next(err);
      }
      if (preservestatus == null) {
        // No results.
        const err = new Error("Animal not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("preservestatus_detail", {
        title: `Copy: ${preservestatus.animal.name}`,
        preservestatus,
      });
    });
};

// Display BookInstance create form on GET.
exports.preservestatus_create_get = (req, res, next) => {
  Animal.find({}, "name").exec((err, animals) => {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render("preservestatus_form", {
      title: "Create Preserve Status",
      animal_list: animals,
    });
  });
};

// Handle BookInstance create on POST.
exports.preservestatus_create_post = [
  // Validate and sanitize fields.
  body("animal", "Animal must be specified").trim().isLength({ min: 1 }).escape(),
  body("name", "Name must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("expected_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const preservestatus = new PreserveStatus({
      animal: req.body.animal,
      name: req.body.name,
      status: req.body.status,
      expected_back: req.body.expected_back,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Animal.find({}, "name").exec(function (err, animals) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("preservestatus_form", {
          title: "Create Preserve Status",
          animal_list: animals,
          selected_animal: preservestatus.animal._id,
          errors: errors.array(),
          preservestatus,
        });
      });
      return;
    }

    // Data from form is valid.
    preservestatus.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new record.
      res.redirect(preservestatus.url);
    });
  },
];

// Display Author delete form on GET.
exports.preservestatus_delete_get = (req, res, next) => {
  async.parallel(
    {
      preservestatus(callback) {
        PreserveStatus.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.preservestatus == null) {
        // No results.
        res.redirect("/wildlife/preservestatuses");
      }
      // Successful, so render.
      res.render("preservestatus_delete", {
        title: "Delete Preserve Status",
        preservestatus: results.preservestatus,
      });
    }
  );
};

// Handle Author delete on POST.
exports.preservestatus_delete_post = (req, res, next) => {
  async.parallel(
    {
      preservestatus(callback) {
        PreserveStatus.findById(req.body.preservestatusid).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success

      // Author has no books. Delete object and redirect to the list of authors.
      PreserveStatus.findByIdAndRemove(req.body.preservestatusid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect("/wildlife/preservestatuses");
      });
    }
  );
};

// Display book update form on GET.
exports.preservestatus_update_get = (req, res, next) => {
  // Get book, authors and genres for form.
  async.parallel(
    {
      preservestatus(callback) {
        PreserveStatus.findById(req.params.id).exec(callback);
      },
      animals(callback) {
        Animal.find({}, "name").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.preservestatus == null) {
        // No results.
        const err = new Error("Preserve Status not found");
        err.status = 404;
        return next(err);
      }
      // Success.

      res.render("preservestatus_form", {
        title: "Update Preserve Status",
        animal_list: results.animals,
        preservestatus: results.preservestatus,
      });
    }
  );
};

// Handle book update on POST.
exports.preservestatus_update_post = [

  // Validate and sanitize fields.
  body("name", "Animal name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const preservestatus = new PreserveStatus({
      animal: req.body.animal,
      name: req.body.name,
      status: req.body.status,
      expected_back: req.body.expected_back,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        Animal.find({}, "name").exec(function (err, animals) {
          if (err) {
            return next(err);
          }
          res.render("preservestatus_form", {
            title: "Update Preserve Status",
            animal_list: animals,
            selected_animal: preservestatus.animal._id,
            preservestatus,
            errors: errors.array(),
        })
        return;
      }
      ))
    }

    // Data from form is valid. Update the record.
    PreserveStatus.findByIdAndUpdate(req.params.id, preservestatus, {}, (err, thepreservestatus) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to book detail page.
      res.redirect(thepreservestatus.url);
    });
  },
];

