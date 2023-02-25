const mongoose = require("mongoose");
const slugify = require("slugify");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published", "pending", "review"],
      default: "draft",
    },
    tags: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    likes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    related_posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    comments: {
      type: [
        {
          text: {
            type: String,
            required: true,
          },
          author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { versionKey: false, timestamps: true }
);

postSchema.pre("save", async function (next) {
  try {
    this.slug = slugify(this.title, { lower: true });
    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model("Post", postSchema);

// {
//   "title": "It can help you maintain a healthy weight",
//   "content": "Regular exercise has numerous benefits for your physical and mental health. It can help you maintain a healthy weight, reduce your risk of chronic diseases like heart disease and diabetes, improve your mood and cognitive function, and much more. In this post, we'll explore some of the key benefits of regular exercise and why you should make it a part of your daily routine.",
//   "author": "63f9f2af8b05ce58a3175268",
//   "imageUrl": "https://example.com/exercise.jpg",
//   "isFeatured": true,
//   "tags": ["exercise", "fitness", "health"],
//   "category": ["63f9aa63dc7dd3c06db30075", "63f9d98468c9038b64d43482"],
//   "status": "published",
//   // "likes": ["63f9f2af8b05ce58a3175268"],
//   "views": 1000,
//   // "related_posts": ["63f9b2468d91d054284494d2"],
//   "comments": [
//     {
//       "text": "Great post! I've been trying to get back into exercising regularly and this was really motivating.",
//       "author": "63f9f2af8b05ce58a3175268"
//     },
//   ]
// }
