import glob, json

a=glob.glob("modules/*.json")
b=[]
for i in a:
    f=open(i,'r')
    b.append(json.loads(f.read()))
    f.close()
f=open('meta','w')
f.write(json.dumps(b))
f.close()
