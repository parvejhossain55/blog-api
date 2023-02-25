const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");

// Create a new category
router.post("/category", CategoryController.createCategory);

// Get all categories
router.get("/category", CategoryController.getAllCategories);

// Get a category by ID
router.get("/category/:id", CategoryController.getCategoryById);

// Update a category by ID
router.put("/category/:id", CategoryController.updateCategoryById);

// Delete a category by ID
router.delete("/category/:id", CategoryController.deleteCategoryById);

module.exports = router;
