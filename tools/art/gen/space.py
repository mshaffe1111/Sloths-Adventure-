import sys, time, shutil
from gradio_client import Client, handle_file
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
which, ref, out, prompt = sys.argv[1:5]
seed = int(sys.argv[5]) if len(sys.argv) > 5 else 7
t0 = time.time()
if which == 'qwen':
    c = Client('Qwen/Qwen-Image-Edit-2509', token=tok, verbose=False)
    res, s = c.predict(images=[{'image': handle_file(ref), 'caption': None}], prompt=prompt, seed=seed, randomize_seed=False,
                       true_guidance_scale=4.0, num_inference_steps=40, height=1024, width=1024, rewrite_prompt=False, api_name='/infer')
    path = res[0]['image'] if isinstance(res, list) else res
else:
    c = Client('black-forest-labs/FLUX.1-Kontext-Dev', token=tok, verbose=False)
    res, s = c.predict(input_image=handle_file(ref), prompt=prompt, seed=seed, randomize_seed=False, guidance_scale=2.5, steps=28, api_name='/infer')
    path = res
path = path if isinstance(path, str) else path.get('path')
shutil.copy(path, out)
print(which, out, f'{time.time() - t0:.0f}s', flush=True)
