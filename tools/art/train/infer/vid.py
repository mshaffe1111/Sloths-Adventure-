import os, io, time, torch
import numpy as np
from PIL import Image
from huggingface_hub import hf_hub_download, HfApi
from diffusers import WanImageToVideoPipeline
import zipfile
tok = os.environ['HF_TOKEN']; api = HfApi(token=tok)
t0 = time.time()
pipe = WanImageToVideoPipeline.from_pretrained('Wan-AI/Wan2.2-I2V-A14B-Diffusers', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)
NEG = 'camera movement, zoom, pan, background change, scenery, extra limbs, extra characters, human hands, fingers, blurry, deformed, text, watermark, flicker, morphing'
def grey(path):
    im = Image.open(path).convert('RGBA')
    bg = Image.new('RGBA', im.size, (128, 128, 128, 255)); bg.alpha_composite(im)
    im = bg.convert('RGB')
    # pad to a square on grey, then 704 x 704
    s = max(im.size); c = Image.new('RGB', (s, s), (128, 128, 128)); c.paste(im, ((s - im.width) // 2, (s - im.height) // 2))
    return c.resize((704, 704), Image.LANCZOS)
CLIPS = [
    ('idle-yawn', 'inputs/pokey-standing.png', 'The cartoon sloth stands still, then gives a big slow sleepy yawn, mouth opening wide and eyes squeezing shut, stretching both arms high above his head, then slowly lowers his arms and smiles sleepily. He stays in the same spot. Static camera, flat plain grey background, smooth gentle motion, painted storybook cartoon.'),
    ('hang-sway', 'tests/04-upside-down.png', 'The cartoon sloth hangs upside down from the branch by all four paws and sways gently back and forth, slowly turning his head, blinking and smiling. The branch stays still. Static camera, flat plain grey background, smooth gentle motion, painted storybook cartoon.'),
    ('push-log', 'tests/06-push-log.png', 'The cartoon sloth pushes the heavy log to the right, straining and leaning into it, taking slow steps, the log sliding along. Static camera, flat plain grey background, smooth motion, painted storybook cartoon.'),
]
for name, src, prompt in CLIPS:
    t1 = time.time()
    img = grey(hf_hub_download('mshaffe111/pokey-qwen-lora', src, token=tok))
    frames = pipe(image=img, prompt=prompt, negative_prompt=NEG, height=704, width=704, num_frames=49, guidance_scale=3.5,
                  num_inference_steps=30, generator=torch.Generator('cuda').manual_seed(7)).frames[0]
    # the frames themselves (what the game needs), plus a looping GIF to look at
    pil = [f if isinstance(f, Image.Image) else Image.fromarray((np.asarray(f) * 255).clip(0, 255).astype(np.uint8)) for f in frames]
    with zipfile.ZipFile(f'/tmp/{name}.zip', 'w') as z:
        for k, f in enumerate(pil):
            b = io.BytesIO(); f.save(b, 'PNG'); z.writestr(f'{name}_{k:03d}.png', b.getvalue())
    pil[0].save(f'/tmp/{name}.gif', save_all=True, append_images=pil[1:], duration=62, loop=0)
    api.upload_file(path_or_fileobj=f'/tmp/{name}.zip', path_in_repo=f'videos/{name}.zip', repo_id='mshaffe111/pokey-qwen-lora')
    api.upload_file(path_or_fileobj=f'/tmp/{name}.gif', path_in_repo=f'videos/{name}.gif', repo_id='mshaffe111/pokey-qwen-lora')
    print('DONE', name, round(time.time() - t1), flush=True)
print('ALL_DONE', round(time.time() - t0), flush=True)
