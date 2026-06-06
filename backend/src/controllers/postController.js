const Post = require('../models/Post');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// GET /api/posts  — paginated feed with sorting
const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'recent';
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let sortObj = { createdAt: -1 };
    if (sort === 'mostLiked') sortObj = { likesCount: -1, createdAt: -1 };
    if (sort === 'mostCommented') sortObj = { commentsCount: -1, createdAt: -1 };

    const matchObj = {};
    if (search.trim()) {
      matchObj.text = { $regex: search.trim(), $options: 'i' };
    }

    const pipeline = [];
    if (search.trim()) {
      pipeline.push({ $match: matchObj });
    }

    pipeline.push(
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
        },
      },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [{ $project: { username: 1, avatar: 1, email: 1 } }],
        },
      },
      { $unwind: '$author' },
    );

    const [posts, totalCount] = await Promise.all([
      Post.aggregate(pipeline),
      Post.countDocuments(matchObj),
    ]);

    const userId = req.user?.id || req.user?._id;
    const enrichedPosts = posts.map((post) => ({
      ...post,
      isLiked: userId
        ? post.likes.some((id) => id.toString() === userId.toString())
        : false,
    }));

    res.json({
      success: true,
      data: enrichedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalPosts: totalCount,
        hasMore: page * limit < totalCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    if (!text?.trim() && !imageUrl) {
      return res.status(400).json({ success: false, message: 'Post must contain text or an image' });
    }

    const post = await Post.create({
      author: req.user._id,
      text: text?.trim() || '',
      imageUrl,
    });

    const populated = await Post.findById(post._id).populate('author', 'username avatar email');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        ...populated.toObject(),
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
      },
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

// PUT /api/posts/:id/like  — toggle like
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);

      // Create notification for post author
      if (post.author.toString() !== userId) {
        const authorUser = await User.findById(post.author);
        if (authorUser) {
          authorUser.notifications.push({
            type: 'like',
            sender: req.user._id,
            senderName: req.user.username,
            postId: post._id,
          });
          await authorUser.save();
        }
      }
    }

    await post.save();

    res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: post.likes.length,
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/comment
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const user = await User.findById(req.user._id);

    post.comments.push({
      user: req.user._id,
      username: user.username,
      avatar: user.avatar || '',
      text: text.trim(),
    });

    await post.save();

    // Create notification for post author
    if (post.author.toString() !== req.user._id.toString()) {
      const authorUser = await User.findById(post.author);
      if (authorUser) {
        authorUser.notifications.push({
          type: 'comment',
          sender: req.user._id,
          senderName: req.user.username,
          postId: post._id,
        });
        await authorUser.save();
      }
    }

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added',
      comment: newComment,
      commentsCount: post.comments.length,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id/comments
const getComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).select('comments');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const sorted = [...post.comments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ success: true, comments: sorted });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    if (post.imageUrl) {
      const filePath = path.join(__dirname, '../../', post.imageUrl);
      fs.unlink(filePath, () => {});
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPosts, createPost, toggleLike, addComment, getComments, deletePost };
