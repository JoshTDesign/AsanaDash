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

function calculateHistoricalLeadTime(tasks) {
  const weeklyAverages = [];
  const today = new Date();

  // Calculate the 30-day average for the last 12 weeks (approx. 90 days)
  for (let i = 0; i < 12; i++) {
    const windowEnd = new Date(today);
    windowEnd.setDate(today.getDate() - (i * 7));
    const windowStart = new Date(windowEnd);
    windowStart.setDate(windowEnd.getDate() - 30);

    const tasksInWindow = tasks.filter(task => {
      const completedAt = new Date(task.completed_at);
      return completedAt >= windowStart && completedAt <= windowEnd;
    });

    const averageLeadTime = calculateAverageLeadTime(tasksInWindow);
    weeklyAverages.push(averageLeadTime);
  }

  return weeklyAverages.reverse(); // Reverse to have the oldest data first
}

module.exports = {
  calculateAverageLeadTime,
  calculateHistoricalLeadTime,
};
