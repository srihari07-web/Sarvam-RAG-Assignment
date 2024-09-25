import re
import nltk
from sentence_transformers import SentenceTransformer
import numpy as np

nltk.download('punkt')

def clean_text(text):
    text = re.sub(r"[•]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def merge_short_sentences(sentences, min_length=40):
    combined_sentences = []
    buffer = ""
    
    for sentence in sentences:
        if len(buffer) + len(sentence) < min_length:
            buffer += " " + sentence
        else:
            combined_sentences.append(buffer.strip())
            buffer = sentence
    
    if buffer:
        combined_sentences.append(buffer.strip())
    
    return combined_sentences

def preprocess_and_vectorize(text):
    text = clean_text(text)
    sentences = nltk.sent_tokenize(text)
    sentences = [sentence for sentence in sentences if len(sentence) > 20]
    sentences = merge_short_sentences(sentences)
    model = SentenceTransformer('all-MiniLM-L6-v2')
    vectors = model.encode(sentences)
    return vectors, sentences

if __name__ == "__main__":
    with open("ncert_text.txt", "r", encoding="utf-8") as f:
        text = f.read()
    vectors, sentences = preprocess_and_vectorize(text)
    np.save("vectors.npy", vectors)
    with open("sentences.txt", "w", encoding="utf-8") as f:
        for sentence in sentences:
            f.write(sentence + "\n")
