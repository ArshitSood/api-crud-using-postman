const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

router.get('/myposts', authenticateJWT, postController.getMyPosts);
router.get('/', authenticateJWT, postController.getAllPosts);
router.post('/', authenticateJWT, postController.createPost);
router.put('/:id', authenticateJWT, postController.updatePost);
router.delete('/:id', authenticateJWT, postController.deletePost);

module.exports = router;