import fcntl, html, json, os, pathlib, re, time
root=pathlib.Path.home()
cfg=root/'.config/siteplat'
lock=(cfg/'private-publish.lock').open('a')
fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
paths=[cfg/'private-apps.json',root/'your-tax-story/deployment/sites.json',root/'your-tax-story/deployment/index/index.html']
original={p:p.read_text() for p in paths}
backup=cfg/('lecompteestbon-directory-before-'+time.strftime('%Y%m%dT%H%M%SZ',time.gmtime()))
backup.mkdir()
for p,s in original.items():(backup/p.name).write_text(s)
entry={'name':'Le Compte est Bon','url':'https://lecompteestbon.wissamkazan.ai/','description':'A free numbers game in French and English, with four grade levels, hints and timed challenges. Public access; no sign-in required.'}
inventory=json.loads(original[paths[0]])
existing=[a for a in inventory['apps'] if a['url']!=entry['url']]
inventory['apps']=[entry]+existing
page=original[paths[2]]
if entry['url'] not in page:
    card='<a class="card" href="'+entry['url']+'"><div class="card-top"><span class="icon">+÷</span><span class="arrow">↗</span></div><h3>'+html.escape(entry['name'])+'</h3><p>'+html.escape(entry['description'])+'</p><span class="address">lecompteestbon.wissamkazan.ai</span></a>'
    assert '<div class="grid">' in page
    page=page.replace('<div class="grid">','<div class="grid">'+card,1)
    page,n=re.subn(r'(<span class="count">)(\d+)( (?:sites|subdomains)</span>)',lambda m:m[1]+str(int(m[2])+1)+m[3],page,count=1)
    assert n==1,'Expected site count not found'
assert page.count('href="'+entry['url']+'"')==1
before_links=set(re.findall(r'href="([^"]+)"',original[paths[2]]))
assert before_links <= set(re.findall(r'href="([^"]+)"',page))
desired={paths[0]:json.dumps(inventory,indent=2)+'\n',paths[1]:json.dumps(inventory,indent=2)+'\n',paths[2]:page}
def write(p,s):
    tmp=p.with_name(p.name+'.game.tmp');tmp.write_text(s);os.replace(tmp,p)
try:
    for p,s in desired.items():write(p,s)
    assert json.loads(paths[0].read_text())==json.loads(paths[1].read_text())
    assert len(inventory['apps'])==len(existing)+1
except Exception:
    for p,s in original.items():write(p,s)
    raise
print(json.dumps({'inventory_count':len(inventory['apps']),'game_links':1,'old_links_preserved':True,'backup':str(backup)}))
