// Original five-a-side rules and server-authoritative football physics.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function move(p,tx,ty,speed,dt){const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy),step=Math.min(d,speed*dt);p.running=step>.02;if(d>.01){p.x+=dx/d*step;p.y+=dy/d*step;if(step>.01)p.facing=Math.atan2(dy,dx)}p.x=clamp(p.x,2,98);p.y=clamp(p.y,3,97)}
export function initPitch(m,kickoff=0){
 m.squads=[0,1].map(i=>[[5,50],[25,24],[25,76],[43,36],[45,69]].map(([x,y],j)=>({x:i?100-x:x,y,homeX:i?100-x:x,homeY:y,number:j?j+5:1,keeper:j===0,facing:i?Math.PI:0,stamina:100,skillUntil:0,skillReady:0})));
 m.squads[kickoff][3].x=kickoff?52:48;m.squads[kickoff][3].y=50;m.squads[1-kickoff][3].x=kickoff?36:64;
 m.active=[3,3];m.ball={x:kickoff?50:50,y:50,vx:0,vy:0,height:0,vz:0,owner:[kickoff,3],free:0};m.positions=m.active.map((n,i)=>m.squads[i][n]);m.stats={shots:[0,0],passes:[0,0],throughs:[0,0],clears:[0,0],skills:[0,0],saves:[0,0],tackles:[0,0]};m.goalUntil=0;m.goalSide=null;m.lastButtons=[{},{}];m.duration=m.duration||360;m.possessionUntil=0;m.notice='Kick off · attack '+(kickoff?'left':'right');m.noticeUntil=0;
}
function chooseMate(m,i,active,c,through){const p=m.squads[i][active],dir=i?-1:1,mag=Math.hypot(c.x||0,c.y||0),ax=mag>.2?c.x/mag:dir,ay=mag>.2?c.y/mag:0;return m.squads[i].map((q,n)=>{const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1;return {q,n,value:(dx*ax+dy*ay)/d*24+(through?dir*dx*.35:0)-Math.abs(d-22)*.18}}).filter(q=>q.n!==active&&!q.q.keeper).sort((a,b)=>b.value-a.value)[0]}
function release(m,i,p,tx,ty,speed,lift,kind,now,receiver=null){const b=m.ball,dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy)||1;b.owner=null;b.x=p.x+(i?-1.7:1.7);b.y=p.y;b.vx=dx/d*speed;b.vy=dy/d*speed;b.height=.18;b.vz=lift;b.free=.2;b.receiver=receiver;m.kick=now;m.notice=kind;m.noticeUntil=now+1400}
export function stepPitch(m,now,bot){
 if(!m.squads)initPitch(m);const dt=clamp((now-m.updated)/1000,0,.25);m.updated=now;if(!dt)return;m.elapsed+=dt;if(now<m.goalUntil)return;
 if(m.goalUntil){const next=m.goalSide===0?1:0,saved={score:m.score,events:m.events,elapsed:m.elapsed,stats:m.stats,training:m.training,started:m.started};initPitch(m,next);Object.assign(m,saved);m.goalUntil=0;m.goalSide=null;m.ball.owner=[next,3];m.possessionUntil=now+900}
 for(const k of ['throughs','clears','skills'])m.stats[k]||=[0,0];
 const b=m.ball;b.height=Number.isFinite(b.height)?b.height:0;b.vz=Number.isFinite(b.vz)?b.vz:0;b.free=Math.max(0,(b.free||0)-dt);
 for(let i=0;i<2;i++){
  if(m.training&&i===1)continue;const dir=i?-1:1;let c=m.controls[i]&&now-m.controls[i].time<1200?m.controls[i]:{x:0,y:0};
  const nearest=m.squads[i].map((p,n)=>({n,d:p.keeper?1e4:distance(p,b)})).sort((a,b)=>a.d-b.d)[0].n;
  if(bot(i)){m.active[i]=b.owner?.[0]===i?b.owner[1]:nearest;const p=m.squads[i][m.active[i]],owns=b.owner?.[0]===i,target=owns?{x:i?16:84,y:50+Math.sin(p.number*1.8)*7}:b,dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)||1;c={x:dx/d,y:dy/d,shoot:owns&&(i?p.x<26:p.x>74)&&now-m.kick>1100,sprint:false};}
  if(c.clear&&b.owner?.[0]!==i)c={...c,switch:true};
  const prev=m.lastButtons[i]||{};
  if(c.press&&b.owner?.[0]!==i){m.active[i]=nearest;const p=m.squads[i][nearest],dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)||1;c={...c,x:dx/d,y:dy/d,sprint:true}}
  if(c.sprint&&Math.hypot(c.x||0,c.y||0)<.1){const p=m.squads[i][m.active[i]],target=b.owner?.[0]===i?{x:i?3:97,y:p.y}:b,d=Math.hypot(target.x-p.x,target.y-p.y)||1;c={...c,x:(target.x-p.x)/d,y:(target.y-p.y)/d}}
  if(c.switch&&!prev.switch){if(b.owner?.[0]===i)m.active[i]=b.owner[1];else {const options=m.squads[i].map((p,n)=>({n,d:p.keeper||n===m.active[i]?1e4:distance(p,b)})).sort((a,b)=>a.d-b.d);m.active[i]=options[0].n}}
  const active=m.active[i];
  for(let j=0;j<5;j++){const p=m.squads[i][j];p.stamina=clamp((p.stamina??100)+dt*11,0,100);
   if(j===active&&!p.keeper){const mag=Math.max(1,Math.hypot(c.x||0,c.y||0)),sprint=!!c.sprint&&p.stamina>7;move(p,p.x+(c.x||0)/mag*(sprint?23:15)*dt,p.y+(c.y||0)/mag*(sprint?23:15)*dt,1000,dt);if(sprint&&p.running)p.stamina=clamp(p.stamina-34*dt,0,100);
    if(((c.skill&&!prev.skill)||(c.sprint&&!prev.sprint))&&b.owner?.[0]===i&&b.owner[1]===j&&now>(p.skillReady||0)&&p.stamina>=16){p.y=clamp(p.y+((c.y||0)>0?-1:1)*2.5,4,96);p.skillUntil=now+650;p.skillReady=now+2200;p.stamina-=12;m.stats.skills[i]++;m.notice='Body feint · beat the press';m.noticeUntil=now+1100;}
   }else if(p.keeper)move(p,i?95:5,clamp(b.y,43,57),11,dt);
   else {const own=b.owner?.[0]===i;let tx=clamp(p.homeX+(own?dir*11:dir*-2),10,90),ty=p.homeY+(b.y-50)*.15;
    if(!own&&j===nearest){tx=b.x-dir*1.5;ty=b.y}
    if(b.receiver?.[0]===i&&b.receiver[1]===j){tx=b.x;ty=b.y}
    move(p,tx,ty,!own&&j===nearest?11:8,dt)}
  }
  const p=m.squads[i][active];
  if((c.tackle&&!prev.tackle||c.slide&&!prev.slide)&&b.owner&&b.owner[0]!==i&&now>(p.tackleReady||0)){const q=m.squads[b.owner[0]][b.owner[1]],sliding=!!c.slide,reach=sliding?6.2:4.8;p.tackleReady=now+(sliding?1250:650);p.tackleUntil=now+450;p.stamina=clamp(p.stamina-(sliding?16:6),0,100);if(distance(p,q)<reach&&now>(q.skillUntil||0)){b.owner=[i,active];m.stats.tackles[i]++;m.kick=now;m.possessionUntil=now+1250;m.notice=sliding?'Slide tackle · ball won':'Standing tackle · ball won'}else{m.notice='Tackle missed · get closer'}m.noticeUntil=now+1200}
  const owns=b.owner?.[0]===i&&b.owner[1]===active;
  if(owns&&now-m.kick>220){
   if(c.clear&&!prev.clear){m.stats.clears[i]++;const tx=p.x+dir*65,ty=clamp(p.y+((c.y||0)|| (p.y>50?-0.35:.35))*25,8,92);release(m,i,p,tx,ty,78,8,'Clearance · get it out',now)}
   else if(c.shoot&&(!prev.shoot||bot(i))&&now-m.kick>550){m.stats.shots[i]++;release(m,i,p,i?-4:104,clamp(50+(c.y||0)*6,44,56),76,1.5,'Shot on goal',now)}
   else if(c.through&&!prev.through||c.pass&&!prev.pass){const through=!!c.through&&!prev.through,t=chooseMate(m,i,active,c,through);if(t){m.stats.passes[i]++;if(through)m.stats.throughs[i]++;release(m,i,p,clamp(t.q.x+(through?dir*10:0),5,95),clamp(t.q.y+(through?(c.y||0)*5:0),5,95),through?51:43,through?1:.25,through?'Through ball · into space':'Pass · find a teammate',now,[i,t.n]);m.active[i]=t.n;}}
  }
  m.lastButtons[i]={shoot:!!c.shoot,pass:!!c.pass,through:!!c.through,clear:!!c.clear,switch:!!c.switch,sprint:!!c.sprint,skill:!!c.skill,tackle:!!c.tackle,slide:!!c.slide};
 }
 // Separate bodies instead of allowing several footballers to occupy one point.
 const people=m.squads.flatMap((s,i)=>s.map((p,j)=>({p,i,j})));
 for(let a=0;a<people.length;a++)for(let k=a+1;k<people.length;k++){const aa=people[a],bb=people[k];if(aa.p.keeper||bb.p.keeper||m.training&&aa.i!==bb.i)continue;let dx=bb.p.x-aa.p.x,dy=bb.p.y-aa.p.y,d=Math.hypot(dx,dy);const min=aa.i===bb.i?3.2:2.15;if(d<min){if(d<.001){dx=.1;dy=.03;d=Math.hypot(dx,dy)}const push=(min-d)*.5;aa.p.x=clamp(aa.p.x-dx/d*push,2,98);aa.p.y=clamp(aa.p.y-dy/d*push,3,97);bb.p.x=clamp(bb.p.x+dx/d*push,2,98);bb.p.y=clamp(bb.p.y+dy/d*push,3,97)}}
 if(b.owner){const [i,j]=b.owner,p=m.squads[i][j];b.x=p.x+(i?-1.8:1.8);b.y=p.y+.3;b.height=.05;b.vx=b.vy=b.vz=0;
  if(!m.training&&now>(m.possessionUntil||0)&&now-m.kick>1500&&now>(p.skillUntil||0)){const opponent=m.squads[1-i].map((q,k)=>({q,k})).find(({q,k})=>k>0&&distance(p,q)<2.2);if(opponent){b.owner=[1-i,opponent.k];m.active[1-i]=opponent.k;m.stats.tackles[1-i]++;m.possessionUntil=now+1100;m.kick=now;m.notice='Interception · possession changes';m.noticeUntil=now+1000}}
 }else{
  for(let k=0;k<4;k++){const dd=dt/4;b.x+=b.vx*dd;b.y+=b.vy*dd;b.height=Math.max(0,b.height+b.vz*dd);b.vz-=20*dd;if(b.height<=0){b.height=0;b.vz=Math.abs(b.vz)>.8?-b.vz*.32:0}
   for(let i=0;i<2;i++){const g=m.squads[i][0];if(!m.training&&distance(g,b)<2.8&&Math.abs(b.vx)>15&&b.height<2.5&&now>(g.saveReady||0)){m.stats.saves[i]++;g.saveReady=now+700;g.diveUntil=now+450;b.vx=i?-29:29;b.vy=(b.y-50)*2;b.vz=2;b.free=.25;m.notice='Goalkeeper save!';m.noticeUntil=now+1000}}
   if((b.x>=99||b.x<=1)&&b.y>=42&&b.y<=58&&b.height<2.5){const scorer=b.x>50?0:1;m.score[scorer]++;m.goalSide=scorer;m.goalUntil=now+1900;m.events.unshift((scorer?'Away':'Home')+' GOAL! A clinical finish.');m.events=m.events.slice(0,40);b.vx=b.vy=0;return}
   if(b.x<1||b.x>99){b.x=clamp(b.x,1,99);b.vx*=-.6}if(b.y<1||b.y>99){b.y=clamp(b.y,1,99);b.vy*=-.65}
  }
  const friction=Math.pow(b.height>.2?.95:.64,dt);b.vx*=friction;b.vy*=friction;
  if(b.free===0&&b.height<.8){const candidates=people.map(q=>({...q,d:distance(q.p,b)})).filter(q=>q.d<2.7&&!q.p.keeper&&(!m.training||q.i===0)).sort((a,b)=>a.d-b.d),q=candidates[0];if(q){b.owner=[q.i,q.j];b.receiver=null;m.active[q.i]=q.j;m.possessionUntil=now+700}}
 }
 m.positions=m.active.map((n,i)=>m.squads[i][n]);
}
