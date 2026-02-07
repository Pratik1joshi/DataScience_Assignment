// JavaScript for Bus Disruption Risk Predictor

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Load metadata on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadMetadata();
    setupFormHandlers();
});

/**
 * Load dropdown options and model info from API
 */
async function loadMetadata() {
    try {
        const response = await fetch(`${API_URL}/metadata`);
        const data = await response.json();
        
        // Populate dropdowns
        populateDropdown('line_name', data.line_names);
        populateDropdown('direction', data.directions);
        populateDropdown('time_of_day', data.time_periods.map(capitalizeWords));
        populateDropdown('lat_zone', data.lat_zones.map(capitalizeWords));
        
        // Update model info in header
        const accuracy = (data.model_info.accuracy * 100).toFixed(1);
        const auc = data.model_info.auc_roc.toFixed(4);
        
        document.getElementById('model-accuracy').textContent = `${accuracy}%`;
        document.getElementById('footer-accuracy').textContent = `${accuracy}%`;
        document.getElementById('footer-auc').textContent = auc;
        
    } catch (error) {
        console.error('Error loading metadata:', error);
        showError('Failed to load form options. Please refresh the page.');
    }
}

/**
 * Populate dropdown with options
 */
function populateDropdown(selectId, options) {
    const select = document.getElementById(selectId);
    const currentOptions = Array.from(select.options).map(opt => opt.value);
    
    options.forEach(option => {
        // Convert to original format (lowercase with underscores)
        const value = option.toLowerCase().replace(/ /g, '_');
        
        // Skip if already exists
        if (!currentOptions.includes(value)) {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = option;
            select.appendChild(opt);
        }
    });
}

/**
 * Capitalize words (e.g., "morning_rush" -> "Morning Rush")
 */
function capitalizeWords(str) {
    return str.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

/**
 * Setup form event handlers
 */
function setupFormHandlers() {
    const form = document.getElementById('prediction-form');
    form.addEventListener('submit', handleFormSubmit);
    
    // Auto-update time_of_day based on departure_hour
    document.getElementById('departure_hour').addEventListener('change', (e) => {
        const hour = parseInt(e.target.value);
        const timeOfDay = getTimeOfDay(hour);
        document.getElementById('time_of_day').value = timeOfDay;
    });
    
    // Validation on latitude/longitude
    document.getElementById('latitude').addEventListener('input', (e) => {
        const lat = parseFloat(e.target.value);
        if (lat < 51.2 || lat > 51.6) {
            e.target.setCustomValidity('Latitude should be between 51.2 and 51.6 (Thurrock/Essex area)');
        } else {
            e.target.setCustomValidity('');
        }
    });
}

/**
 * Get time of day based on hour
 */
function getTimeOfDay(hour) {
    if (hour >= 0 && hour < 5) return 'night';
    if (hour >= 5 && hour < 10) return 'morning_rush';
    if (hour >= 10 && hour < 16) return 'midday';
    if (hour >= 16 && hour < 20) return 'evening_rush';
    return 'late_night';
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    setLoadingState(true);
    
    // Record start time
    const startTime = Date.now();
    
    try {
        // Make prediction request
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Prediction failed');
        }
        
        const result = await response.json();
        
        // Calculate prediction time
        const predTime = Date.now() - startTime;
        result.predictionTime = predTime;
        
        // Display results
        displayResults(result);
        
    } catch (error) {
        console.error('Prediction error:', error);
        showError('Failed to get prediction. Please try again.');
    } finally {
        setLoadingState(false);
    }
}

/**
 * Set loading state for predict button
 */
function setLoadingState(isLoading) {
    const btn = document.getElementById('predict-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    
    if (isLoading) {
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
    } else {
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

/**
 * Display prediction results
 */
function displayResults(result) {
    const resultsCard = document.getElementById('results-card');
    const riskIndicator = document.getElementById('risk-indicator');
    
    // Update risk indicator
    const isHighRisk = result.prediction === 1;
    riskIndicator.className = `risk-indicator ${isHighRisk ? 'high-risk' : 'low-risk'}`;
    
    // Update label
    document.getElementById('risk-label').textContent = result.risk_label;
    
    // Update probability
    const probPercent = (result.probability * 100).toFixed(1);
    document.getElementById('risk-probability').textContent = `${probPercent}%`;
    
    // Update metrics
    document.getElementById('metric-prob').textContent = result.probability.toFixed(3);
    document.getElementById('metric-confidence').textContent = 
        `${(result.confidence * 100).toFixed(1)}%`;
    
    // Update progress bars with animation
    setTimeout(() => {
        document.getElementById('prob-bar').style.width = `${probPercent}%`;
        document.getElementById('conf-bar').style.width = 
            `${(result.confidence * 100).toFixed(1)}%`;
    }, 100);
    
    // Update model info
    document.getElementById('model-type').textContent = result.model_info.model;
    document.getElementById('num-trees').textContent = result.model_info.trees;
    document.getElementById('pred-time').textContent = `${result.predictionTime}ms`;
    
    // Show results and enable split view
    const mainContent = document.querySelector('.main-content');
    mainContent.classList.add('split-view');
    resultsCard.style.display = 'block';
    
    // Smooth scroll to results
    setTimeout(() => {
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * Reset form and show input card again
 */
function resetForm() {
    document.getElementById('prediction-form').reset();
    const mainContent = document.querySelector('.main-content');
    mainContent.classList.remove('split-view');
    document.getElementById('results-card').style.display = 'none';
    
    // Scroll back to form
    document.querySelector('.input-card').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

/**
 * Show error message
 */
function showError(message) {
    alert(`Error: ${message}`);
}

/**
 * Format date/time for display
 */
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getTimeOfDay,
        capitalizeWords,
        formatDateTime
    };
}
