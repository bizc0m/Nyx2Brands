// Original local adaptations of the referenced visual directions. No remote
// scripts, images, fonts or complete Pen implementations are bundled.
const rows=[
 ['gestok','YzLBVOp','Glass Dashboard','glass','#151b32','#283451','#f4f7ff','#8de2dd',14,1,8,'dark'],
 ['Conrad-C','eYvWOYY','Glass Orbs','glass','#20183c','#443667','#faf5ff','#b89aff',20,1,12,'dark'],
 ['koljal','oNMvNQY','Glass Finance','glass','#192b30','#29454b','#f3fffc','#69ddbd',12,1,6,'dark'],
 ['SihamBenDaia','PoGvyZJ','Glass Projects','glass','#e5e1f4','#faf8ff','#29213f','#7452b7',18,1,8,'light'],
 ['deseanwu','YzGopOQ','Soft Dashboard','soft','#e4e9ee','#e4e9ee','#273342','#3478b8',16,0,7,'light'],
 ['Ahmed-Shaiea','oNXxGoj','Soft Forms','soft','#e8e1df','#e8e1df','#3f3236','#a34468',20,0,6,'light'],
 ['erjs','jOPMxBN','Neumorphism UI','soft','#e0e5ec','#e0e5ec','#303a4b','#506fad',14,0,9,'light'],
 ['smugller','NWNmxyJ','Skeuomorphic UI Kit','soft','#e9f0f8','#e4ecf6','#33476b','#4267a7',19,1,8,'light'],
 ['rustcode','OPPYgKy','Brutalist Library','brutal','#fafafa','#ffffff','#0a0a0a','#bd8500',0,3,6,'light'],
 ['varsvisualizes','MWLvJjW','Brutalist Activity','brutal','#fce3bd','#fff9ec','#27221d','#a45012',2,2,5,'light'],
 ['themesberg','MWgJPpa','Windows 95 Kit','retro','#008b8b','#c0c0c0','#000000','#000080',0,2,2,'light'],
 ['danielneubert','bGarJpq','Windows Desktop','retro','#b8c4cc','#d4d0c8','#111111','#000080',0,2,3,'light'],
 ['nitronova','WMGgWZ','Cyber Net','neon','#080f12','#111e24','#def9f7','#3de7d3',0,1,6,'dark'],
 ['N3tanyahPDX','emJgpOV','Cyber Interface','neon','#11101a','#201c2d','#fff4cf','#ffcf40',2,2,8,'dark'],
 ['preetha-vaishnavi-the-reactor','azbEryd','Synthwave Blog','neon','#1c1030','#311947','#fff0fc','#ff6cd8',8,1,10,'dark'],
 ['tcsn','qBqEjZe','Dark Wireframe','minimal','#191c24','#262b36','#edf0f6','#a5aec6',4,1,0,'dark'],
 ['eylemsayin','oNQPyvL','Admin Light','minimal','#f6f6fb','#ffffff','#25273d','#6868d7',18,0,5,'light'],
 ['whosajid','dPPLddZ','Adaptive Dashboard','minimal','#edf3f7','#ffffff','#263344','#2868c7',12,1,3,'light'],
 ['lrrp','abGppOb','Midnight Dashboard','minimal','#202132','#2b2c40','#f2f1ff','#ab94ff',8,1,4,'dark'],
 ['adamcjoiner','PJbzPQ','Nano Minimal','minimal','#f4f5f6','#ffffff','#272b32','#23796d',3,1,1,'light']
];
export const codepenReferences=rows.map(([author,id,name,kind,bg,surface,text,accent,radius,border,depth,appearance])=>({id:'codepen-'+id.toLowerCase(),name,author,url:`https://codepen.io/${author}/pen/${id}`,status:kind?'adapted':'unavailable',...(kind?{theme:{name,appearance,background:bg,surface,text,muted:text,accent,typography:{family:['retro','neon','brutal'].includes(kind)?'monospace':'system',size:13},density:'comfortable',visual:{kind,radius,border,depth},source:{url:`https://codepen.io/${author}/pen/${id}`,author,kind:'inspired-adaptation'}}}:{})}));
export const codepenSkins=Object.fromEntries(codepenReferences.filter(r=>r.theme).map(r=>[r.id,{...r.theme,group:'CodePen · adaptations',signal:r.theme.accent,radius:r.theme.visual.radius}]));
