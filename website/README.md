# 铁锈战争模组工坊 / Rusted Warfare Mod Workshop

铁锈战争模组爱好者的天堂

Live site: https://rwmod.noaushio.uk

## Included

- Bilingual Chinese / English website with original Android 1.15 references
- Unit INI editor, 23 modules, 984 fields and Blockly action logic
- Map trigger editor, preserving imported TMX layers and references
- Separate unit pixel editor and map tile image editor, with PNG, sprite sheets, layers, frames, undo and editable projects
- Free cloud image generation / image-to-image via AI Horde, and zero-priced OpenRouter chat with retrieval from 1212 reference and lesson records
- 18 new practical chapters across beginner, intermediate and mastery paths, 6 complete original tutorial packs, plus 8 original guides
- Select individual comments during mod export, remember the choice or restore the prompt in Settings

## Run locally

Requires Node.js 20 or later, no dependency installation and no local AI models

```sh
node scripts/serve.cjs
```

Open http://127.0.0.1:4173

```sh
node tests/verify-studio.cjs
node scripts/build-tutorial-packs.cjs
node scripts/update-models.cjs
```

`dist/` is the complete static site, `.openai/hosting.json` identifies the existing Sites project

## Free AI setup

Use Settings on the site to save an OpenRouter key and optionally an AI Horde key for the current tab session

- OpenRouter https://openrouter.ai/settings/keys — no account funding required, only `:free` models with every pricing field equal to zero are eligible, a zero-price provider cap is also sent
- AI Horde https://aihorde.net/register — volunteer cloud service, no model downloads or required payment, private-key requests set `shared:false`, anonymous use is an explicit checkbox with the public-sharing disclosure
- Keys are never shipped in source, model metadata, lesson downloads, project JSON or GitHub
- Free quotas, worker availability and queues apply, errors never cause a paid-model fallback
- Generated art is a draft, edit its viewpoint, dimensions, palette and transparency before using it in game

## Monthly model review

`scripts/update-models.cjs` reads public provider catalogs and updates `dist/ai-models.json`, retaining the last-good file on failure

Text selection checks actual zero pricing and favors code-oriented candidates, image selection keeps reviewed presets with compatible inference parameters and prioritizes online workers, it does not claim a universal best model

The connected Sites monthly task also reviews official model documentation and may add better genuinely free candidates after checking compatibility

## Data and validation

Browser drafts are local, export backups before clearing browser data

Tutorial code and assets are statically checked, they have not been run inside the game engine, each pack includes a reproducible in-game checklist

Original handbooks and imported code are retained verbatim, interface Chinese avoids unnecessary full stops

See `THIRD_PARTY.md` for references and licenses, original tutorial packs include their own CC0 notices
