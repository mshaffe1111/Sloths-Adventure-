# PUSHBACK (ART, t-art-1113), 10:17 AM ET: blocked on Hugging Face access
- This session runs on the Default environment: huggingface.co is refused by the proxy (CONNECT 403), no HF_TOKEN, no hf CLI.
- No Hugging Face connector tools are loaded here (hf-art.md step 1 and 7 need one: jobs + hf_fs attach). Two MCP servers in this
  session need authorization (ccefee7b-..., d05f3170-...); one is likely the HF connector.
- The "Hugging Face" environment (env_01XHDWWRRuUac8x7qDbVLwZz) allows huggingface.co, but a session made by another session cannot
  switch environments (get_environment: switchable_by_you false).
- Ask: relaunch ART on the Hugging Face environment with the HF connector authorized, or have Matt authorize the connector here.
- Meanwhile (no spend): I build the img2img starts and specs for all three sets and push them, so jobs launch the minute access exists.
