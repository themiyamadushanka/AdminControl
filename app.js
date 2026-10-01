const express = require('express');
const app = express();
const podcast = require('./Podcast');
const cors = require('cors');
const fileHndle = require('./imagehandle.js');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors(/*{
    origin: 'https://omixelo.com',
    credentials: true
}*/));
const port = 5300;
const conn = require('./database.js');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('', podcast);
app.get('/', (req, res) => {
   res.redirect('/dashboard');
});


app.get('/login', (req, res) => {
  res.render('login');
});

/*
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@example.com' && password === 'password') {
        res.json({ redirect: '/dashboard' });
    } else {
        res.status(401).json({ message: 'Invalid email or password.' });
    }
});*/

app.get('/dashboard', (req, res) => {
    const sql = "SELECT * FROM adds ORDER BY my_row_id DESC";
    conn.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching ads:', err);
            return res.status(500).send('Database error: ' + err.message);
        }
        res.render('dashboard', { results });
    });
});

app.get('/api/data',(req,res)=>{
  sql = "SELECT * FROM adds";
  conn.query(sql,(err,result)=>{
    if (err){
      console.log(err);
      res.status(500).send("error");
    }
    else{
      res.status(200).send(result);
    };
  })
});

app.post('/adds', upload.single('image'), async (req, res) => {
    try {
        const { description } = req.body;
        if (!req.file) {
            return res.status(400).send('Image file is required.');
        }

        const imageURL = await fileHndle(req.file.buffer);

        const time = new Date().toTimeString().slice(0, 8);
        const sql = "INSERT INTO adds (imageURL, description, time) VALUES (?, ?, ?)";
        conn.query(sql, [imageURL, description, time], (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Failed to add ad.');
            }
            res.redirect('/dashboard');
        });
    } catch (error) {
        console.error('Error adding ad:', error.message);
        res.status(500).send('Failed to upload image and create ad.');
    }
});

app.post('/adds/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM adds WHERE my_row_id = ?";
    conn.query(sql, [id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Failed to delete ad.');
        }
        res.redirect('/dashboard');
    });
});


app.listen(port, () => {
  console.log(`Server is running on${port}`);
});
