import json, urllib.request, urllib.parse, pathlib, tomllib
root = pathlib.Path.home() / '.config/siteplat'
cfg = tomllib.loads((root / 'sites.toml').read_text())['cloudflare']
token = pathlib.Path(cfg['token_file']).expanduser().read_text().strip()
account = cfg['account_id']
def get(path):
    req = urllib.request.Request('https://api.cloudflare.com/client/v4' + path, headers={'Authorization': 'Bearer ' + token})
    with urllib.request.urlopen(req, timeout=20) as res: result = json.load(res)
    assert result['success']
    return result['result']
tunnels = get('/accounts/' + account + '/cfd_tunnel?is_deleted=false&name=' + cfg['tunnel_name'])
for t in tunnels:
    print('TUNNEL', t['id'], t['name'])
    data = get('/accounts/' + account + '/cfd_tunnel/' + t['id'] + '/configurations')
    print('INGRESS', json.dumps(data['config']))
zone = (root / 'taxdemo-zone-id').read_text().strip()
print('ZONE', get('/zones/' + zone)['name'])
print('GAME DNS', json.dumps(get('/zones/' + zone + '/dns_records?name=lecompteestbon.wissamkazan.ai')))
for app in get('/accounts/' + account + '/access/apps?per_page=100'):
    print('ACCESS', app['id'], app.get('domain'), app.get('type'))
    if app.get('domain') in ['*.wissamkazan.ai', 'myself.wissamkazan.ai']:
        policies = get('/accounts/' + account + '/access/apps/' + app['id'] + '/policies')
        print('POLICY ACTIONS', [(p['name'], p['decision']) for p in policies])
