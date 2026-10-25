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
SIDE = 'side view facing right, the whole body visible, nothing in his paws, nothing around him'
JOBS = [
    ('climb-a', f'climbing straight up an invisible vertical pole, his far arm reaching high above his head with the paw closed as if gripping, his near arm bent low at his chest gripping, his near knee raised high, his far leg stretched down, {SIDE}'),
    ('climb-b', f'climbing straight up an invisible vertical pole, his near arm reaching high above his head with the paw closed as if gripping, his far arm bent low at his chest, his far knee raised high, his near leg stretched down, {SIDE}'),
    ('climb-back', 'climbing straight up an invisible vertical pole, seen from directly behind, his back to the viewer, his left arm reaching high above his head gripping, his right arm low, his right knee raised, nothing in his paws, nothing around him'),
    ('walk-contact', f'walking forward, mid stride, his near leg forward with the heel down, his far leg back on its toes, his far arm swinging forward and his near arm swinging back, relaxed, {SIDE}'),
    ('walk-pass', f'walking forward, passing position, one leg straight under him and the other knee lifted as it swings through, arms relaxed at his sides, {SIDE}'),
    ('jump-crouch', f'crouching low to jump, knees deeply bent, both arms swung back behind him, leaning forward, {SIDE}'),
    ('jump-spring', f'springing up into a jump, legs pushing off fully straight, both arms swinging forward and up over his head, body stretched tall, {SIDE}'),
    ('jump-fall', f'falling down through the air, both arms raised up and out to the sides for balance, legs reaching down for the landing, {SIDE}'),
]
for name, pose in JOBS:
    for seed in (42, 7):
        t1 = time.time()
        img = pipe(prompt=f'pokeysloth, {pose}, painted storybook illustration, plain grey background', negative_prompt='tree, pole, rope, vine, branch, scenery, extra limbs, front view',
                   width=1024, height=1024, num_inference_steps=30, true_cfg_scale=4.0,
                   generator=torch.Generator('cuda').manual_seed(seed)).images[0]
        buf = io.BytesIO(); img.save(buf, 'PNG')
        api.upload_file(path_or_fileobj=buf.getvalue(), path_in_repo=f'keys/{name}-{seed}.png', repo_id='mshaffe111/pokey-qwen-lora')
        print('DONE', name, seed, round(time.time() - t1), flush=True)
print('ALL_DONE', round(time.time() - t0), flush=True)
