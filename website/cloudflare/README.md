# Cloudflare Pages publication

The public hostname is `rwmod.noaushio.uk` and the Pages project is `noaushio-rwmod-public`

The existing Sites project remains `appgprj_6ad4f111d85881918fc885977b0b716f`, with its source repository and generated origin retained

## Build and publish

1. Commit the website source and generated `dist` assets
2. Run `node scripts/build-cloudflare-pages.cjs`
3. Upload `../rwmod-cloudflare-pages.zip` to the existing Pages project as a production deployment
4. Confirm the deployment and check the public verification endpoint

Use the ZIP produced by the script, which excludes hidden hosting metadata and records the source commit in `build-info.json`

The `_worker.js` route returns the Baidu verification file without an HTML extension redirect and supplies English homepage metadata for `?lang=en`

`_routes.json` limits function execution to the homepage, its index alias and the verification endpoint, other files are served as static assets

The DNS credential and any rollback records stay outside this checkout, no credentials belong in the deployment ZIP or GitHub source

Before updating public website content, publish both the retained Sites version and the Pages production deployment from the same source state
