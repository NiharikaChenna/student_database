const route = require('express').Router()
const mysql = require('mysql');

const nameRegex = /^[a-zA-Z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

const pool = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'niha'
  });
  pool.connect((err)=>{
    if(err) throw err;
    console.log("connected db");
  })

route.get('/students', (req, res) => {
    pool.query('SELECT * FROM students', (error, results) => {
      if (error) {
        console.error('Error retrieving students:', error);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(results);
      }
    });
  });

  route.get('/students/:id', (req, res) => {
    const studentId = req.params.id;
  
    pool.query('SELECT * FROM students WHERE id = ?', [studentId], (error, results) => {
      if (error) {
        console.error('Error retrieving student:', error);
        res.status(500).send('Internal Server Error');
      } else {
        if (results.length === 0) {
          res.status(404).json({ error: 'Student not found' });
        } else {
          res.json(results);
        }
      }
    });
  });
  
  
  route.post('/students', (req, res) => {
    const { name, email, phoneNo, address } = req.body;
  
    if (!nameRegex.test(name)) {
      res.status(400).json({ error: 'Invalid name format' });
      return;
    }
  
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }
  
    if (!phoneRegex.test(phoneNo)) {
      res.status(400).json({ error: 'Invalid phone number format' });
      return;
    }

    pool.query('SELECT * FROM students WHERE email = ?', [email], (error, emailResults) => {
      if (error) {
        console.log('Error checking email:', error);
        res.status(500).send('Internal Server Error');
      } else if (emailResults.length > 0) {
        res.status(409).json({ error: 'Email already exists' });
        return;
      } else {
        pool.query('SELECT * FROM students WHERE phoneNo = ?', [phoneNo], (error, phoneResults) => {
          if (error) {
            console.log('Error checking phone number:', error);
            res.status(500).send('Internal Server Error');
          } else if (phoneResults.length > 0) {
            res.status(409).json({ error: 'Phone number already exists' });
            return;
          } else {
            pool.query(
              'INSERT INTO students (name, email, phoneNo, address) VALUES (?, ?, ?, ?)',
              [name, email, phoneNo, address],
              (error, insertResults) => {
                if (error) {
                  console.log('Error creating student:', error);
                  res.status(500).send('Internal Server Error');
                } else {
                  res.json(insertResults);
                }
              }
            );
          }
        });
      }
    });
    
  });
  
  
  route.put('/students/:id', (req, res) => {
    const { id } = req.params;
    const newData = req.body;
  
    if (newData.name && !nameRegex.test(newData.name)) {
      res.status(400).json({ error: 'Invalid name format' });
      return;
    }
  
    if (newData.email && !emailRegex.test(newData.email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }
  
    if (newData.phoneNo && !phoneRegex.test(newData.phoneNo)) {
      res.status(400).json({ error: 'Invalid phone number format' });
      return;
    }
  
    if (newData.email) {
      pool.query(
        'SELECT * FROM students WHERE email = ? AND id != ?',
        [newData.email, id],
        (error, emailResults) => {
          if (error) {
            console.log('Error checking email:', error);
            res.status(500).send('Internal Server Error');
          } else if (emailResults.length > 0) {
            res.status(409).json({ error: 'Email already exists' });
            return;
          } else {
            if (newData.phoneNo) {
              pool.query(
                'SELECT * FROM students WHERE phoneNo = ? AND id != ?',
                [newData.phoneNo, id],
                (error, phoneResults) => {
                  if (error) {
                    console.log('Error checking phone number:', error);
                    res.status(500).send('Internal Server Error');
                  } else if (phoneResults.length > 0) {
                    res.status(409).json({ error: 'Phone number already exists' });
                    return;
                  } else {
                    pool.query(
                      'UPDATE students SET ? WHERE id = ?',
                      [newData, id],
                      (error, updateResults) => {
                        if (error) {
                          console.log('Error updating student:', error);
                          res.status(500).send('Internal Server Error');
                        } else {
                          res.json(updateResults);
                        }
                      }
                    );
                  }
                }
              );
            } else {
              pool.query(
                'UPDATE students SET ? WHERE id = ?',
                [newData, id],
                (error, updateResults) => {
                  if (error) {
                    console.log('Error updating student:', error);
                    res.status(500).send('Internal Server Error');
                  } else {
                    res.json(updateResults);
                  }
                }
              );
            }
          }
        }
      );
    }
  });
  

  route.delete('/students/:id', (req, res) => {
    let student_id = req.params.id;
    pool.query("DELETE from students where id = "+student_id,(error,results) => {
      if (error) {
        console.log('Error deleting student:', error);
        res.status(500).send('Internal Server Error');
      } else if (results.affectedRows === 0) {
        res.status(404).send('Student not found');
      } else {
        res.send({ message: 'Student deleted successfully' });
      }
    });
  });
  
  module.exports = route;