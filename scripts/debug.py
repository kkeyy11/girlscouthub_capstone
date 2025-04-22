import joblib

try:
    # Load the trained model (replace the path with the correct location of your model)
    model = joblib.load('sentiment_model.joblib')
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
