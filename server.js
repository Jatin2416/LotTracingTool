const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 5500;



console.log("reached save lot")

//Configure MySQL connection


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'world'
});

db.connect(err => {
  if (err) {
      console.error('Error connecting to the database:', err);
  } else {
      console.log('Connected to the database');
  }
});



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});
app.get('/sitemap.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'sitemap.jpg'));
});


app.post('/save', (req, res) => {
  const { label, datetime, polygon  } = req.body;
  console.log('label:', label);
  console.log('date:', datetime);
  console.log('polygon11:', polygon);

  const sql = 'INSERT INTO lots (Label, Timestamp, Points) VALUES (?, ?, ?)';
  
  db.query(sql, [label, datetime, JSON.stringify(polygon)], (err, result) => {
      if (err) {
          console.error('Error saving data:', err);
          res.status(500).json({ message: 'Error saving data.' });
      } else {
          console.log('Data saved to the database:', result);
          res.json({ message: 'data saved successfully.' });
      }
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

