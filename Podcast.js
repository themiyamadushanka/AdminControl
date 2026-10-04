const express = require("express");
const router = express.Router();
const conn = require('./database');
const {setData,getData,delData} = require('./cache');





router.post('/addpodcast', (req, res) => {
    const { videourl, description, category } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const sql = 'INSERT INTO podcast (videourl,description,category,date) VALUES (?,?,?,?)';
    conn.query(sql, [videourl, description, category, date], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ messege: 'error' });
        }
        else {
            delData("podcast");
            res.redirect('/showpodcast');
        }
    });
})

router.post('/deletepodcast', (req, res) => {
    const { videourl } = req.body;
    const sql = "DELETE FROM podcast WHERE videourl=?";

    conn.query(sql, [videourl], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ messege: 'failed' });
        }
        delData("podcast");
        res.redirect('/showpodcast');
    });
});
router.get('/fetchpodcastall',(req,res)=>{
    const cachedData = getData("podcast");
    if (cachedData) {
        return res.json({ result: cachedData });
    }
    
    const sql = "SELECT * FROM podcast ORDER BY date DESC";
    conn.query(sql, (err, result) => {
        if (err) {
            res.status(500).send({ messege: "error" });
        }
        setData("podcast",result);
        res.json({ result: result });
    })
});

router.get('/showpodcast', (req, res) => {
    const sql = "SELECT * FROM podcast ORDER BY date DESC";
    conn.query(sql, (err, result) => {
        if (err) {
            res.status(500).send({ messege: "error" });
        }
        setData("podcast",result);
        res.render('podcast', { podcasts: result });
    })
})

module.exports = router