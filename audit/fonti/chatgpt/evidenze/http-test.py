from pathlib import Path
import http.client,json
root=Path('/tmp/oneassist-audit/repo/Archivio/users')
(root/'audit_sibling').mkdir(exist_ok=True)
(root/'audit_sibling/probe.txt').write_text('SYNTHETIC_SIBLING_DATA')
out=[]
def req(method,path,body=None):
 c=http.client.HTTPConnection('127.0.0.1',5179,timeout=10)
 c.request(method,path,body=json.dumps(body) if body else None,headers={'Content-Type':'application/json'})
 r=c.getresponse();b=r.read().decode(errors='replace');c.close()
 out.append({'method':method,'path':path,'status':r.status,'type':r.getheader('content-type'),'body':b[:180]})
req('GET','/archivio/user_123/../audit_sibling/probe.txt')
req('POST','/archivio/user_123/memory',{'percorso':'../services/audit-probe.md','testo':'SYNTHETIC_OUTSIDE_MEMORY'})
req('POST','/archivio/user_123/memory',{'percorso':'../../audit_sibling/audit-probe.md','testo':'SYNTHETIC_OTHER_USER_WRITE'})
req('GET','/media/suoni/notifica.mp3')
req('GET','/archivio/system-storage/campanello.mp3')
req('GET','/Archivio/users/audit_sibling/probe.txt')
req('POST','/chat-raw',{'timestamp':'2026-09-22T10:00:01Z','role':'user','text':'SYNTHETIC_AUDIT_LATER'})
req('POST','/chat-raw',{'timestamp':'2026-09-22T10:00:00Z','role':'assistant','text':'SYNTHETIC_AUDIT_EARLIER'})
print(json.dumps(out,indent=2));print('writes_verified', (root/'user_123/services/audit-probe.md').exists(),(root/'audit_sibling/audit-probe.md').exists())
