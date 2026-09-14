"""Run on the VPS after transferring dist and nginx.conf to the isolated staging directory.

Initial public publication only. Changes are restricted to the selected game,
plus its explicit registration in the existing sharing manager. No secrets are logged.
"""
import ast, copy, fcntl, importlib, json, os, pathlib, shutil, socket, subprocess, sys, time, tomllib, urllib.request, urllib.parse
HOME = pathlib.Path.home()
HOST = 'lecompteestbon.wissamkazan.ai'
KEY = 'lecompteestbon'
PORT = 18087
ROOT = HOME / 'public-sites' / KEY
STAGE = ROOT / 'staging'
CFG = HOME / '.config/siteplat'
LIB = HOME / '.local/lib/siteplat'
assert socket.gethostname() == 'srv1563996'
assert (STAGE/'site/index.html').is_file() and (STAGE/'nginx.conf').is_file()
assert not ROOT.joinpath('site').exists(), 'Existing release requires update workflow, not initial publication'
assert not (CFG/'sharing-request.json').exists(), 'Sharing request in progress'
for lock_name in ['private-publish.lock','sharing.lock']:
    handle = (CFG/lock_name).open('a')
    fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
    globals()[lock_name] = handle
cfg = tomllib.loads((CFG/'sites.toml').read_text())['cloudflare']
token = pathlib.Path(cfg['token_file']).expanduser().read_text().strip()
account = cfg['account_id']
def api(method, path, data=None):
    headers = {'Authorization':'Bearer '+token,'Content-Type':'application/json'}
    req = urllib.request.Request('https://api.cloudflare.com/client/v4'+path, data=None if data is None else json.dumps(data).encode(), headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as response: body=json.load(response)
    if not body.get('success'): raise RuntimeError('Cloudflare operation failed')
    return body['result']
def rows(path):
    out=[]
    for page in range(1,101):
        data=api('GET',path+('&' if '?' in path else '?')+f'per_page=100&page={page}')
        out.extend(data)
        if len(data)<100:return out
    raise RuntimeError('Pagination limit')
def atomic(path, text):
    temp=path.with_name(path.name+'.lecompteestbon.tmp')
    temp.write_text(text)
    os.replace(temp,path)
def run(args):
    return subprocess.run(args,check=True,capture_output=True,text=True).stdout.strip()
zone=(CFG/'taxdemo-zone-id').read_text().strip()
assert api('GET','/zones/'+zone)['name']=='wissamkazan.ai'
tunnels=rows(f'/accounts/{account}/cfd_tunnel?name='+cfg['tunnel_name']+'&is_deleted=false')
tunnel=next(t for t in tunnels if t['name']==cfg['tunnel_name'])
tunnel_path=f'/accounts/{account}/cfd_tunnel/{tunnel["id"]}/configurations'
before_tunnel=api('GET',tunnel_path)['config']
assert before_tunnel['ingress'][-1]=={'service':'http_status:404'}
assert not any(r.get('hostname')==HOST for r in before_tunnel['ingress'])
assert not rows(f'/zones/{zone}/dns_records?name={HOST}'), 'Hostname already has records'
assert not any(a.get('domain')==HOST for a in rows(f'/accounts/{account}/access/apps')), 'Hostname has an existing Access app'
with socket.socket() as probe: probe.bind(('127.0.0.1',PORT))
assert KEY not in run(['docker','ps','-a','--format','{{.Names}}']).splitlines()
backup=CFG/('lecompteestbon-before-'+time.strftime('%Y%m%dT%H%M%SZ',time.gmtime()))
backup.mkdir()
(backup/'tunnel.json').write_text(json.dumps(before_tunnel,indent=2))
source_paths=[LIB/'platform_lib/site_sharing.py',HOME/'siteplat-src/platform_lib/site_sharing.py']
paths=source_paths+[CFG/'sharing-settings.json',CFG/'sharing-applied.json']
original={p:p.read_text() for p in paths}
for i,(p,s) in enumerate(original.items()): (backup/f'{i}-{p.name}').write_text(s)
(backup/'paths.json').write_text(json.dumps([str(p) for p in paths]))
created_app=None;created_dns=None;container=False;tunnel_changed=False;files_changed=False
try:
    ROOT.mkdir(parents=True,exist_ok=True)
    shutil.copytree(STAGE/'site',ROOT/'site')
    shutil.copyfile(STAGE/'nginx.conf',ROOT/'nginx.conf')
    image=run(['docker','image','inspect','nginx:alpine','--format','{{index .RepoDigests 0}}'])
    run(['docker','run','-d','--name',KEY,'--restart','unless-stopped','--read-only','--tmpfs','/var/cache/nginx','--tmpfs','/var/run','--security-opt','no-new-privileges:true','-p',f'127.0.0.1:{PORT}:80','-v',str(ROOT/'site')+':/usr/share/nginx/html:ro','-v',str(ROOT/'nginx.conf')+':/etc/nginx/conf.d/default.conf:ro',image])
    container=True
    for attempt in range(20):
        try:
            with urllib.request.urlopen(f'http://127.0.0.1:{PORT}/',timeout=2) as response:
                assert b'Le Compte est Bon' in response.read()
            break
        except Exception:
            if attempt==19:raise
            time.sleep(.25)
    # Register the single game in the installed and retained source snapshots.
    files_changed=True
    for p in source_paths:
        s=original[p]
        assert "CATALOG = {\n" in s and s.count("('myself', 'apex')")==1 and s.count("('myself','apex')")==1
        s=s.replace("CATALOG = {\n", "CATALOG = {\n    'lecompteestbon': ('Le Compte est Bon', 'lecompteestbon.wissamkazan.ai', 18087),\n",1)
        s=s.replace("('myself', 'apex')", "('myself', 'apex', 'lecompteestbon')").replace("('myself','apex')", "('myself','apex','lecompteestbon')")
        s=s.replace('Only the branded page and main-domain redirect can be public without a login.','Only explicitly approved public websites can be public without a login.')
        ast.parse(s)
        atomic(p,s)
    files_changed=True
    for p in paths[2:]:
        value=json.loads(original[p]);settings=value['settings'] if p.name=='sharing-applied.json' else value
        settings['modes'][KEY]='public';settings['site_emails'][KEY]=[]
        atomic(p,json.dumps(value,indent=2)+'\n')
    sys.path.insert(0,str(LIB))
    from platform_lib import config, site_sharing, cloudflare
    c=config.load(CFG/'sites.toml')
    state=json.loads((CFG/'sharing-applied.json').read_text())
    site_sharing.validate(state['settings'])
    generated=cloudflare.build_ingress_for_config(c)
    old=[r for r in generated if r.get('hostname')!=HOST]
    assert old==before_tunnel['ingress'], 'Registration changed unrelated routing'
    entry=next(r for r in generated if r.get('hostname')==HOST)
    assert entry['service']==f'http://127.0.0.1:{PORT}' and 'access' not in entry.get('originRequest',{})
    app_body={'name':'VPS sharing: '+KEY,'type':'self_hosted','domain':HOST,'session_duration':'24h','app_launcher_visible':False,'policies':[{'name':'Public numbers game','decision':'bypass','include':[{'everyone':{}}]}]}
    created_app=api('POST',f'/accounts/{account}/access/apps',app_body)['id']
    actual=api('GET',f'/accounts/{account}/access/apps/{created_app}')
    assert actual['domain']==HOST and len(actual['policies'])==1 and actual['policies'][0]['decision']=='bypass'
    assert actual['policies'][0]['include']==[{'everyone':{}}]
    # Recheck remote shared state immediately before updating it under both locks.
    assert api('GET',tunnel_path)['config']==before_tunnel, 'Tunnel changed concurrently'
    api('PUT',tunnel_path,{'config':{**before_tunnel,'ingress':generated}})
    tunnel_changed=True
    created_dns=api('POST',f'/zones/{zone}/dns_records',{'type':'CNAME','name':HOST,'content':tunnel['id']+'.cfargotunnel.com','proxied':True,'ttl':1,'comment':'Public Le Compte est Bon game; user-authorized no-login access'})['id']
    assert api('GET',tunnel_path)['config']['ingress']==generated
    dns=api('GET',f'/zones/{zone}/dns_records/{created_dns}')
    assert dns['proxied'] and dns['content']==tunnel['id']+'.cfargotunnel.com'
    run(['systemctl','--user','restart','siteplat-poller.service'])
    assert run(['systemctl','--user','is-active','siteplat-poller.service'])=='active'
    record={'hostname':HOST,'port':PORT,'image':image,'container':KEY,'tunnel_id':tunnel['id'],'dns_id':created_dns,'access_id':created_app,'backup':str(backup),'verified_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'public':True}
    (ROOT/'deployment.json').write_text(json.dumps(record,indent=2)+'\n')
    print(json.dumps(record))
except Exception:
    # Locks remain held; roll back only this run's game route and resources.
    if tunnel_changed:
        current=api('GET',tunnel_path)['config']
        api('PUT',tunnel_path,{'config':{**current,'ingress':[r for r in current['ingress'] if r.get('hostname')!=HOST]}})
    if created_dns:api('DELETE',f'/zones/{zone}/dns_records/{created_dns}')
    if created_app:api('DELETE',f'/accounts/{account}/access/apps/{created_app}')
    if files_changed:
        for p,s in original.items():atomic(p,s)
        run(['systemctl','--user','restart','siteplat-poller.service'])
    if container:run(['docker','stop',KEY])
    raise
