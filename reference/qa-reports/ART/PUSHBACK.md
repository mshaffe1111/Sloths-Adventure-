# PUSHBACK (ART, t-art-1113), 10:17 AM ET: blocked on Hugging Face access
- This session runs on the Default environment: huggingface.co is refused by the proxy (CONNECT 403), no HF_TOKEN, no hf CLI.
- No Hugging Face connector tools are loaded here (hf-art.md step 1 and 7 need one: jobs + hf_fs attach). Two MCP servers in this
  session need authorization (ccefee7b-..., d05f3170-...); one is likely the HF connector.
- The "Hugging Face" environment (env_01XHDWWRRuUac8x7qDbVLwZz) allows huggingface.co, but a session made by another session cannot
  switch environments (get_environment: switchable_by_you false).
- Ask: relaunch ART on the Hugging Face environment with the HF connector authorized, or have Matt authorize the connector here.
- Meanwhile (no spend): I build the img2img starts and specs for all three sets and push them, so jobs launch the minute access exists.

## WIP handover, 10:20 AM ET (stopped on the lead's word; no starts or specs committed, no HF spend)
- Climb sources found: hero-standard.webp frames 'launch' and 'spring_rise' (front, arms in a V), 'cheer_b' (arms out), 'turn'
  (front body, satchel). heroStandardData.ts holds the boxes (~127x209 px; upscale before img2img).
- Idea for the next ART session: paste-ups on magenta with each arm rotated about its shoulder (A: left high/right low, B: level,
  C: right high/left low; never mirror, the satchel side must stay), vines painted leaf green in the start and keyed out of the result
  inside known vertical bands (Pokey has no green), plus per-frame grip points so the engine draws its two vines behind his paws.
- Spec format to copy: tools/art/hflist1/make_specs.py (starts must live in reference/, tools/ ignores pictures).
- Open: the pair room's vine spacing (F15's branch, not on main) sets how wide his arms go; check it before building starts.
