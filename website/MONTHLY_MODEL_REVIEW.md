# Monthly free-model maintenance

Run on the first day of each month at 11:17 Asia/Shanghai, linked to the existing public Site

1. Open the existing Sites source repository using the current Sites skill and project ID in `.openai/hosting.json`, acquire a fresh repo-scoped credential through the native tool, never reuse local secret files
2. Read official OpenRouter free-model pricing and AI Horde model registry / availability, compare newly available genuinely free candidates for code help and top-down RTS pixel art
3. Run `node scripts/update-models.cjs` to refresh public metadata, no API keys needed, preserve last-good data on failure
4. New image presets must have verified sampler, step and CFG requirements, new text choices must pass the zero-pricing gate, do not use metered models merely because they have a trial credit
5. Keep the model rationale honest, describe the site's recommendation rather than asserting an absolute global best
6. Run `node tests/verify-studio.cjs`, publish through Sites without changing the public audience, read back the deployed ai-models.json
7. Synchronize changed maintenance files to `website/` in `cryingman520/Rusted-Warfare-Verified-Code`, preserving every other existing file and concurrent changes, use the connected GitHub Git-data tools if command-line credentials are unavailable
8. Report what changed and any service outage, never enter payment details, upgrade a service, store keys in Git or download models

The source revision includes this complete procedure so a fresh cloud task can operate without the original local workspace

Public data sources
- https://openrouter.ai/api/v1/models
- https://openrouter.ai/pricing
- https://aihorde.net/api/v2/status/models?type=image
- https://github.com/Haidra-Org/AI-Horde-image-model-reference

Windows portable packaging note: if the Sites helper pushes successfully but archive packaging fails because bash is unavailable, verify the pushed commit via the open-only helper, stage dist with the bundled prepare-site-build.cjs, and use native tar to package the verified static output, do not claim publication until Sites reports success
