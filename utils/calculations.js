function calculateAverageLeadTime(tasks) {
  if (!tasks || tasks.length === 0) {
    return 0;
  }

  const totalMilliseconds = tasks.reduce((acc, task) => {
    const createdAt = new Date(task.created_at);
    const completedAt = new Date(task.completed_at);
    return acc + (completedAt - createdAt);
  }, 0);

  const averageMilliseconds = totalMilliseconds / tasks.length;
  const averageDays = averageMilliseconds / (1000 * 60 * 60 * 24);

  return averageDays;
}

module.exports = {
  calculateAverageLeadTime,
};
