const express = require("express");
const router = express.Router();
const PostController = require("../controllers/PostController");
const isAuthenticated = require("../middleware/isAuthenticated");

// Create a new post
router.post("/posts", isAuthenticated, PostController.createPost);

// Get all posts
router.get("/posts", PostController.getPosts);

// Get a specific post by ID
router.get("/posts/:id", PostController.getPostById);

// Update a specific post by ID
router.put("/posts/:id", isAuthenticated, PostController.updatePostById);

// Delete a specific post by ID
router.delete("/posts/:id", isAuthenticated, PostController.deletePostById);

// Add comment to a specific post by ID
router.post(
  "/posts/:id/comments",
  isAuthenticated,
  PostController.addCommentToPostById
);

// Get 5 related post in the same category
router.get("/posts/:postId/related", PostController.getRelatedPosts);

// Get posts by category
router.get("/posts/category/:categoryId", PostController.getPostByCategory);

// Get post by Tag
router.get("/posts/tags", PostController.getPostsByTag);

// Get popular post
router.get("/posts/popular-post", PostController.getPopularPosts);

// Route for searching posts
router.get("/posts/search", PostController.searchPosts);

module.exports = router;
