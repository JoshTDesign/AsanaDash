require('dotenv').config();
const Asana = require('asana');

// Configure client with personal access token
const client = Asana.ApiClient.instance;
const token = client.authentications['token'];
token.accessToken = process.env.ASANA_API_KEY;

// Initialize API clients for various resources
const workspacesApiInstance = new Asana.WorkspacesApi();
const projectsApiInstance = new Asana.ProjectsApi();
const tasksApiInstance = new Asana.TasksApi();

const getWorkspaces = async () => {
    try {
        const result = await workspacesApiInstance.getWorkspaces({});
        return result.data;
    } catch (error) {
        console.error('Error fetching workspaces:', error.response ? error.response.body : error);
        throw error;
    }
};

const getProjects = async (workspaceGid) => {
    try {
        const result = await projectsApiInstance.getProjects({
            workspace: workspaceGid,
            opt_fields: 'gid,name'
        });
        return result.data;
    } catch (error) {
        console.error('Error fetching projects:', error.response ? error.response.body : error);
        throw error;
    }
};

const getProject = async (projectGid) => {
    try {
        const result = await projectsApiInstance.getProject(projectGid, {
            opt_fields: 'gid,name'
        });
        return result.data;
    } catch (error) {
        console.error('Error fetching project:', error.response ? error.response.body : error);
        throw error;
    }
};

const getCompletedTasksForProject = async (workspaceGid, projectGid, days) => {
    const completedSince = new Date();
    completedSince.setDate(completedSince.getDate() - days);

    try {
        let allTasks = [];
        let offset = null;
        const limit = 100; // Max limit per page

        do {
            const params = {
                project: projectGid,
                completed: true,
                completed_since: completedSince.toISOString(),
                limit: limit,
                opt_fields: 'gid,name,created_at,completed_at,parent'
            };

            if (offset) {
                params.offset = offset;
            }

            const result = await tasksApiInstance.getTasksForProject(projectGid, params);

            const nonSubtasks = result.data.filter(task => task.parent === null);
            allTasks = allTasks.concat(nonSubtasks);

            offset = result.next_page ? result.next_page.offset : null;

        } while (offset);

        return allTasks;
    } catch (error) {
        console.error('Error fetching completed tasks:', error.response ? error.response.body : error);
        throw error;
    }
};

const getOpenTasksForProject = async (workspaceGid, projectGid) => {
    try {
        let allTasks = [];
        let offset = null;
        const limit = 100; // Max limit per page

        do {
            const params = {
                project: projectGid,
                completed: false,
                limit: limit,
                opt_fields: 'gid,name,created_at,tags.name,parent'
            };

            if (offset) {
                params.offset = offset;
            }

            const result = await tasksApiInstance.getTasksForProject(projectGid, params);

            const nonSubtasks = result.data.filter(task => {
                const isNotSubtask = task.parent === null;
                const notOnHold = !task.tags.some(tag => tag.name === 'On Hold');
                return isNotSubtask && notOnHold;
            });

            allTasks = allTasks.concat(nonSubtasks);
            offset = result.next_page ? result.next_page.offset : null;
        } while (offset);

        // Sort tasks by creation date, oldest first
        allTasks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        return allTasks;
    } catch (error) {
        console.error('Error fetching open tasks:', error.response ? error.response.body : error);
        throw error;
    }
};

module.exports = {
    getWorkspaces,
    getProjects,
    getProject,
    getCompletedTasksForProject,
    getOpenTasksForProject
};
