/**
 * LSTM Prediction Dashboard - Frontend Logic
 * Integrates with Flask backend API
 */

const API_URL = 'http://localhost:5000';
let predictionHistory = [];
let currentInputData = [];
let predictionChart = null;
let inputChart = null;

// Denormalization settings
let salesMin = 1000;
let salesMax = 10000;

// ==================== Initialization ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard initialized');
    
    // Load denormalization settings from localStorage
    loadDenormalizationSettings();
    
    // Check backend status
    checkBackendStatus();
    
    // Set up event listeners
    document.getElementById('predict-btn').addEventListener('click', makePrediction);
    document.getElementById('input-type').addEventListener('change', handleInputTypeChange);
    document.getElementById('sales-min').addEventListener('change', saveDenormalizationSettings);
    document.getElementById('sales-max').addEventListener('change', saveDenormalizationSettings);
    
    // Initialize charts
    initCharts();
    
    // Auto-update status every 5 seconds
    setInterval(checkBackendStatus, 5000);
});

// ==================== Backend Communication ====================

async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_URL}/api/health`);
        if (response.ok) {
            document.getElementById('backend-status').textContent = 'Connected';
            document.getElementById('status').className = 'text-green-500 font-medium';
            document.getElementById('status').textContent = '●';
            hideError();
        } else {
            setBackendDisconnected();
        }
    } catch (error) {
        setBackendDisconnected();
    }
}

function setBackendDisconnected() {
    document.getElementById('backend-status').textContent = 'Disconnected';
    document.getElementById('backend-status').className = 'text-2xl font-bold text-red-600';
    document.getElementById('status').className = 'text-red-500 font-medium';
    document.getElementById('status').textContent = '●';
    showError('Backend is not running. Make sure to run "python main.py" in the backend folder.');
}

async function makePrediction() {
    try {
        // Get input data
        const inputData = getInputData();
        if (!inputData || inputData.length === 0) {
            showError('Please provide input data');
            return;
        }

        // Store current input
        currentInputData = inputData;

        // Show loading state
        showLoading();
        hideError();
        hideSuccess();

        const startTime = performance.now();

        // Send prediction request
        const response = await fetch(`${API_URL}/api/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: inputData })
        });

        const endTime = performance.now();
        const responseTime = ((endTime - startTime) / 1000).toFixed(2);

        hideLoading();

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Prediction failed');
        }

        const result = await response.json();

        // Process results
        processPredictionResult(result, inputData, responseTime);
        
    } catch (error) {
        hideLoading();
        showError(`Error: ${error.message}`);
        console.error('Prediction error:', error);
    }
}

function processPredictionResult(result, inputData, responseTime) {
    // Update denormalization settings
    salesMin = parseFloat(document.getElementById('sales-min').value) || 1000;
    salesMax = parseFloat(document.getElementById('sales-max').value) || 10000;
    
    // Denormalize predictions
    const denormalizedPredictions = result.predictions.map(pred => 
        denormalizePrediction(pred, salesMin, salesMax)
    );
    
    // Update prediction history
    const historyItem = {
        timestamp: new Date().toLocaleTimeString(),
        predictions: result.predictions,
        denormalizedPredictions: denormalizedPredictions,
        responseTime: responseTime
    };
    predictionHistory.push(historyItem);

    // Update statistics
    updateStatistics(denormalizedPredictions, responseTime);

    // Update display
    const lastPredictionActual = denormalizedPredictions[0]?.toFixed(2) || 'N/A';
    const lastPredictionNormalized = result.predictions[0]?.toFixed(4) || 'N/A';
    document.getElementById('last-prediction').innerHTML = `
        <div class="text-2xl font-bold text-blue-600">${lastPredictionActual}</div>
        <div class="text-xs text-gray-500 mt-1">(normalized: ${lastPredictionNormalized})</div>
    `;
    document.getElementById('total-predictions').textContent = predictionHistory.length;

    // Update response details
    displayResponseDetails(result, denormalizedPredictions);

    // Update charts
    updateCharts(inputData);

    // Show success message
    showSuccess();
}

// ==================== Denormalization ====================

function denormalizePrediction(normalizedValue, minSales, maxSales) {
    /**
     * Convert normalized prediction (0-1) to actual sales value
     * Formula: Actual = Min + (Normalized × (Max - Min))
     */
    return minSales + (normalizedValue * (maxSales - minSales));
}

function saveDenormalizationSettings() {
    salesMin = parseFloat(document.getElementById('sales-min').value) || 1000;
    salesMax = parseFloat(document.getElementById('sales-max').value) || 10000;
    
    // Save to localStorage for persistence
    localStorage.setItem('salesMin', salesMin);
    localStorage.setItem('salesMax', salesMax);
    
    console.log(`Denormalization settings updated: Min=$${salesMin}, Max=$${salesMax}`);
}

function loadDenormalizationSettings() {
    const savedMin = localStorage.getItem('salesMin');
    const savedMax = localStorage.getItem('salesMax');
    
    if (savedMin) {
        salesMin = parseFloat(savedMin);
        document.getElementById('sales-min').value = salesMin;
    }
    if (savedMax) {
        salesMax = parseFloat(savedMax);
        document.getElementById('sales-max').value = salesMax;
    }
}

// ==================== Data Handling ====================

