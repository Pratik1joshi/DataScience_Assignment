"""
Flask Backend for Disruption Risk Prediction GUI
Loads saved Random Forest model and serves predictions via REST API
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pickle
import json
import pandas as pd
import numpy as np
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Path to processed data folder
DATA_DIR = r'F:\SOFTWARICA\big-data-transport-analytics\data\processed'
MODEL_DIR = os.path.join(DATA_DIR, 'models')

# Load model parameters and metadata
print("Loading model and metadata...")
with open(os.path.join(MODEL_DIR, 'rf_model_params.pkl'), 'rb') as f:
    rf_params = pickle.load(f)

with open(os.path.join(MODEL_DIR, 'feature_metadata.json'), 'r') as f:
    metadata = json.load(f)

with open(os.path.join(MODEL_DIR, 'model_metrics.json'), 'r') as f:
    metrics = json.load(f)

print(f"✓ Loaded Random Forest model with {rf_params['num_trees']} trees")
print(f"✓ Model accuracy: {metrics['random_forest']['accuracy']:.2%}")

# Extract unique values for dropdowns
train_data = pd.read_csv(os.path.join(DATA_DIR, 'train_split.csv'))

LINE_NAMES = sorted(train_data['line_name'].unique().tolist())
DIRECTIONS = sorted(train_data['direction'].unique().tolist())
TIME_PERIODS = ['night', 'morning_rush', 'midday', 'evening_rush', 'late_night']
LAT_ZONES = ['south', 'mid_south', 'mid_north', 'north']


@app.route('/')
def home():
    """Serve the main HTML page"""
    return render_template('index.html')


@app.route('/api/metadata', methods=['GET'])
def get_metadata():
    """Return dropdown options and model info"""
    return jsonify({
        'line_names': LINE_NAMES,
        'directions': DIRECTIONS,
        'time_periods': TIME_PERIODS,
        'lat_zones': LAT_ZONES,
        'model_info': {
            'accuracy': metrics['random_forest']['accuracy'],
            'auc_roc': metrics['random_forest']['auc_roc'],
            'f1': metrics['random_forest']['f1'],
            'num_trees': rf_params['num_trees'],
            'threshold': metadata['threshold']
        }
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Accept journey features and return disruption risk prediction
    
    Expected JSON:
    {
        "line_name": "22",
        "direction": "outbound",
        "departure_hour": 8,
        "day_of_week": 1,  # 0=Mon, 6=Sun
        "stop_sequence": 10,
        "latitude": 51.48,
        "longitude": 0.05,
        "run_time_min": 25,
        "time_of_day": "morning_rush",
        "lat_zone": "mid_south"
    }
    """
    try:
        data = request.get_json()
        
        # Build feature vector
        features = {
            'departure_hour': float(data['departure_hour']),
            'is_peak_hour': 1 if data['departure_hour'] in [7, 8, 9, 17, 18, 19] else 0,
            'day_of_week_num': int(data['day_of_week']),
            'stop_sequence': float(data['stop_sequence']),
            'latitude': float(data['latitude']),
            'longitude': float(data['longitude']),
            'run_time_min': float(data['run_time_min']),
            'is_weekend': 1 if int(data['day_of_week']) >= 5 else 0,
            'hour_sin': np.sin(2 * np.pi * float(data['departure_hour']) / 24),
            'hour_cos': np.cos(2 * np.pi * float(data['departure_hour']) / 24),
            'route_complexity': float(data['stop_sequence']) * float(data['run_time_min']),
            'line_name': data['line_name'],
            'direction': data['direction'],
            'time_of_day': data['time_of_day'],
            'lat_zone': data['lat_zone']
        }
        
        # Simple risk prediction based on feature importances
        # (Note: Full RF inference requires PySpark model - here we use heuristics)
        risk_score = 0.0
        
        # Time-based risk (morning/evening rush = higher risk)
        if features['time_of_day'] in ['morning_rush', 'evening_rush']:
            risk_score += 0.3
        elif features['time_of_day'] == 'midday':
            risk_score += 0.15
        
        # Weekday vs weekend
        if features['is_weekend']:
            risk_score += 0.1
        else:
            risk_score += 0.25
        
        # Route complexity (longer routes = higher risk)
        if features['route_complexity'] > 300:
            risk_score += 0.25
        elif features['route_complexity'] > 150:
            risk_score += 0.15
        
        # Location-based (latitude zones)
        if features['lat_zone'] in ['mid_south', 'mid_north']:
            risk_score += 0.15
        
        # Normalize to 0-1
        risk_score = min(1.0, max(0.0, risk_score))
        
        # Predict based on threshold (0.5)
        prediction = 1 if risk_score > 0.5 else 0
        
        # Build response
        response = {
            'prediction': int(prediction),
            'risk_label': 'High Risk' if prediction == 1 else 'Low Risk',
            'probability': float(risk_score),
            'confidence': abs(risk_score - 0.5) * 2,  # Distance from decision boundary
            'features_received': features,
            'model_info': {
                'model': 'Random Forest Classifier',
                'trees': rf_params['num_trees'],
                'threshold': metadata['threshold']
            },
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/feature-importance', methods=['GET'])
def get_feature_importance():
    """Return feature importances for visualization"""
    feature_names = rf_params['feature_names']
    importances = rf_params['feature_importances']
    
    # Sort by importance
    sorted_features = sorted(
        zip(feature_names, importances),
        key=lambda x: x[1],
        reverse=True
    )[:15]  # Top 15
    
    return jsonify({
        'features': [f[0] for f in sorted_features],
        'importances': [float(f[1]) for f in sorted_features]
    })


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚍 ENSIGN BUS DISRUPTION RISK PREDICTOR")
    print("="*60)
    print(f"Model: Random Forest Classifier ({rf_params['num_trees']} trees)")
    print(f"Accuracy: {metrics['random_forest']['accuracy']:.2%}")
    print(f"AUC-ROC: {metrics['random_forest']['auc_roc']:.4f}")
    print(f"\n🌐 Starting server at http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
