import assert from 'node:assert/strict';
import {initPitch,stepPitch} from '../public/pitch.js';
import {joystickVector,createController} from '../public/controller.js';
assert.equal(joystickVector(1,1).x,0);assert.ok(Math.abs(Math.hypot(...Object.values(joystickVector(100,100)).slice(0,2))-1)<.001);assert.equal(joystickVector(NaN,0).x,0);
const controller=createController();assert.equal(controller.sample({f:true}).through,true);assert.equal(controller.sample({Shift:true}).skill,true);controller.reset();assert.equal(controller.sample().sprint,false);
const match=()=>{let m={score:[0,0],elapsed:0,events:[],updated:10000,controls:{},kick:0};initPitch(m);return m};
for(const [action,stat] of [['through','throughs'],['clear','clears'],['skill','skills']]){const m=match();m.controls[0]={[action]:true,x:1,y:0,time:10000};stepPitch(m,10016,()=>false);assert.equal(m.stats[stat][0],1,action);if(action==='clear')assert.ok(m.ball.height>0&&m.ball.vz>0);if(action==='through'){assert.ok(m.ball.receiver);assert.equal(m.ball.owner,null)}if(action==='skill')assert.ok(m.squads[0][3].skillUntil>10016);stepPitch(m,10032,()=>false);assert.equal(m.stats[stat][0],1,'holding must not repeat');}
const m=match();m.squads.flat().forEach(p=>{p.x=50;p.y=50});for(let k=1;k<=20;k++)stepPitch(m,10000+k*16,()=>false);assert.ok(m.squads.flat().every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));assert.ok(new Set(m.squads.flat().map(p=>p.x.toFixed(1)+':'+p.y.toFixed(1))).size>5);
console.log('PASS: analog dead zone and diagonal caps, keyboard bindings, reset, through balls, lofted clearance, skill cooldown and crowd separation.');

// Defending must work by an explicit action, outside passive interception range.
for(const action of ['tackle','slide']){const m=match();m.ball.owner=[1,3];m.squads[1][3].x=52;m.squads[1][3].y=50;m.squads[0][3].x=48;m.squads[0][3].y=50;m.controls[0]={[action]:true,x:0,y:0,time:10000};stepPitch(m,10016,()=>false);assert.deepEqual(m.ball.owner,[0,3]);assert.equal(m.stats.tackles[0],1)}
const walking=match(),sprinting=match();for(const m of [walking,sprinting])m.controls[0]={x:1,y:0,sprint:m===sprinting,time:10000};stepPitch(walking,10100,()=>false);stepPitch(sprinting,10100,()=>false);assert.ok(sprinting.squads[0][3].x>walking.squads[0][3].x+.5);
const chase=match();chase.ball.owner=[1,3];const before=chase.squads[0][3].x;chase.controls[0]={x:0,y:0,sprint:true,time:10000};stepPitch(chase,10100,()=>false);assert.ok(chase.squads[0][3].x>before,'sprint without direction chases the ball');
console.log('PASS: explicit standing and slide tackles win possession; sprint outruns walking; sprint assist chases the ball.');
