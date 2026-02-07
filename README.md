# Bus Disruption Risk Prediction - Big Data Project

Predictive analytics platform for public transport disruption risk using BODS TransXChange and SIRI-SX data.

## 📊 Project Overview

**Objective:** Predict high/low disruption risk for bus journeys using machine learning models trained on UK transport data.

**Dataset:** 
- 170+ TransXChange XML files (Ensign Bus timetables)
- 428 SIRI-SX disruption records
- 34,922 journey records processed

**Models:**
- Logistic Regression: 95.84% accuracy
- Random Forest: 100% accuracy, AUC-ROC 1.0

## 🚀 Quick Start

### Prerequisites
```bash
Python 3.12+
PySpark 3.5.0
Flask 3.0.0
pandas, numpy, matplotlib, seaborn, scikit-learn
```

### Installation
```bash
# Install dependencies
pip install pyspark pandas numpy matplotlib seaborn scikit-learn flask flask-cors

# Clone repository
cd big-data-transport-analytics
```

### Run Notebooks (in order)
```bash
01_data_ingestion.ipynb       # Parse XML, merge datasets
02_data_cleaning.ipynb        # Data cleaning & validation
03_feature_engineering.ipynb  # Feature creation, pipeline
04_model_training.ipynb       # Train LR + RF models
05_evaluation.ipynb           # Evaluate & visualize results
```

### Launch Web GUI
```bash
cd gui
python app.py
# Open http://localhost:5000
```

## 📁 Project Structure

```
big-data-transport-analytics/
├── data/
│   ├── raw/                 # BODS XML files
│   └── processed/           # CSV outputs & trained models
│       └── models/          # Model files (.pkl, .json)
├── notebooks/               # Jupyter notebooks (01-05)
├── outputs/                 # Plots & visualizations
├── gui/                     # Flask web application
│   ├── app.py              # Backend API
│   ├── templates/          # HTML
│   └── static/             # CSS & JavaScript
└── DOCUMENTATION.txt        # Full technical documentation
```

## 🎯 Key Features

- **Data Pipeline:** XML parsing → cleaning → feature engineering
- **ML Models:** Binary classification with ensemble methods
- **Web Interface:** Professional Flask GUI for real-time predictions
- **Visualizations:** ROC curves, confusion matrices, feature importance

## 📈 Results

| Model | Accuracy | AUC-ROC | F1 Score |
|-------|----------|---------|----------|
| Logistic Regression | 95.84% | 0.9964 | 0.9587 |
| Random Forest | 100.0% | 1.0000 | 1.0000 |

## 👨‍💻 Author

Softwarica College - Big Data Programming Project 2026

## 📄 License

Educational project - Softwarica College

---

**For detailed technical documentation, see `DOCUMENTATION.txt`**
