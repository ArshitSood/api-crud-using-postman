const Post = require('../models/Post');
const User = require('../models/User');

exports.getMyPosts = async (req, res) => {
    const posts = await Post.find({ userId: req.user.id });
    res.json(posts);
};

exports.getAllPosts = async (req, res) => {
    const posts = await Post.find();
    res.json(posts);
};

exports.createPost = async (req, res) => {
    const { title } = req.body;
    const newPost = new Post({ title, userId: req.user.id });
    await newPost.save();
    res.status(201).json({ message: 'Post created', post: newPost });
};

exports.updatePost = async (req, res) => {
    const { title } = req.body;
    const post = await Post.findById(req.params.id);
    const user = await User.findById(post.userId);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    if (user.id !== req.user.id) {
        return res.status(403).json({ message: 'You can only edit your own posts' });
    }
    post.title = title;
    await post.save();
    return res.json({ message: 'Post updated', post });
};

exports.deletePost = async (req, res) => {
    const post = await Post.findById(req.params.id);
    const user = await User.findById(post.userId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (user.id !== req.user.id) return res.status(403).json({ message: 'You can only delete your own posts' });

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
};