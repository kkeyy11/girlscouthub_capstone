import sys
import joblib

# Load joblib model
model = joblib.load('scripts/sentiment_model.joblib')

def predict_sentiment(text):
    sentiment = model.predict([text])[0]
    return sentiment

if __name__ == "__main__":
    input_text = sys.argv[1]
    result = predict_sentiment(input_text)
    print(result)
