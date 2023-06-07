const express = require('express');
const route = require('./routes/students')

const app = express();
app.use(express.json());
app.use(route);
  
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
  