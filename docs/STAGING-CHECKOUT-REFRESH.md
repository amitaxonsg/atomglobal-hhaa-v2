# Staging checkout refresh

The directory `/srv/head-heart.atomglobal.com/staging-source` is a dedicated disposable staging checkout. Build tools may change file permissions or leave generated files. Refresh it from the approved branch before every Stage 4 run.

```bash
cd /srv/head-heart.atomglobal.com/staging-source

git fetch --prune origin production-readiness-20260719
git checkout production-readiness-20260719
git reset --hard origin/production-readiness-20260719

git status --short
git rev-parse HEAD
```

After the reset, `git status --short` must print nothing.

This affects only the staging checkout. It does not alter:

- `/srv/head-heart.atomglobal.com/source`
- the live release symlink
- the production database
- the public website

Run the Stage 4 script through Bash. Do not change its executable file mode.

```bash
EXPECTED_COMMIT=<approved-commit> \
PORT=18088 \
STAGE_HOST=head-heart-staging.local \
bash deploy/stage4-local.sh
```

Do not create the first owner or deploy to production unless Stage 4 ends with `STAGE 4 LOCAL API AND FRONTEND READY` and the health response is HTTP 200 with `status: ok`.
