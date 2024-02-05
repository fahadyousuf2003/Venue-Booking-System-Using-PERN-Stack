const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const bcryptSalt = async () => {
  return await bcrypt.genSalt(10);
};

const jwtSecret = process.env.JWT_SECRET || 'defaultSecret';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173',
}));

app.get('/test', (req, res) => {
  res.json('test ok');
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const salt = await bcryptSalt();
    const hashedPassword = bcrypt.hashSync(password, salt);
    console.log('Received data:', { name, email, password: hashedPassword });
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );
    console.log('Inserted data:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting into the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Received data:', { email, password });
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const storedPassword = result.rows[0].password;
    const userId = result.rows[0].id;
    const passwordMatch = bcrypt.compareSync(password, storedPassword);
    if (passwordMatch) {
      jwt.sign({ email, userId }, jwtSecret, { expiresIn: '1d' }, (err, token) => {
        if (err) throw err;
        res.cookie('token', token, { httpOnly: true }).json({
          name: result.rows[0].name,
          email: result.rows[0].email,
          userId: result.rows[0].id
        });
      });
    } else {
      res.status(401).json({ error: 'Incorrect password' });
    }
  } catch (error) {
    console.error('Error querying the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/profile', async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) {
        console.error('Error verifying token:', err);
        return res.status(401).json({ error: 'Unauthorized' });
      }
      try {
        const result = await pool.query(
          'SELECT name, email, userid as _id FROM users WHERE userid = $1',
          [userData.id]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        const { name, email, _id } = result.rows[0];
        res.json({ name, email, _id });
      } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    res.json(null);
  }
});


app.post('/logout', (req,res) => {
  res.cookie('token','').json(true);
})


app.post('/upload-by-link', async (req,res) => {
  const {link} = req.body;
  const newName = 'photo' + Date.now() + '.jpg';
  await imageDownloader.image({
    url: link,
    dest: __dirname + '/uploads/' +newName,
  });
  res.json(newName);
})

const photosMiddleware = multer({dest:'uploads/'})
app.post('/upload', photosMiddleware.array('photos', 100), (req,res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace('uploads\\', ''));
  }
  res.json(uploadedFiles);
})

