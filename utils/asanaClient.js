require('dotenv').config();
const axios = require('axios');

async function getWorkspaces() {
  try {
    const response = await axios.get('https://app.asana.com/api/1.0/workspaces', {
      headers: { Authorization: `Bearer ${process.env.ASANA_API_KEY}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching workspaces from Asana:', error);
    throw error;
  }
}

async function getProjects(workspaceGid) {
  try {
    const response = await axios.get('https://app.asana.com/api/1.0/projects', {
      headers: { Authorization: `Bearer ${process.env.ASANA_API_KEY}` },
      params: {
        workspace: workspaceGid,
        opt_fields: 'name'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching projects from Asana:', error);
    throw error;
  }
}

async function getCompletedTasks(workspaceGid) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const response = await axios.get(`https://app.asana.com/api/1.0/workspaces/${workspaceGid}/tasks/search`, {
      headers: { Authorization: `Bearer ${process.env.ASANA_API_KEY}` },
      params: {
        'completed_at.after': thirtyDaysAgo.toISOString(),
        'sort_by': 'completed_at',
        'opt_fields': 'created_at,completed_at,name,projects'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching completed tasks for workspace ${workspaceGid}:`, error);
    throw error;
  }
}

module.exports = { getWorkspaces, getProjects, getCompletedTasks };
