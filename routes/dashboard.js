const express = require('express');
const router = express.Router();
const { getWorkspaces, getProjects, getCompletedTasks } = require('../utils/asanaClient');
const { calculateAverageLeadTime } = require('../utils/calculations');

// Route for the productivity dashboard
router.get('/', async (req, res) => {
  try {
    const workspaces = await getWorkspaces();
    if (!workspaces.length) {
      return res.render('dashboard', { projects: [] });
    }
    const workspaceGid = workspaces[0].gid;
    const [allProjects, completedTasks] = await Promise.all([
      getProjects(workspaceGid),
      getCompletedTasks(workspaceGid)
    ]);

    const allowedProjectNames = [
      "Onboard Mini Brief",
      "Josh's Workspace",
      "Entertainment",
      "Revenue",
      "Food & Beverage"
    ];

    const projects = allProjects.filter(project => allowedProjectNames.includes(project.name));

    const tasksByProject = completedTasks.reduce((acc, task) => {
      if (task.projects && task.projects.length > 0) {
        const projectId = task.projects[0].gid;
        if (!acc[projectId]) {
          acc[projectId] = [];
        }
        acc[projectId].push(task);
      }
      return acc;
    }, {});

    const projectMetrics = projects.map((project) => {
      const tasks = tasksByProject[project.gid] || [];
      const avgLeadTime = calculateAverageLeadTime(tasks);
      return {
        ...project,
        avgLeadTime,
      };
    });

    res.render('dashboard', { projects: projectMetrics });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send('An error occurred while fetching dashboard data.');
  }
});

module.exports = router;
