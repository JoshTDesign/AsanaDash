const express = require('express');
const router = express.Router();
const { getWorkspaces, getProjects, getCompletedTasks, getProject, getCompletedTasksForProject } = require('../utils/asanaClient');
const { calculateAverageLeadTime, calculateHistoricalLeadTime } = require('../utils/calculations');

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
      getCompletedTasks(workspaceGid, 120) // Fetch tasks from the last 120 days
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
        task.projects.forEach(project => {
          if (!acc[project.gid]) {
            acc[project.gid] = [];
          }
          acc[project.gid].push(task);
        });
      }
      return acc;
    }, {});

    const projectMetrics = projects.map((project) => {
      const tasks = tasksByProject[project.gid] || [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentTasks = tasks.filter(task => new Date(task.completed_at) >= thirtyDaysAgo);

      const avgLeadTime = calculateAverageLeadTime(recentTasks);
      const historicalData = calculateHistoricalLeadTime(tasks);
      return {
        ...project,
        avgLeadTime,
        historicalData,
      };
    });

    res.render('dashboard', { projects: projectMetrics });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send('An error occurred while fetching dashboard data.');
  }
});

// Route for the project details page
router.get('/project/:projectGid', async (req, res) => {
    try {
        const { projectGid } = req.params;
        const workspaces = await getWorkspaces();
        if (!workspaces.length) {
            return res.status(500).send('No workspaces found.');
        }
        const workspaceGid = workspaces[0].gid;

        const [project, tasks] = await Promise.all([
            getProject(projectGid),
            getCompletedTasksForProject(workspaceGid, projectGid, 30)
        ]);

        const tasksWithLeadTime = tasks.map(task => {
            const leadTime = calculateAverageLeadTime([task]); // calculateAverageLeadTime works for a single task too
            return { ...task, leadTime: leadTime.toFixed(2) };
        });

        res.render('project-details', { project, tasks: tasksWithLeadTime });
    } catch (error) {
        console.error('Error fetching project details:', error);
        res.status(500).send('An error occurred while fetching project details.');
    }
});

module.exports = router;
