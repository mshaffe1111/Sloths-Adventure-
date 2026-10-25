"""Qwen-Image stills with one LoRA (a character's, or the game look), uploaded to OUT_REPO stills/<name>.png.
env: JOB_B64 = {"lora_repo": ..., "lora_file": ..., "scale": 1.0, "items": [{"name", "prompt", "seed", "w", "h"}]}"""
import os, io, time, json, base64, torch
from huggingface_hub import hf_hub_download, HfApi
from diffusers import DiffusionPipeline
tok = os.environ['HF_TOKEN']
api = HfApi(token=tok)
OUT = 'mshaffe111/slothadv-gen'
J = json.loads(base64.b64decode(os.environ['JOB_B64']).decode())
t0 = time.time()
pipe = DiffusionPipeline.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)
loras = J.get('loras') or [[J['lora_repo'], J['lora_file'], J.get('scale', 1.0)]]
names = []
for k, (repo, fn, sc) in enumerate(loras):
    path = hf_hub_download(repo, fn, token=tok)
    try:
        pipe.load_lora_weights(path, adapter_name=f'l{k}')
    except Exception as e:
        print('LORA direct failed:', str(e)[:200], flush=True)
        from safetensors.torch import load_file
        sd = load_file(path)
        sd2 = {}
        for key, v in sd.items():
            k2 = key
            for pre in ('diffusion_model.', 'model.diffusion_model.', 'base_model.model.'):
                if k2.startswith(pre): k2 = 'transformer.' + k2[len(pre):]
            if not k2.startswith('transformer.'): k2 = 'transformer.' + k2
            sd2[k2] = v
        pipe.load_lora_weights(sd2, adapter_name=f'l{k}')
    names.append(f'l{k}')
pipe.set_adapters(names, adapter_weights=[l[2] for l in loras])
print('LORAS', loras, flush=True)
for it in J['items']:
    t1 = time.time()
    try:
        img = pipe(prompt=it['prompt'], negative_prompt=it.get('neg', ' '), width=it.get('w', 1024), height=it.get('h', 1024),
                   num_inference_steps=it.get('steps', 30), true_cfg_scale=4.0,
                   generator=torch.Generator('cuda').manual_seed(it.get('seed', 42))).images[0]
        buf = io.BytesIO(); img.save(buf, 'PNG')
        api.upload_file(path_or_fileobj=buf.getvalue(), path_in_repo=f'stills/{it["name"]}.png', repo_id=OUT)
        print('DONE', it['name'], round(time.time() - t1), flush=True)
    except Exception as e:
        print('FAILED', it['name'], repr(e)[:300], flush=True)
print('ALL_DONE', round(time.time() - t0), flush=True)
