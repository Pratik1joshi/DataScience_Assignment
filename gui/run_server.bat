@echo off
REM Start Flask Server for Bus Disruption Risk Predictor

echo ========================================
echo  Bus Disruption Risk Predictor GUI
echo ========================================
echo.

REM Check if in correct directory
if not exist "app.py" (
    echo ERROR: app.py not found!
    echo Please run this script from the gui directory.
    pause
    exit /b 1
)

REM Check if model files exist
if not exist "..\data\processed\models\rf_model_params.pkl" (
    echo WARNING: Model file not found at data\processed\models\rf_model_params.pkl
    echo Please run notebooks 01-04 first to generate model files.
    echo.
    pause
)

echo Installing dependencies...
pip install -r requirements.txt
echo.

echo Starting Flask server...
echo.
echo Open your browser to: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

python app.py

pause
