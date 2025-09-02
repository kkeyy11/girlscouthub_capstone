import sys
from transformers import pipeline

# Load pretrained model (Tagalog + English sentiment)
classifier = pipeline("sentiment-analysis", model="dost-asti/RoBERTa-tl-sentiment-analysis")

# Get review text from Node.js (join all args to support spaces)
text = " ".join(sys.argv[1:])

# Run analysis
result = classifier(text)[0]

# Print label only and flush
print(result['label'], flush=True)
