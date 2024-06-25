const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { User, Place } = require('./models');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 첫 번째 페이지 (로그인/회원가입)
app.get('/', (req, res) => {
    res.render('index', { message: '' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username, password } });
    if (user) {
        req.session.userId = user.id;
        res.redirect('/map');
    } else {
        res.render('index', { message: 'Invalid username or password' });
    }
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.create({ username, password });
    req.session.userId = user.id;
    res.redirect('/map');
});

app.get('/map', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'map_page.html'));
});

app.use(express.static(path.join(__dirname, 'public'), { 
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

