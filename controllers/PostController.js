const { mongo } = require("mongoose");
const Post = require("../models/PostModel");

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .populate("category", "name");
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get a single post by id
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email")
      .populate("category", "name");
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a post by id
exports.updatePostById = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    post = Object.assign(post, req.body);
    await post.save();
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a post by id
exports.deletePostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    await post.remove();
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Add a comment to a post by id
exports.addCommentToPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ success: false, error: "Post not found" });

    const comment = {
      text: req.body.text,
      author: req.user._id,
    };

    post.comments.unshift(comment);
    await post.save();
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get 5 related post in same type
exports.getRelatedPosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const relatedPosts = await Post.find({
      $and: [
        { _id: { $ne: post._id } },
        { $or: [{ category: post.category }, { tags: { $in: post.tags } }] },
      ],
    }).limit(5);

    res.status(200).json({ relatedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get post by category
exports.getPostByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const posts = await Post.find({ category: categoryId }).populate(
      "author",
      "name email"
    );

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get post by Tag
exports.getPostsByTag = async (req, res) => {
  try {
    const { tag } = req.query;

    const posts = await Post.find({
      tags: { $in: [tag] },
      status: "published",
    })
      .populate("category", "name")
      .populate("author", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Filter post
exports.filterPosts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) filter.category = mongoose.Schema.Types.ObjectId(category);

    if (!search) {
      const posts = await Post.find(filter)
        .populate("category")
        .populate("author");
      return res.json(posts);
    }

    const posts = await Post.find({ $text: { $search: search } })
      .populate("category")
      .populate("author");
    return res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get popular post
exports.getPopularPosts = async (req, res) => {
  try {
    let postSize = req.query.size || 6;

    const popularPosts = await Post.find({ status: "published" })
      .sort({ likes: -1, views: -1 })
      .limit(postSize)
      .populate("author", "name")
      .populate("category", "name")
      .select("title slug content imageUrl likes views createdAt");

    res.status(200).json(popularPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
