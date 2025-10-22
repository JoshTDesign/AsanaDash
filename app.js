require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const dashboardRoutes = require('./routes/dashboard');

// Set up view engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Redirect root to dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Use the dashboard route
app.use('/dashboard', dashboardRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});