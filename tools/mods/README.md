# Mods (Claude Code function-hook plugins) for every session on this repo

Matt, 11-11: save tokens with mods. `output-trim/`: any tool result over 8,000 characters is cut to its first 2,500 and last 1,500;
the full text goes to /tmp/output-trim/<time>-<tool>.txt and the path is shown. Never trims Read, Edit, Write, notifications, web
reads, helper reports or pictures. To load it in a session: copy the folder to ~/.claude/skills/output-trim/ before the session starts
(the cloud environment's setup script does this), or into the session's dev-mods folder.
