"""One reference-based edit through Hugging Face Inference Providers. Usage: edit.py MODEL PROVIDER REF OUT PROMPT"""
import sys, time
from huggingface_hub import InferenceClient

model, provider, ref, out, prompt = sys.argv[1:6]
token = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
client = InferenceClient(provider=provider, api_key=token)
t0 = time.time()
img = client.image_to_image(open(ref, 'rb').read(), prompt=prompt, model=model)
img.save(out)
print(f'{out} {img.size} {time.time() - t0:.1f}s', flush=True)
