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
    { id: 1, title: 'Post One' },
    { id: 2, title: 'Post Two' },
    { id: 3, title: 'Post Three' },
    { id: 4, title: 'Post Four' },
];

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign({ username: user.username, id: user.id }, SECRET_KEY, /*{ expiresIn: '10 minutes'}*/);
    res.json({ accessToken });
});

app.get('/protected', authenticateJWT, (req, res) => {
    res.json( posts.filter(post => post.id ===req.user.id));
});

app.get('/posts', (req, res) => {
    res.json(posts);
});

app.get('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);

});

app.post('/posts', (req, res) => {
    const { id, title } = req.body;
    posts.push({ id, title });
    res.status(201).json({ message: 'Post created', post: { id, title } });
});

app.put('/posts/:id', (req, res) => {
    const { title } = req.body;
    let post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.title = title;
    return res.json({ message: 'Post updated', post });
});

app.delete('/posts/:id', (req, res) => {
    const postIndex = posts.findIndex(p => p.id === parseInt(req.params.id));
    if (postIndex === -1) return res.status(404).json({ message: 'Post not found' });

    posts.splice(postIndex, 1);
    res.json({ message: 'Post deleted' });
});

app.get('/error', (req, res, next) => {
    const err = new Error('Something went wrong!');
    next(err);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(401).send('I dont Know What Heppened LOL');
});

app.listen(3000);
