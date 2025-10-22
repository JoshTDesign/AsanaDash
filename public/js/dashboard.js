document.addEventListener('DOMContentLoaded', () => {
  // --- Circular Progress Bars ---
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    const progressCircle = card.querySelector('.progress-circle');
    const leadTime = parseInt(progressCircle.dataset.value, 10);

    // Determine the color based on lead time
    let color;
    if (leadTime < 15) {
      color = '#2ECC71'; // Green
    } else if (leadTime >= 15 && leadTime <= 30) {
      color = '#F1C40F'; // Yellow
    } else {
      color = '#E74C3C'; // Red
    }

    // Calculate the percentage for the conic gradient (max out at 60 days)
    const maxDays = 60;
    const percentage = Math.min((leadTime / maxDays) * 100, 100);

    // Set the CSS variables for the progress circle
    progressCircle.style.setProperty('--progress-value', `${percentage}%`);
    progressCircle.style.setProperty('--progress-color', color);

    const progressValue = card.querySelector('.progress-value');
    if (progressValue) {
        progressValue.style.color = color;
    }

    // --- Sparkline Charts ---
    const sparklineCanvas = card.querySelector('.sparkline-chart');
    const historicalData = JSON.parse(sparklineCanvas.dataset.history);

    // Generate date labels for the last 12 weeks
    const today = new Date();
    const labels = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i * 7);
        labels.push(date);
    }

    const dataWithDates = historicalData.map((value, index) => {
        return { x: labels[index], y: value };
    });

    new Chart(sparklineCanvas, {
      type: 'line',
      data: {
        datasets: [{
          data: dataWithDates,
          borderColor: color,
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0, // Hide points
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'week',
              tooltipFormat: 'MMM d'
            },
            grid: {
                display: false,
                drawBorder: true,
            },
            ticks: {
              display: true,
              autoSkip: false,
              maxRotation: 0,
              callback: function(value, index, ticks) {
                const date = new Date(this.getLabelForValue(value));
                const prevDate = index > 0 ? new Date(this.getLabelForValue(ticks[index - 1].value)) : null;

                if (index === 0 || (prevDate && date.getMonth() !== prevDate.getMonth())) {
                  return date.toLocaleString('default', { month: 'short' });
                }
                return ''; // Return empty string for minor ticks
              },
              major: {
                  enabled: true
              },
              font: {
                  size: 10
              }
            }
          },
          y: { display: false }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  });
});