app.post('/places', async (req, res) => {
  try {
    const { title, address, photos, description, perks, extrainfo, checkin, checkout, maxguests, price } = req.body;
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }
    let user;
    try {
      user = await jwt.verify(token, jwtSecret);
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(403).json({ error: 'Failed to authenticate token.' });
    }
    const userEmail = user.email;
    const userResult = await pool.query(
      'SELECT userid FROM users WHERE email = $1',
      [userEmail]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const ownerid = userResult.rows[0].userid;
    const placesResult = await pool.query(
      'INSERT INTO places (ownerid, title, address, photos, description, perks, extrainfo, checkin, checkout, maxguests, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [ownerid, title, address, JSON.stringify(photos), description, JSON.stringify(perks), extrainfo, checkin, checkout, maxguests, price]
    );
    res.json(placesResult.rows[0]);
  } catch (error) {
    console.error('Error inserting into the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/user-places', async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }
  try {
    const userData = jwt.verify(token, jwtSecret);
    const { email } = userData;
    if (!email) {
      console.error('Email not found in decoded token. Decoded user data:', userData);
      return res.status(401).json({ error: 'Unauthorized. Email not found.' });
    }
    console.log('Decoded user data:', userData);
    const userResult = await pool.query(
      'SELECT userid FROM users WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      console.error('User not found in the database for email:', email);
      return res.status(404).json({ error: 'User not found.' });
    }
    const ownerid = userResult.rows[0].userid;
    const placesResult = await pool.query(
      'SELECT places.*, users.name as ownername FROM places ' +
        'JOIN users ON places.ownerid = users.userid ' +
        'WHERE ownerid = $1',
      [ownerid]
    );
    console.log('Fetched places data:', placesResult.rows);
    res.json(placesResult.rows);
  } catch (error) {
    console.error('Error verifying token or fetching user places:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/places', async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }
    const { placeid, title, address, photos, description, perks, extrainfo, checkin, checkout, maxguests, price } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
      }
      try {
        const updatePlaceQuery = `
          UPDATE places
          SET
            title = $1,
            address = $2,
            photos = $3,
            description = $4,
            perks = $5,
            extrainfo = $6,
            checkin = $7,
            checkout = $8,
            maxguests = $9,
            price = $10
          WHERE
            placeid = $11
        `;
        await pool.query(updatePlaceQuery, [
          title, address, JSON.stringify(photos), description, JSON.stringify(perks),
          extrainfo, checkin, checkout, maxguests, price, placeid
        ]);
        res.json('ok');
      } catch (error) {
        console.error('Error updating place:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/places/:placeid', async (req, res) => {
  const { placeid } = req.params;
  try {
    const placesResult = await pool.query(
      'SELECT places.*, users.name as ownername FROM places ' +
        'JOIN users ON places.ownerid = users.userid ' +
        'WHERE placeid = $1',
      [placeid]
    );
    if (placesResult.rows.length === 0) {
      console.error('Place not found in the database for id:', placeid);
      return res.status(404).json({ error: 'Place not found.' });
    }
    console.log('Fetched place data:', placesResult.rows[0]);
    res.json(placesResult.rows[0]);
  } catch (error) {
    console.error('Error fetching place:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/places', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT places.*, users.name as ownername FROM places ' +
        'JOIN users ON places.ownerid = users.userid'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching places from PostgreSQL:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/bookings', async (req, res) => {
  try {
    const { place, checkin, checkout, numberofguests, name, phone, price } = req.body;
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    let userData;

    try {
      userData = jwt.verify(token, jwtSecret);
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(403).json({ error: 'Failed to authenticate token.' });
    }

    const { email } = userData;

    if (!email) {
      return res.status(401).json({ error: 'Unauthorized. No email found in the token.' });
    }

    const userResult = await pool.query('SELECT userid FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in the database for the given email.' });
    }

    const userid = userResult.rows[0].userid;

    if (!place) {
      return res.status(400).json({ error: 'placeid is required.' });
    }

    const result = await pool.query(
      'INSERT INTO bookings (placeid, userid, checkin, checkout, numberofguests, name, phone, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [place, userid, checkin, checkout, numberofguests, name, phone, price]
    );

    const newBooking = result.rows[0];
    res.json(newBooking);
  } catch (error) {
    console.error('Error inserting into the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/bookings', async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    try {
      const userData = jwt.verify(token, jwtSecret);
      const userEmail = userData.email;
      const userResult = await pool.query('SELECT userid FROM users WHERE email = $1', [userEmail]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found in the database for the given email.' });
      }

      const userId = userResult.rows[0].userid;

      const result = await pool.query(
        'SELECT ' +
          'bookings.checkin, bookings.checkout, bookings.price, bookings.bookingid, ' +
          'places.title, places.address, places.photos ' +
          'FROM bookings ' +
          'JOIN places ON bookings.placeid = places.placeid ' +
          'WHERE userid = $1',
        [userId]
      );

      console.log('Result:', result.rows);

      res.json(result.rows);
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(403).json({ error: 'Failed to authenticate token.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/payment', async (req, res) => {
  try {
    const { name, cardnumber, expiry, cvc, amountlimit } = req.body;
    console.log('Received data:', { name, cardnumber, expiry, cvc, amountlimit });

    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    let userData;
    try {
      userData = jwt.verify(token, jwtSecret);
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(403).json({ error: 'Failed to authenticate token.' });
    }

    const { email } = userData;
    if (!email) {
      return res.status(401).json({ error: 'Unauthorized. No email found in the token.' });
    }

    const userResult = await pool.query('SELECT userid FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in the database for the given email.' });
    }

    const userid = userResult.rows[0].userid;


    const existingPayment = await pool.query(
      'SELECT * FROM payments WHERE userid = $1 AND name = $2 AND cardnumber = $3 AND expiry = $4 AND cvc = $5 AND amountlimit = $6',
      [userid, name, cardnumber, expiry, cvc, amountlimit]
    );

    if (existingPayment.rows.length > 0) {
      console.log('Payment already exists:', existingPayment.rows[0]);
      return res.json({ message: 'Payment successful. Duplicate entry detected.' });
    }

    const result = await pool.query(
      'INSERT INTO payments (userid, name, cardnumber, expiry, cvc, amountlimit) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userid, name, cardnumber, expiry, cvc, amountlimit]
    );

    console.log('Inserted data:', result.rows[0]);
    
    res.json({ message: 'Payment successful. New entry created.' });
  } catch (error) {
    console.error('Error inserting into the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/user-id/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query('SELECT userid FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found for the given email.' });
    } else {
      const userId = result.rows[0].userid;
      res.json({ userid: userId });
    }
  } catch (error) {
    console.error('Error fetching userid:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});

