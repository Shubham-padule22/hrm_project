import numpy as np


class EmbeddingUtils:
    @staticmethod
    def embedding_to_bytes(embedding: np.ndarray) -> bytes:
        """
        Convert numpy embedding to bytes.
        """
        return embedding.astype(np.float32).tobytes()

    @staticmethod
    def bytes_to_embedding(binary_data: bytes) -> np.ndarray:
        """
        Convert bytes back to numpy array.
        """
        return np.frombuffer(binary_data, dtype=np.float32)