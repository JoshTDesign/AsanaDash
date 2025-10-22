require('dotenv').config();
const asana = require('asana');

const client = asana.Client.create().useAccessToken(process.env.ASANA_API_KEY);

const getWorkspaces = async () => {
    try {
        const workspaces = await client.workspaces.getWorkspaces();
        return workspaces.data;
    } catch (error) {
        console.error('Error fetching workspaces:', error.value ? error.value.errors : error);
        throw error;
    }
};

const getProjects = async (workspaceGid) => {
    try {
        const projects = await client.projects.getProjects({
            workspace: workspaceGid,
            opt_fields: 'gid,name'
        });
        return projects.data;
    } catch (error) {
        console.error('Error fetching projects:', error.value ? error.value.errors : error);
        throw error;
    }
};

const getProject = async (projectGid) => {
    try {
        const project = await client.projects.getProject(projectGid, {
            opt_fields: 'gid,name'
        });
        return project;
    } catch (error) {
        console.error('Error fetching project:', error.value ? error.value.errors : error);
        throw error;
    }
};


const getCompletedTasksForProject = async (workspaceGid, projectGid, days) => {
    const completedSince = new Date();
    completedSince.setDate(completedSince.getDate() - days);

    try {
        let allTasks = [];
        let offset = null;

        do {
            const params = {
                project: projectGid,
                completed_since: completedSince.toISOString(),
                opt_fields: 'gid,name,created_at,completed_at,parent'
            };

            if (offset) {
                params.offset = offset;
            }

            const tasks = await client.tasks.getTasks(params);

            const nonSubtasks = tasks.data.filter(task => task.parent === null);
            allTasks = allTasks.concat(nonSubtasks);

            offset = tasks.next_page ? tasks.next_page.offset : null;

        } while (offset);

        return allTasks;
    } catch (error) {
        console.error('Error fetching completed tasks:', error.value ? error.value.errors : error);
        throw error;
    }
};

const getOpenTasksForProject = async (workspaceGid, projectGid) => {
    try {
        let allTasks = [];
        let offset = null;

        do {
            const params = {
                project: projectGid,
                completed: false,
                opt_fields: 'gid,name,created_at,tags.name,parent'
            };

            if (offset) {
                params.offset = offset;
            }

            const tasks = await client.tasks.getTasks(params);

            const nonSubtasks = tasks.data.filter(task => {
                const isNotSubtask = task.parent === null;
                const notOnHold = !task.tags.some(tag => tag.name === 'On Hold');
                return isNotSubtask && notOnHold;
            });

            allTasks = allTasks.concat(nonSubtasks);
            offset = tasks.next_page ? tasks.next_page.offset : null;
        } while (offset);

        // Sort tasks by creation date, oldest first
        allTasks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        return allTasks;
    } catch (error) {
        console.error('Error fetching open tasks:', error.value ? error.value.errors : error);
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
