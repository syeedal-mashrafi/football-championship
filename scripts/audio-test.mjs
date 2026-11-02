import assert from 'node:assert/strict';
import {commentaryEvent} from '../public/match-audio.js';
import {playingGuide} from '../public/manual.js';
const m={elapsed:0,duration:90,score:[0,0],stats:{shots:[0,0],saves:[0,0],passes:[0,0],tackles:[0,0],throughs:[0,0],skills:[0,0]}};
assert.equal(commentaryEvent(null,m),'kickoff');assert.equal(commentaryEvent(m,structuredClone(m)),null);
for(const [key,event] of [['shots','shot'],['saves','save'],['tackles','tackle'],['throughs','through'],['passes','pass'],['skills','skill']]){const next=structuredClone(m);next.stats[key][1]=1;assert.equal(commentaryEvent(m,next),event)}
assert.equal(commentaryEvent(m,{...m,score:[0,1]}),'goal');assert.equal(commentaryEvent(m,{...m,elapsed:45}),'halftime');assert.equal(commentaryEvent({...m,elapsed:89},{...m,elapsed:90}),'fulltime');
for(const phrase of ['Standing tackle','Slide tackle','room code','3 points','boundary rebounds','instrumental','offline'])assert.ok(playingGuide().includes(phrase),phrase);
console.log('PASS: commentary event selection, no repeated idle events, goals/halftime/fulltime, and manual coverage.');
