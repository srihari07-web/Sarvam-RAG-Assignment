import faiss
import numpy as np

def store_vectors(vectors):
    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(vectors)
    faiss.write_index(index, "vector_db.index")

if __name__ == "__main__":
    vectors = np.load("vectors.npy")
    store_vectors(vectors)
