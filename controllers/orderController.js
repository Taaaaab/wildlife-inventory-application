const Order = require("../models/order");
const Animal = require("../models/animal");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Authors.
exports.order_list = function (req, res, next) {
  Order.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_orders) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("order_list", {
        title: "Order List",
        order_list: list_orders,
      });
    });
};

// Display detail page for a specific Order.
exports.order_detail = (req, res, next) => {
  async.parallel(
    {
      order(callback) {
        Order.findById(req.params.id).exec(callback);
      },

      order_animals(callback) {
        Animal.find({ order: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.order == null) {
        // No results.
        const err = new Error("Order not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("order_detail", {
        title: "Order Detail",
        order: results.order,
        order_animals: results.order_animals,
      });
    }
  );
};

// Display Order create form on GET.
exports.order_create_get = (req, res, next) => {
  res.render("order_form", { title: "Create Order" });
};

// Handle Order create on POST.
exports.order_create_post = [
  // Validate and sanitize the name field.
  body("name", "Order name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const order = new Order({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("order_form", {
        title: "Create Order",
        order,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Order.findOne({ name: req.body.name }).exec((err, found_order) => {
        if (err) {
          return next(err);
        }

        if (found_order) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_order.url);
        } else {
          order.save((err) => {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect(order.url);
          });
        }
      });
    }
  },
];

// Display Author delete form on GET.
exports.order_delete_get = (req, res, next) => {
  async.parallel(
    {
      order(callback) {
        Order.findById(req.params.id).exec(callback);
      },
      orders_animals(callback) {
        Animal.find({ order: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.order == null) {
        // No results.
        res.redirect("/wildlife/orders");
      }
      // Successful, so render.
      res.render("order_delete", {
        title: "Delete Order",
        order: results.order,
        order_animals: results.orders_animals,
      });
    }
  );
};

// Handle Author delete on POST.
exports.order_delete_post = (req, res, next) => {
  async.parallel(
    {
      order(callback) {
        Order.findById(req.body.orderid).exec(callback);
      },
      orders_animals(callback) {
        Animal.find({ order: req.body.orderid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.orders_animals.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render("order_delete", {
          title: "Delete Order",
          order: results.order,
          order_animals: results.orders_animals,
        });
        return;
      }
      // Author has no books. Delete object and redirect to the list of authors.
      Order.findByIdAndRemove(req.body.orderid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect("/wildlife/orders");
      });
    }
  );
};

// Display book update form on GET.
exports.order_update_get = (req, res, next) => {
  // Get book, authors and genres for form.
  async.parallel(
    {
      order(callback) {
        Order.findById(req.params.id)
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.order == null) {
        // No results.
        const err = new Error("Order not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("order_form", {
        title: "Update Order",
        order: results.order,
      });
    }
  );
};

// Handle book update on POST.
exports.order_update_post = [

  // Validate and sanitize fields.
  body("name", "Order name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const order = new Order({
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

          res.render("order_form", {
            title: "Update Order",
            order,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Order.findByIdAndUpdate(req.params.id, order, {}, (err, theorder) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to book detail page.
      res.redirect(theorder.url);
    });
  },
];

