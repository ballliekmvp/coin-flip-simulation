// Get DOM elements
const probHeadsSlider = document.getElementById('prob-heads');
const probHeadsNumberInput = document.getElementById('prob-heads-number');
const probHeadsValueSpan = document.getElementById('prob-heads-value');
const numTossesSlider = document.getElementById('num-tosses');
const numTossesValueSpan = document.getElementById('num-tosses-value');
const showTrueProbCheckbox = document.getElementById('show-true-prob');
const tossButton = document.getElementById('toss-button');
const resetButton = document.getElementById('reset-button');
const headsCountSpan = document.getElementById('heads-count');
const tailsCountSpan = document.getElementById('tails-count');
const tossSequenceDiv = document.getElementById('toss-sequence');
const graphCanvas = document.getElementById('proportion-graph');

// State variables
let totalHeads = 0;
let totalTails = 0;
let totalTosses = 0;
let proportionHistory = []; // Stores proportion of heads after each toss/batch
let tossLabels = []; // Stores cumulative toss number for graph labels

// Chart.js configuration
let proportionChart;

function initializeChart() {
    const ctx = graphCanvas.getContext('2d');
    proportionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: tossLabels, // Cumulative toss numbers
            datasets: [{
                label: 'Proportion Heads',
                data: proportionHistory,
                borderColor: 'blue',
                tension: 0.1,
                fill: false,
                pointRadius: 2 // Smaller points
            },
            {
                 label: 'True Probability',
                 data: [], // This dataset will be populated dynamically
                 borderColor: 'green',
                 borderDash: [5, 5], // Dashed line
                 pointRadius: 0, // No points
                 fill: false,
                 hidden: !showTrueProbCheckbox.checked // Hide initially if not checked
            }
           ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow graph to fill container
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Proportion Heads'
                    }
                },
                x: {
                     title: {
                        display: true,
                        text: 'Number of Tosses' // Label for X axis
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

function updateChart() {
    // Update proportion data
    proportionChart.data.datasets[0].data = proportionHistory;
    proportionChart.data.labels = tossLabels;

    // Update true probability line
    const trueProb = parseFloat(probHeadsSlider.value);
     proportionChart.data.datasets[1].data = tossLabels.map(() => trueProb); // Create an array of the true probability value
     proportionChart.data.datasets[1].hidden = !showTrueProbCheckbox.checked;

    proportionChart.update();
}


// Sync slider and number input for probability
probHeadsSlider.addEventListener('input', () => {
    const value = parseFloat(probHeadsSlider.value);
    probHeadsNumberInput.value = value.toFixed(2);
    probHeadsValueSpan.textContent = value.toFixed(2);
     updateChart(); // Update the true probability line when probability changes
});

probHeadsNumberInput.addEventListener('input', () => {
    let value = parseFloat(probHeadsNumberInput.value);
    if (isNaN(value) || value < 0) value = 0;
    if (value > 1) value = 1;
    probHeadsSlider.value = value.toFixed(2);
    probHeadsValueSpan.textContent = value.toFixed(2);
     updateChart(); // Update the true probability line when probability changes
});

// Update number of tosses display
numTossesSlider.addEventListener('input', () => {
    numTossesValueSpan.textContent = numTossesSlider.value;
});

// Toggle true probability line visibility
showTrueProbCheckbox.addEventListener('change', () => {
    updateChart(); // Chart update handles visibility based on checkbox
});


// TOSS button logic
tossButton.addEventListener('click', () => {
    const probabilityOfHeads = parseFloat(probHeadsSlider.value);
    const numberOfTosses = parseInt(numTossesSlider.value, 10);

    if (isNaN(probabilityOfHeads) || probabilityOfHeads < 0 || probabilityOfHeads > 1) {
        alert("Please enter a valid probability between 0 and 1.");
        return;
    }
    if (isNaN(numberOfTosses) || numberOfTosses <= 0) {
         alert("Please enter a valid number of tosses greater than 0.");
         return;
    }


    for (let i = 0; i < numberOfTosses; i++) {
        totalTosses++;
        const randomValue = Math.random(); // Generates a number between 0 (inclusive) and 1 (exclusive)

        let result;
        if (randomValue < probabilityOfHeads) {
            totalHeads++;
            result = 'H';
        } else {
            totalTails++;
            result = 'T';
        }

        // Append result to sequence display (with spacing)
        tossSequenceDiv.textContent += result + ' ';


        // Calculate and store proportion after each individual toss
        const currentProportionHeads = totalTosses === 0 ? 0 : totalHeads / totalTosses;
        proportionHistory.push(currentProportionHeads);
        tossLabels.push(totalTosses); // Add cumulative toss number as label
    }

    // Update counts display
    headsCountSpan.textContent = `Heads = ${totalHeads}/${totalTosses}`;
    tailsCountSpan.textContent = `Tails = ${totalTails}/${totalTosses}`;

    // Update the chart with the new data points
    updateChart();
});


// RESET button logic
resetButton.addEventListener('click', () => {
    totalHeads = 0;
    totalTails = 0;
    totalTosses = 0;
    proportionHistory = [];
    tossLabels = [];

    headsCountSpan.textContent = `Heads = 0/0`;
    tailsCountSpan.textContent = `Tails = 0/0`;
    tossSequenceDiv.textContent = '';

    // Clear and re-initialize the chart
    if (proportionChart) {
        proportionChart.destroy();
    }
    initializeChart(); // Re-draw chart with empty data and true probability line
});

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
     // Ensure initial values are displayed
     probHeadsValueSpan.textContent = parseFloat(probHeadsSlider.value).toFixed(2);
     probHeadsNumberInput.value = parseFloat(probHeadsSlider.value).toFixed(2);
     numTossesValueSpan.textContent = numTossesSlider.value;

    initializeChart(); // Initialize the chart on page load
});