function getInputData() {
    const inputType = document.getElementById('input-type').value;

    switch (inputType) {
        case 'random':
            return generateRandomData();
        case 'manual':
            return parseManualInput();
        case 'sequence':
            return generateTimeSeriesSequence();
        default:
            return generateRandomData();
    }
}

function generateRandomData() {
    const minVal = parseFloat(document.getElementById('min-value').value) || -5;
    const maxVal = parseFloat(document.getElementById('max-value').value) || 5;
    const data = [];

    for (let i = 0; i < 100; i++) {
        data.push(Math.random() * (maxVal - minVal) + minVal);
    }

    return data;
}

function parseManualInput() {
    const input = document.getElementById('data-input').value;
    const values = input.split(',').map(v => parseFloat(v.trim()));
    
    if (values.some(isNaN)) {
        showError('Please enter valid numbers separated by commas');
        return null;
    }

    if (values.length !== 100) {
        showError(`Please enter exactly 100 values. You entered ${values.length}`);
        return null;
    }

    return values;
}

function generateTimeSeriesSequence() {
    const data = [];
    let value = 0;

    for (let i = 0; i < 100; i++) {
        // Generate a sin-like pattern with some noise
        value += Math.sin(i * 0.1) * 0.5 + (Math.random() - 0.5) * 0.2;
        data.push(value);
    }

    return data;
}

// ==================== UI Updates ====================

function handleInputTypeChange() {
    const inputType = document.getElementById('input-type').value;
    const manualInput = document.getElementById('manual-input');
    const randomOptions = document.getElementById('random-options');

    if (inputType === 'manual') {
        manualInput.classList.remove('hidden');
        randomOptions.classList.add('hidden');
    } else {
        manualInput.classList.add('hidden');
        randomOptions.classList.remove('hidden');
    }
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('predict-btn').disabled = true;
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('predict-btn').disabled = false;
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.querySelector('p').textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    document.getElementById('error-message').classList.add('hidden');
}

function showSuccess() {
    document.getElementById('success-message').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('success-message').classList.add('hidden');
    }, 3000);
}

function hideSuccess() {
    document.getElementById('success-message').classList.add('hidden');
}

function displayResponseDetails(result, denormalizedPredictions) {
    const details = document.getElementById('response-details');
    const normalized = result.predictions[0]?.toFixed(6) || 'N/A';
    const actual = denormalizedPredictions ? denormalizedPredictions[0]?.toFixed(2) : 'N/A';
    
    details.innerHTML = `
        <div class="grid grid-cols-2 gap-2">
            <div>
                <p class="text-gray-600 text-xs">Status</p>
                <p class="font-semibold text-green-600">${result.status}</p>
            </div>
            <div>
                <p class="text-gray-600 text-xs">Shape</p>
                <p class="font-semibold text-blue-600">${JSON.stringify(result.shape)}</p>
            </div>
            <div>
                <p class="text-gray-600 text-xs">Normalized Value</p>
                <p class="font-semibold text-purple-600">${normalized}</p>
            </div>
            <div>
                <p class="text-gray-600 text-xs">Actual Sales ($)</p>
                <p class="font-semibold text-green-600">$${actual}</p>
            </div>
            <div class="col-span-2">
                <p class="text-gray-600 text-xs">Message</p>
                <p class="font-semibold text-gray-700">${result.message}</p>
            </div>
        </div>
    `;
}

function updateStatistics(predictions, responseTime) {
    if (!predictions || predictions.length === 0) return;

    const avg = (predictions.reduce((a, b) => a + b, 0) / predictions.length).toFixed(4);
    const min = Math.min(...predictions).toFixed(4);
    const max = Math.max(...predictions).toFixed(4);

    document.getElementById('avg-pred').textContent = avg;
    document.getElementById('min-pred').textContent = min;
    document.getElementById('max-pred').textContent = max;
    document.getElementById('response-time').textContent = `${responseTime}s`;
}

// ==================== Charts ====================

function initCharts() {
    // Prediction Chart
    const predCanvas = document.getElementById('prediction-chart');
    predictionChart = new Chart(predCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Predicted Daily Sales ($)',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.15)',
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.35
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Forecast #'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Sales Amount ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    // Input Chart
    const inputCanvas = document.getElementById('input-chart');
    inputChart = new Chart(inputCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Input Data',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
}

function updateCharts(inputData) {
    // Update input chart
    const inputLabels = Array.from({length: inputData.length}, (_, i) => i + 1);
    inputChart.data.labels = inputLabels;
    inputChart.data.datasets[0].data = inputData;
    inputChart.update();

    // Update prediction history line chart (using denormalized values)
    const historyLabels = predictionHistory.map((_, index) => `#${index + 1}`);
    const historyData = predictionHistory.map(item => item.denormalizedPredictions?.[0] ?? 0);

    predictionChart.data.labels = historyLabels;
    predictionChart.data.datasets[0].data = historyData;
    predictionChart.update();
}

// ==================== Export Function ====================

function exportResults() {
    if (predictionHistory.length === 0) {
        showError('No predictions to export');
        return;
    }

    const csv = convertToCSV(predictionHistory);
    downloadCSV(csv, 'predictions.csv');
}

function convertToCSV(data) {
    let csv = 'Timestamp,Prediction\n';
    data.forEach(item => {
        csv += `${item.timestamp},${item.predictions.join('|')}\n`;
    });
    return csv;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

// Expose exportResults globally
window.exportResults = exportResults;

console.log('Dashboard ready. API URL:', API_URL);
