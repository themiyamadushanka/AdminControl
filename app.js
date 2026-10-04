const express = require('express');
const app = express();
const podcast = require('./Podcast');
const cors = require('cors');
const fileHndle = require('./imagehandle.js');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {setData,getData,delData} = require('./cache');
app.use(cors({
    origin: ['https://omixelo.com', 'http://localhost:5300', 'http://127.0.0.1:5300'],
    credentials: true
}));
const port = process.env.PORT || 5300;
const conn = require('./database.js');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('', podcast);
app.get('/', (req, res) => {
   res.redirect('/dashboard');
});


/*app.get('/login', (req, res) => {
  res.render('login');
});*/

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
        setData("adds",results);
        res.render('dashboard', { results });
    });
});

app.get('/api/data',(req,res)=>{
  const cachedData = getData("adds");
    if (cachedData) {
        return res.json({ result: cachedData });
    }
  const sql = "SELECT * FROM adds";
  conn.query(sql,(err,result)=>{
    if (err){
      console.log(err);
      res.status(500).send("error");
    }
    else{
      setData("adds",result);
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

        const date = new Date().toISOString().split('T')[0];
        const sql = "INSERT INTO adds (imageURL, description, date) VALUES (?, ?, ?)";
        conn.query(sql, [imageURL, description, date], (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Failed to add ad.');
            }
            delData("adds");
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
        delData("adds");
        res.redirect('/dashboard');
    });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
