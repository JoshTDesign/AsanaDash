require('dotenv').config();
const axios = require('axios');

async function getTasks() {
  console.log('Project ID in asanaClient:', process.env.PROJECT_ID);

  try {
    const response = await axios.get('https://app.asana.com/api/1.0/tasks', {
      headers: { Authorization: `Bearer ${process.env.ASANA_API_KEY}` },
      params: { 
        project: process.env.PROJECT_ID,
        opt_fields: 'name,due_on,memberships.project.gid,memberships.section.name,memberships.section.gid,gid' // Include project and section details
      }
    });
    
    // Filter out tasks that have a "Done" membership or belong to "Complete" or "COMPLETED TASKS" sections
    const targetProjectGid = '1207231923001575';
    let tasks = response.data.data.filter(task => {
      // Filter memberships based on the target project gid
      task.memberships = task.memberships?.filter(membership => 
        membership.project?.gid === targetProjectGid
      ) || [];

      // Exclude tasks if any membership section name is "Done" or in "Complete" or "COMPLETED TASKS"
      const hasDoneMembership = task.memberships.some(membership => 
        ['done', 'complete', 'completed tasks'].includes(membership.section?.name.toLowerCase())
      );

      // Only include tasks that don't have a "Done", "Complete", or "COMPLETED TASKS" membership
      return !hasDoneMembership;
    });

    // Categorize tasks
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // End of the current week

    const categorizedTasks = {
      overdue: [],
      thisWeek: [],
      upcoming: [],
      noDueDate: []
    };

    tasks.forEach(task => {
      const dueDate = task.due_on ? new Date(task.due_on) : null;

      if (!dueDate) {
        categorizedTasks.noDueDate.push(task); // No due date
      } else if (dueDate < today) {
        categorizedTasks.overdue.push(task); // Overdue
      } else if (dueDate <= endOfWeek) {
        categorizedTasks.thisWeek.push(task); // Due this week
      } else {
        categorizedTasks.upcoming.push(task); // Due later
      }
    });

    return categorizedTasks;
  } catch (error) {
    console.error('Error fetching tasks from Asana:', error);
    throw error;
  }
}

module.exports = { getTasks };