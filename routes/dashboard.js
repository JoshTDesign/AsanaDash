const express = require('express');
const router = express.Router();
const { getWorkspaces, getProjects, getProject, getCompletedTasksForProject, getOpenTasksForProject } = require('../utils/asanaClient');
const { calculateAverageLeadTime, calculateHistoricalLeadTime } = require('../utils/calculations');

// Route for the productivity dashboard
router.get('/', async (req, res) => {
  try {
    const workspaces = await getWorkspaces();
    if (!workspaces.length) {
      return res.render('dashboard', { projects: [] });
    }
    const workspaceGid = workspaces[0].gid;
    const allProjects = await getProjects(workspaceGid);

    const allowedProjectNames = [
      "Entertainment",
      "Food & Beverage",
      "MOM Workspace",
      "Onboard Revenue"
    ];

    const filteredProjects = allProjects.filter(project => allowedProjectNames.includes(project.name));

    const projectMetrics = await Promise.all(
      filteredProjects.map(async (project) => {
        const [tasks, openTasks] = await Promise.all([
          getCompletedTasksForProject(workspaceGid, project.gid, 120),
          getOpenTasksForProject(workspaceGid, project.gid)
        ]);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentTasks = tasks.filter(task => new Date(task.completed_at) >= thirtyDaysAgo);

        const avgLeadTime = calculateAverageLeadTime(recentTasks);
        const historicalData = calculateHistoricalLeadTime(tasks);

        const openTasksWithAge = openTasks.map(task => {
          const now = new Date();
          const createdAt = new Date(task.created_at);
          const ageInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
          return { ...task, ageInDays };
        });

        return {
          ...project,
          avgLeadTime,
          historicalData,
          openTasks: openTasksWithAge,
        };
      })
    );

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
