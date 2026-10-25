import os, io, time, torch
from huggingface_hub import hf_hub_download, HfApi
from diffusers import DiffusionPipeline
tok = os.environ['HF_TOKEN']
api = HfApi(token=tok)
t0 = time.time()
pipe = DiffusionPipeline.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)
lora = hf_hub_download('mshaffe111/pokey-qwen-lora', 'pokey_qwen_v1.safetensors', token=tok)
try:
    pipe.load_lora_weights(lora)
    print('LORA ok (direct)', flush=True)
except Exception as e:
    print('LORA direct failed:', str(e)[:300], flush=True)
    from safetensors.torch import load_file
    sd = load_file(lora)
    print('keys', list(sd.keys())[:4], flush=True)
    sd2 = {}
    for k, v in sd.items():
        k2 = k
        for pre in ('diffusion_model.', 'model.diffusion_model.', 'base_model.model.'):
            if k2.startswith(pre): k2 = 'transformer.' + k2[len(pre):]
        if not k2.startswith('transformer.'): k2 = 'transformer.' + k2
        sd2[k2] = v
    pipe.load_lora_weights(sd2)
    print('LORA ok (renamed)', flush=True)
JOBS = [
    ('yawn-stretch', 'a huge sleepy yawn, mouth wide open, eyes squeezed shut, both arms stretched high above his head, front view', 42),
    ('yawn-stretch-b', 'a huge sleepy yawn, mouth wide open, eyes squeezed shut, both arms stretched high above his head, front view', 7),
    ('dozing', 'sitting on the ground dozing off, head nodding forward onto his chest, eyes closed, a tiny sleep bubble at his nose', 42),
    ('belly-scratch', 'scratching his round belly lazily with one paw, eyes half closed, content smile, standing, front view', 42),
    ('upside-down', 'hanging upside down from a horizontal branch by all four paws, sloth style, his back toward the ground, side view, the branch drawn above him', 42),
    ('upside-down-b', 'hanging upside down from a horizontal branch by all four paws, sloth style, his back toward the ground, side view, the branch drawn above him', 7),
    ('push-log', 'pushing a heavy fallen log with both paws, leaning his whole body into it, feet braced, straining, side view facing right, the log drawn', 42),
    ('climb-trunk', 'climbing up a thick tree trunk, hugging it with arms and legs, looking up, side view, the trunk drawn', 42),
    ('leap', 'leaping through the air toward the right, arms reaching forward to grab something, legs trailing behind, side view', 42),
    ('surprised', 'surprised, eyes huge, mouth open in an O, paws raised, front view', 42),
    ('wave', 'waving hello with one paw, big happy smile, front view', 42),
    ('swing', 'swinging on a hanging vine, holding it with both paws, body leaning forward, side view facing right, the vine drawn', 42),
]
for i, (name, pose, seed) in enumerate(JOBS):
    t1 = time.time()
    img = pipe(prompt=f'pokeysloth, {pose}, painted storybook illustration, plain grey background', negative_prompt=' ',
               width=1024, height=1024, num_inference_steps=30, true_cfg_scale=4.0,
               generator=torch.Generator('cuda').manual_seed(seed)).images[0]
    buf = io.BytesIO(); img.save(buf, 'PNG')
    api.upload_file(path_or_fileobj=buf.getvalue(), path_in_repo=f'tests/{i:02d}-{name}.png', repo_id='mshaffe111/pokey-qwen-lora')
    print('DONE', i, name, round(time.time() - t1), flush=True)
print('ALL_DONE', round(time.time() - t0), flush=True)
