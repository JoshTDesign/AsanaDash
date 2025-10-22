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

    new Chart(sparklineCanvas, {
      type: 'line',
      data: {
        labels: historicalData.map((_, index) => index + 1),
        datasets: [{
          data: historicalData,
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
          x: { display: false },
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
