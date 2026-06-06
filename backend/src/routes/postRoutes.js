const express = require('express');
const { getPosts, createPost, toggleLike, addComment, getComments, deletePost } = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public (optional auth for isLiked enrichment)
router.get('/', optionalAuth, getPosts);
router.get('/:id/comments', getComments);

// Protected
router.post('/', protect, uploadSingle, createPost);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

module.exports = router;
