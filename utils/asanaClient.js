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

async function getCompletedTasks(workspaceGid, daysAgo = 30) {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysAgo);

  try {
    const response = await axios.get(`https://app.asana.com/api/1.0/workspaces/${workspaceGid}/tasks/search`, {
      headers: { Authorization: `Bearer ${process.env.ASANA_API_KEY}` },
      params: {
        'completed_at.after': sinceDate.toISOString(),
        'sort_by': 'completed_at',
        'opt_fields': 'created_at,completed_at,name,projects,parent'
      }
    });
    return response.data.data.filter(task => task.parent === null);
  } catch (error) {
    console.error(`Error fetching completed tasks for workspace ${workspaceGid}:`, error);
    throw error;
  }
}

async function getProject(projectGid) {
  try {
    const response = await axios.get(`https://app.asana.com/api/1.0/projects/${projectGid}`, {
      headers: { Authorization: `Bearer ${process.env.ASANA_API_KEY}` },
      params: {
        opt_fields: 'name'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching project ${projectGid}:`, error);
    throw error;
  }
}

async function getCompletedTasksForProject(workspaceGid, projectGid, daysAgo = 30) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysAgo);

    try {
        const response = await axios.get(`https://app.asana.com/api/1.0/workspaces/${workspaceGid}/tasks/search`, {
            headers: { Authorization: `Bearer ${process.env.ASANA_API_KEY}` },
            params: {
                'completed_at.after': sinceDate.toISOString(),
                'projects.any': projectGid,
                'sort_by': 'completed_at',
                'opt_fields': 'created_at,completed_at,name,parent'
            }
        });
        return response.data.data.filter(task => task.parent === null);
    } catch (error) {
        console.error(`Error fetching completed tasks for project ${projectGid}:`, error);
        throw error;
    }
}

module.exports = { getWorkspaces, getProjects, getCompletedTasks, getProject, getCompletedTasksForProject };
