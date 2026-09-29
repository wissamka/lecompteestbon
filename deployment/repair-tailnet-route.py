"""Run on the VPS: add only the game's missing Caddy route, with rollback."""
from pathlib import Path
from datetime import datetime, timezone
import fcntl
import subprocess

HOST = 'lecompteestbon.wissamkazan.ai'
CONFIG = Path.home() / '.config/siteplat'
SOURCE = CONFIG / 'private-routes.caddy'
DEST = 'fle-caddy:/config/siteplat-private/routes.caddy'

def run(*args):
    subprocess.run(args, check=True, capture_output=True, text=True)

def reload_routes():
    run('docker', 'cp', str(SOURCE), DEST)
    run('docker', 'exec', 'fle-caddy', 'caddy', 'validate', '--config', '/etc/caddy/Caddyfile', '--adapter', 'caddyfile')
    run('docker', 'exec', 'fle-caddy', 'caddy', 'reload', '--config', '/etc/caddy/Caddyfile', '--adapter', 'caddyfile')

with (CONFIG / 'private-publish.lock').open('a') as lock:
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    before = SOURCE.read_text()
    if f'@lecompteestbon host {HOST}' in before:
        raise SystemExit('Game route already exists; inspect before changing it.')
    anchor = '\n\t@resume host resume.wissamkazan.ai'
    assert before.count(anchor) == 1
    block = f'\n\t@lecompteestbon host {HOST}\n\thandle @lecompteestbon {{\n\t\treverse_proxy 127.0.0.1:18087\n\t}}\n'
    updated = before.replace(anchor, block + anchor, 1)
    http = 'http://resume.wissamkazan.ai:8084,'
    assert updated.count(http) == 1
    updated = updated.replace(http, f'http://{HOST}:8084, ' + http, 1)
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    backup = CONFIG / f'private-routes.before-lecompteestbon-{stamp}.caddy'
    backup.write_text(before)
    try:
        SOURCE.write_text(updated)
        reload_routes()
        result = subprocess.check_output(['curl', '-fsS', '--max-time', '10', '--resolve', f'{HOST}:8443:127.0.0.1', f'https://{HOST}:8443/'], text=True)
        assert 'src/app.js' in result or 'app.js' in result, 'Unexpected page returned'
    except Exception:
        # Validate the route separately below; restore immediately on any failure.
        SOURCE.write_text(before)
        reload_routes()
        raise
    print(f'Added HTTPS game route and HTTP redirect. Backup: {backup}')
