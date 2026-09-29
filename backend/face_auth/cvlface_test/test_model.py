import torch
from transformers import AutoModel

MODEL_NAME = "minchul/cvlface_adaface_ir101_webface12m"

print("=" * 60)
print("Loading CVLFace model...")
print("=" * 60)

model = AutoModel.from_pretrained(
    MODEL_NAME,
    trust_remote_code=True,
)

model.eval()

print("\nModel loaded successfully!")
print(type(model))

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"\nUsing device: {device}")

model.to(device)

print("\nReady for inference.")