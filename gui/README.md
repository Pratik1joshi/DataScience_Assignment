# 🚍 Bus Disruption Risk Predictor - Web GUI

Modern web interface for predicting bus disruption risk using Random Forest machine learning model.

## 🎯 Features

- **Interactive Form**: Input bus journey details (line, time, location, route info)
- **Real-time Predictions**: Get instant disruption risk predictions (High/Low)
- **Visual Analytics**: 
  - Risk probability gauge
  - Confidence scores
  - Model performance metrics
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, gradient-based design with smooth animations

## 📁 Project Structure

```
gui/
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Main HTML page
└── static/
    ├── style.css         # CSS styling
    └── script.js         # JavaScript logic
```

## 🚀 Installation & Setup

### 1. Install Dependencies

```powershell
cd gui
pip install -r requirements.txt
```

### 2. Verify Model Files

Ensure these files exist in `data/processed/models/`:
- `rf_model_params.pkl` - Random Forest model parameters
- `lr_model_params.pkl` - Logistic Regression parameters
- `feature_metadata.json` - Feature engineering config
- `model_metrics.json` - Model performance metrics

Training data in `data/processed/`:
- `train_split.csv` - Training data (for dropdown options)

### 3. Run the Server

```powershell
python app.py
```

The server will start at: **http://localhost:5000**

## 🎮 Usage

1. **Open Browser**: Navigate to `http://localhost:5000`
2. **Fill Form**:
   - Select bus line (e.g., "22")
   - Choose direction (inbound/outbound)
   - Enter departure hour (0-23)
   - Select day of week
   - Auto-filled time period based on hour
   - Select latitude zone
   - Enter GPS coordinates (Thurrock/Essex area: lat 51.2-51.6)
   - Enter stop sequence and run time
3. **Get Prediction**: Click "Predict Disruption Risk"
4. **View Results**:
   - Risk level (High/Low) with color indicator
   - Probability score (0-100%)
   - Confidence level
   - Model information

## 🔧 API Endpoints

### GET `/api/metadata`
Returns dropdown options and model info for form initialization.

**Response**:
```json
{
  "line_names": ["22", "165", "375", ...],
  "directions": ["inbound", "outbound"],
  "time_periods": ["night", "morning_rush", "midday", ...],
  "lat_zones": ["south", "mid_south", "mid_north", "north"],
  "model_info": {
    "accuracy": 0.9584,
    "auc_roc": 0.9964,
    "f1": 0.9587,
    "num_trees": 100
  }
}
```

### POST `/api/predict`
Accepts journey features and returns risk prediction.

**Request Body**:
```json
{
  "line_name": "22",
  "direction": "outbound",
  "departure_hour": 8,
  "day_of_week": 1,
  "stop_sequence": 10,
  "latitude": 51.48,
  "longitude": 0.05,
  "run_time_min": 25,
  "time_of_day": "morning_rush",
  "lat_zone": "mid_south"
}
```

**Response**:
```json
{
  "prediction": 1,
  "risk_label": "High Risk",
  "probability": 0.75,
  "confidence": 0.85,
  "model_info": {
    "model": "Random Forest Classifier",
    "trees": 100,
    "threshold": 142
  },
  "timestamp": "2026-02-06T15:30:00"
}
```

### GET `/api/feature-importance`
Returns top 15 feature importances for visualization.

**Response**:
```json
{
  "features": ["route_complexity", "hour_sin", "latitude", ...],
  "importances": [0.234, 0.189, 0.156, ...]
}
```

## 🎨 Design Features

- **Gradient Backgrounds**: Dark blue gradient for professional look
- **Card-based Layout**: Clean, organized information hierarchy
- **Smooth Animations**: Slide-in, fade-in, bounce effects
- **Color Coding**:
  - 🟢 Green - Low risk
  - 🔴 Red - High risk
  - 🔵 Blue - Primary actions
- **Responsive Grid**: Adapts to screen size
- **Loading States**: Spinner during prediction
- **Progress Bars**: Visual probability/confidence indicators

## 📊 Model Information

- **Algorithm**: Random Forest Classifier
- **Trees**: 100 decision trees
- **Max Depth**: 10
- **Features**: 15 engineered features from timetable data
- **Training Data**: 27,937 journey records
- **Test Accuracy**: 95.84%
- **AUC-ROC**: 0.9964

## 🔒 Security Notes

- CORS enabled for development (restrict in production)
- Input validation on client and server side
- No sensitive data stored in browser
- Model parameters loaded from secure pickle files

## 🐛 Troubleshooting

**Problem**: Server won't start
- **Solution**: Check if port 5000 is available: `netstat -ano | findstr :5000`

**Problem**: Model files not found
- **Solution**: Run notebooks 01-04 to generate model files in `data/processed/`

**Problem**: Dropdown options empty
- **Solution**: Verify `train_split.csv` exists and contains data

**Problem**: 404 on static files
- **Solution**: Ensure `templates/` and `static/` folders exist with correct structure

## 🚀 Production Deployment

For production deployment:

1. **Disable Debug Mode**: Change `app.run(debug=False)`
2. **Use Production Server**: Replace Flask dev server with Gunicorn/uWSGI
3. **Environment Variables**: Store paths in `.env` file
4. **HTTPS**: Enable SSL/TLS certificates
5. **CORS**: Restrict to specific domains
6. **Rate Limiting**: Add request throttling
7. **Logging**: Configure proper logging system

## 📝 License

Part of Big Data Programming Project - Softwarica College

## 👨‍💻 Author

Transport Analytics Team - Ensign Bus Data Project
