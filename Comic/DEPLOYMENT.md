# Backend deployment — Azure Container Apps

The backend runs as the Container App **`backend-comicreadersite`** in resource
group **`WebMySQL`**, image pulled from **`comicreadersite.azurecr.io/backend`**.

`.github/workflows/azure-container-webapp.yml` is the only workflow that deploys.
On push to `main` it builds both images, pushes them to ACR, rolls the Container
App onto the new `:<sha>` tag, and fails the run if the revision does not come up.

## Credentials are runtime env vars, not build-args

`Comic/Dockerfile` declares **no** secret `ARG`/`ENV`. Everything comes from the
container's environment at startup:

- `SMTP_*` and `AZURE_BLOB_*` are read directly via `System.getenv`
  (`reader.site.Comic.util.EnvConfig`).
- `DB_URL` / `DB_USER` / `DB_PASSWORD` are additionally mapped into JVM system
  properties by `$CATALINA_HOME/bin/setenv.sh`, which the Dockerfile generates and
  `catalina.sh` sources at startup. `persistence.xml` resolves `${DB_URL}` etc.
  from those system properties.

`EnvConfig.require()` rejects null **and** blank, so a missing value fails loudly
at startup rather than half-working.

## One-time setup: store the secrets

Fill in the real values (same ones currently in the GitHub `ACR_NAME` environment)
and run once. Values are never echoed and never enter an image layer.

```bash
RG=WebMySQL
APP=backend-comicreadersite

az containerapp secret set -n "$APP" -g "$RG" --secrets \
  db-url="jdbc:mysql://YOUR_SERVER.mysql.database.azure.com:3306/ComicDB?useSSL=true&requireSSL=true&serverTimezone=UTC" \
  db-user="YOUR_DB_USER" \
  db-password="YOUR_DB_PASSWORD" \
  smtp-username="YOUR_ACCOUNT@gmail.com" \
  smtp-app-password="YOUR_GMAIL_APP_PASSWORD" \
  azure-blob-connection-string="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=..."
```

Then bind them to env var names and set the non-secret config:

```bash
az containerapp update -n "$APP" -g "$RG" --set-env-vars \
  DB_URL=secretref:db-url \
  DB_USER=secretref:db-user \
  DB_PASSWORD=secretref:db-password \
  SMTP_USERNAME=secretref:smtp-username \
  SMTP_APP_PASSWORD=secretref:smtp-app-password \
  AZURE_BLOB_CONNECTION_STRING=secretref:azure-blob-connection-string \
  AZURE_BLOB_CONTAINER=temp \
  ALLOWED_ORIGINS=https://comicreadersite.azurewebsites.net,http://localhost:3000 \
  APP_BASE_URL=https://comicreadersite.azurewebsites.net \
  BACKEND_BASE_URL=https://backend-comicreadersite.wonderfulbay-fb92c756.eastasia.azurecontainerapps.io/Comic/api
```

The three URL variables, and why they differ:

| Variable | Points at | Consumed by | Format |
|---|---|---|---|
| `ALLOWED_ORIGINS` | frontend | `CorsFilter` CORS allow-list | comma-separated `scheme://host[:port]`, exact match on the browser `Origin` header — no path, no trailing slash |
| `APP_BASE_URL` | frontend | password-reset links in email | single origin, no trailing slash (`+ "/reset-password?token="`) |
| `BACKEND_BASE_URL` | backend | activation links in email | includes the `/Comic/api` context path, no trailing slash (`+ "/auth/activate?token="`) |

`ALLOWED_ORIGINS` may include `http://localhost:3000` for local dev; `APP_BASE_URL` must not, since it is what real users click in their inbox.

Notes:

- `--set-env-vars` adds/updates the names you pass and leaves any others in place,
  so it is safe to re-run for a single variable. `--replace-env-vars` is the
  destructive one — it drops every variable you did not list.
- `DB_URL` contains `&`. Quote it, as above, or the shell will background the command.
- `ALLOWED_ORIGINS` must have no trailing slash (see `EnvConfig.allowedOrigins`).

## One-time fix: the image reference

The Container App currently points at
`comicreadersite.azurecr.io/backend-comicreadersite:<sha>`, a repository that does
not exist in the registry (ACR only has `backend` and `frontend`). That is why the
active revision is `ActivationFailed` with 0 replicas. The next workflow run
repoints it at `backend:<sha>` automatically; to fix it immediately:

```bash
az containerapp update -n backend-comicreadersite -g WebMySQL \
  --image comicreadersite.azurecr.io/backend:latest
```

Do this **after** setting the secrets above, otherwise the new revision fails
startup on the first `EnvConfig.require` call.

## Verifying

```bash
# Env vars actually present in the running container
az containerapp exec -n backend-comicreadersite -g WebMySQL \
  --command "sh -c 'env | grep -E \"^(DB_|SMTP_|AZURE_BLOB)\" | cut -d= -f1'"

# Revision health
az containerapp revision list -n backend-comicreadersite -g WebMySQL \
  --query "[].{name:name,active:properties.active,running:properties.runningState}" -o table

# Startup logs
az containerapp logs show -n backend-comicreadersite -g WebMySQL --tail 100

# App responds (WAR deploys under the /Comic context path)
curl -i https://backend-comicreadersite.wonderfulbay-fb92c756.eastasia.azurecontainerapps.io/Comic/
```

## Troubleshooting

Read the platform events first — they distinguish "never started" from "started and
crashed", which the application logs cannot:

```bash
az containerapp logs show -n backend-comicreadersite -g WebMySQL --type system --tail 40
```

| Symptom | Cause |
|---|---|
| `terminated with exit code '127'` | Command not found — the image's `CMD` is broken before any Java runs. Usually a CRLF line ending in the Dockerfile making the JSON exec-form array unparseable. Env vars are irrelevant here; rebuild the image. |
| `ActivationFailed`, no `PulledImage` event | The image tag does not exist in ACR. Check `az acr repository show-tags -n comicreadersite --repository backend`. |
| `IllegalStateException: Required environment variable 'X' is not set` | The app started but `X` is missing or blank. Check the `secretRef` wiring. |
| Tomcat starts, then `Communications link failure` | Env vars resolved fine; the DB is unreachable. Check the MySQL firewall allows the Container App outbound IPs. |
| CORS errors in the browser despite `ALLOWED_ORIGINS` being set | `CorsFilter.ALLOWED_ORIGINS` is a `static final` read once at class load, and the value must match the `Origin` header byte for byte — check for a trailing slash. |

Do not put a **space** in `DB_URL`, `DB_USER`, or `DB_PASSWORD`. They are passed via
`JAVA_OPTS`, which `catalina.sh` word-splits, so a space prevents Tomcat from
starting at all. Other punctuation (`@ ; = ! $ " \ &`) is fine, and
`SMTP_APP_PASSWORD` may contain spaces — it is read only via `System.getenv`, so a
Gmail app password can be pasted exactly as shown.

## Local runs

```bash
docker build -t comic-backend ./Comic
docker run --rm -p 8080:8080 --env-file ./Comic/.env comic-backend
```

`Comic/.env` is git-ignored; copy `Comic/.env.example` and fill it in.
