import assert from 'node:assert/strict';import {initPitch,stepPitch} from '../public/pitch.js';
let t=10000;const m={score:[0,0],elapsed:0,events:[],updated:t,controls:{},kick:0};initPitch(m);assert.equal(m.squads.flat().length,10);
// Ball crossing the actual goal line must score, including very small time steps.
m.ball={x:98.9,y:42,vx:70,vy:0,owner:null,free:1};stepPitch(m,t+=16,()=>false);assert.equal(m.score[0],1);assert.ok(m.goalUntil>t);
stepPitch(m,t+=2000,()=>false);assert.equal(m.score[0],1);assert.deepEqual(m.ball.owner,[1,3]);
// Passing releases a moving ball, records one pass per press and switches teammates.
m.goalUntil=0;m.ball.owner=[0,3];m.active[0]=3;m.kick=0;m.controls[0]={x:0,y:0,pass:true,time:t};stepPitch(m,t+=16,()=>false);assert.equal(m.stats.passes[0],1);assert.notEqual(m.active[0],3);assert.equal(m.ball.owner,null);assert.ok(Math.hypot(m.ball.vx,m.ball.vy)>0);
// Sprint cannot exceed movement caps and consumes stamina.
const p=m.squads[0][m.active[0]],x=p.x,stamina=p.stamina;m.controls[0]={x:1,y:0,sprint:true,time:t};stepPitch(m,t+=100,()=>false);assert.ok(p.x-x<=2.4);assert.ok(p.stamina<stamina);
// Long gaps cannot advance movement or game time by more than .25 seconds per update.
const elapsed=m.elapsed;stepPitch(m,t+=50000,()=>false);assert.ok(m.elapsed-elapsed<=.251);assert.ok(m.squads.flat().every(p=>Number.isFinite(p.x)&&p.x>=2&&p.x<=98));console.log('PASS: 10-player simulation, physical goal-line scoring, celebrations, possession resets, passing/switching, sprint stamina and elapsed-time bounds.');
