const express = require('express');
const router = express.Router();
const { getTasks } = require('../utils/asanaClient');

// Route to get tasks and render them
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await getTasks();
    res.render('tasks', { tasks });
  } catch (error) {
    res.status(500).send('Error fetching tasks');
  }
});

module.exports = router;