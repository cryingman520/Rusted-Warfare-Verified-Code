# Noaushio cloud downloads

Cloud-hosted public downloads backed by Sites and R2 object storage

The upload client runs on the owner's Windows account and watches the first level of the configured shared folder

New and changed files are uploaded after a short write-stability delay, matching hashes are skipped, local deletions do not delete cloud files

Hidden/system files, reparse points, management scripts and credential file extensions are excluded

Each upload is split into 8 MiB parts, old content objects are retained while the public catalog points to the latest completed version

The backend requires the secret UPLOAD_TOKEN for every write, public visitors have read access only

The local upload token is protected with Windows DPAPI for the current user, no secret is included in source or downloadable applications

Build the backend with scripts/build-portable.cjs, publish the dist/server/index.js Worker with the R2 binding BUCKET

Build the Windows client with dotnet publish uploader/CloudUploader.csproj -c Release

The application can run once with --once, upload one explicit file with --upload PATH, or remain in the system tray for automatic synchronization
