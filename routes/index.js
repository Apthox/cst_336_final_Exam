var express = require('express');
var router = express.Router();
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcrypt');


router.get('/', function (req, res, next) {
  res.render('home', {
    title: 'Login',
    css: ['style.css', 'login.css'],
    js: ['login.js']
  });
});

router.post("/", function (req, res) {

  const connection = mysql.createConnection({
    host: 'jlg7sfncbhyvga14.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'zgts0wdtof0jcu2t',
    password: 'fgtzk1phlxphl8jl',
    database: 'zvhd8l275cpsbik1'
  });

  connection.connect();

  let query = `SELECT u.hash FROM User u WHERE u.email='${req.body.email}'`;

  connection.query(query, (error, results, fields) => {
    if (error) throw error;

    if (results.length == 0) {
      res.json({
        successful: false,
        message: "email not in use!"
      });
      return;
    }

    let actual_pswd = results[0].hash;
    let typed_pswd = req.body.password;

    bcrypt.compare(typed_pswd, actual_pswd, function (error, result) {
      if (error) throw error;

      if (result) {
        req.session.email = req.body.email;
        res.json({
          successful: true,
          message: "ok"
        });
      } else {
        delete req.session.username;
        res.json({
          successful: false,
          message: "incorrect password"
        });
      }
    });
  });

  connection.end();
});

router.get('/register', function (req, res, next) {
  res.render('register', {
    title: 'Register',
    css: ['style.css', 'login.css'],
    js: ['register.js']
  });
});

router.post('/register', function (req, res) {

  console.log("Register POST Triggered!");

  console.log(req.body);

  const connection = mysql.createConnection({
    host: 'jlg7sfncbhyvga14.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'zgts0wdtof0jcu2t',
    password: 'fgtzk1phlxphl8jl',
    database: 'zvhd8l275cpsbik1'
  });

  connection.connect();

  let query = `SELECT * FROM User u WHERE u.email="${req.body.email}";`

  connection.query(query, (error, results, fields) => {
    if (error) throw error;

    if (results.length != 0) {
      res.json({
        successful: false,
        message: "Email in use!"
      });

      connection.end();
      return;
    }

    bcrypt.hash(req.body.password, 8, function (err, hash) {
      if (err) throw err;

      query = "INSERT INTO User(email, hash) VALUES (?, ?)"

      connection.query(query, [req.body.email, hash], (error, results, fields) => {
        if (error) throw error;

        res.json({
          successful: true,
          message: "account created"
        });

        generate_invite_code(req.body.email);

        connection.end();
        return;
      });

    });

  });

});

function generate_invite_code(email) {
  const chars = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwy"];
  let uuid = [...Array(5)].map(i => chars[Math.random() * chars.length | 0]).join``;

  const connection = mysql.createConnection({
    host: 'jlg7sfncbhyvga14.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'zgts0wdtof0jcu2t',
    password: 'fgtzk1phlxphl8jl',
    database: 'zvhd8l275cpsbik1'
  });

  connection.connect();

  let query = `SELECT * FROM Invite WHERE invite="${uuid}"`

  connection.query(query, (error, results, fields) => {
    if (error) throw error;

    if (results.length > 0) {
      generate_invite_code(email);
      connection.end();
      return;
    }

    query = `INSERT INTO Invite(email, invite) VALUES (?, ?)`

    connection.query(query, [email, uuid], (error, results, fields) => {
      if (error) throw error;

      connection.end();
      return;
    });
  });

}

router.get("/dashboard", function (req, res, next) {

  email = req.session.email;

  console.log("User: " + email);

  if (email == undefined) {
    console.log("Req for dashboard GET rejected!");
    res.redirect('/');
    return;
  }

  const connection = mysql.createConnection({
    host: 'jlg7sfncbhyvga14.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'zgts0wdtof0jcu2t',
    password: 'fgtzk1phlxphl8jl',
    database: 'zvhd8l275cpsbik1'
  });

  connection.connect();

  let query = `SELECT invite FROM Invite WHERE email="${email}"`

  connection.query(query, (error, results, fields) => {
    if (error) throw error;

    let invite = results[0].invite;

    res.render('dashboard', {
      title: 'Dashboard',
      css: ['style.css', 'dashboard.css'],
      js: ['dashboard.js'],
      "invite": invite
    });

    connection.end();

  });

});

router.post("/logout", function (req, res, next) {
  delete req.session.email;

  res.json({
    successful: true,
    message: "logged out"
  });

  return;
});

router.post("/slots", function (req, res) {

  email = req.session.email;

  console.log("User: " + email);

  if (email == undefined) {
    return;
  }

  console.log(req.body);

  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }

  let date = new Date(req.body.start);
  let duration = req.body.duration;
  let quantity = req.body.quantity;

  const connection = mysql.createConnection({
    host: 'jlg7sfncbhyvga14.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'zgts0wdtof0jcu2t',
    password: 'fgtzk1phlxphl8jl',
    database: 'zvhd8l275cpsbik1'
  });

  connection.connect();

  let query = "INSERT INTO Slot(creator, start, duration, booked, bookee_email) VALUES (?, ?, ?, ?, ?);"

  let c = 0;
  for (let i = 0; i < quantity; i++) {
    let e_d = date.addDays(i)
    connection.query(query, [email, e_d, duration, false, ""], (error, results, fields) => {
      if (error) throw error;

      c += 1;

      if (c >= quantity) {
        connection.end();
        res.json({
          successful: true,
          message: "slots added"
        });

        return;
      }

    });
  }
});

router.post("/get_slots", function (req, res) {

  email = req.session.email;

  console.log("User: " + email);

  if (email == undefined) {
    return;
  }

  const connection = mysql.createConnection({
    host: 'jlg7sfncbhyvga14.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'zgts0wdtof0jcu2t',
    password: 'fgtzk1phlxphl8jl',
    database: 'zvhd8l275cpsbik1'
  });

  connection.connect();

  let query = `SELECT * FROM Slot WHERE creator="${email}"`

  connection.query(query, (error, results, fields) => {
    if (error) throw error;

    res.json({
      successful: true,
      message: "success",
      data: results
    });

    connection.end();

    console.log(results);
  });

})

router.post("/delete_slot", function (req, res) {
  email = req.session.email;

  console.log("User: " + email);

  if (email == undefined) {
    return;
  }

  const connection = mysql.createConnection({
    host: 'jlg7sfncbhyvga14.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'zgts0wdtof0jcu2t',
    password: 'fgtzk1phlxphl8jl',
    database: 'zvhd8l275cpsbik1'
  });

  connection.connect();

  let query = `DELETE FROM Slot WHERE id="${req.body.slot_id}"`

  connection.query(query, (error, results, fields) => {
    if (error) throw error;

    res.json({
      successful: true,
      message: "success"
    });

    connection.end();

  });

});

router.get("/rubric", function (req, res) {
  res.render('rubric', {
    title: 'rubric',
    css: ['style.css', "rubric.css"],
    js: []
  });
});


module.exports = router;
