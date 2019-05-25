import glob, json
g=glob.glob("modules/*.json")
for item in g:
    f=open(item,"r",encoding="utf-8-sig")
    j=json.loads(f.read())
    f.close()
    if j["state"]=="notExaminded":
        j["state"]="unknown"
        f=open(item,"w",encoding="utf-8-sig")
        f.write(json.dumps(j,indent=2))
        f.close()
        
