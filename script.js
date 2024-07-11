const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require("dotenv").config();

const port = process.env.PORT || 3000;
console.log(`Server will start on port: ${port}`);

const SECRET_KEY = process.env.SECRET_KEY;
app.set("view engine", "ejs");

app.use(express.static("./public"));
app.use(express.json());

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const users = [
    { id: 1, username: 'user1', password: 'password1' },
    { id: 2, username: 'user2', password: 'password2' }
];

let posts = [
    { id: 1, title: 'Post One', userId: 1 },
    { id: 2, title: 'Post Two', userId: 1 },
    { id: 3, title: 'Post Three', userId: 2 },
    { id: 4, title: 'Post Four', userId: 2 },
];

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    const newUser = { id: users.length + 1, username, password };
    users.push(newUser);
    res.status(201).json({ message: 'User created', user: newUser });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign({ username: user.username, id: user.id }, SECRET_KEY, { expiresIn: '2 hours'});
    res.json({ accessToken });
});

app.get('/myposts', authenticateJWT, (req, res) => {
    res.json( posts.filter(post => post.userId ===req.user.id));
});

app.get('/posts',authenticateJWT, (req, res) => {
    res.json(posts);
});

app.post('/posts', authenticateJWT, (req, res) => {
    const { title } = req.body;
    const newPost = { id: posts.length + 1, title, userId: req.user.id };
    posts.push(newPost);
    res.status(201).json({ message: 'Post created', post: newPost });
});

app.put('/posts/:id', authenticateJWT, (req, res) => {
    const { title } = req.body;
    let post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId !== req.user.id) return res.status(403).json({ message: 'You can only edit your own posts' });

    post.title = title;
    return res.json({ message: 'Post updated', post });
});

app.delete('/posts/:id', authenticateJWT, (req, res) => {
    const postIndex = posts.findIndex(p => p.id === parseInt(req.params.id));
    if (postIndex === -1) return res.status(404).json({ message: 'Post not found' });

    if (posts[postIndex].userId !== req.user.id) return res.status(403).json({ message: 'You can only delete your own posts' });

    posts.splice(postIndex, 1);
    res.json({ message: 'Post deleted' });
});

app.get('/error', (req, res, next) => {
    const err = new Error('Something went wrong!');
    next(err);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('I dont Know What Heppened LOL');
});

app.listen(3000);
