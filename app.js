require('dotenv').config();
console.log('Loaded Project ID:', process.env.PROJECT_ID); // Add this line to verify

const express = require('express');
const app = express();
const path = require('path');
const { getTasks } = require('./utils/asanaClient'); // Utility for Asana API calls

// Set up view engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Route for the homepage, fetching tasks to display on the index page
app.get('/', async (req, res) => {
  try {
    const tasks = await getTasks(); // Fetch tasks from Asana
    res.render('index', { tasks });
  } catch (error) {
    console.error('Error fetching tasks from Asana:', error);
    res.status(500).send('An error occurred while fetching tasks.');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});