const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const elements={};const context=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});function el(s){return elements[s]??={textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},getContext:()=>context}}const box={document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},requestAnimationFrame(){},Math,HTMLButtonElement:class{}};vm.createContext(box);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),box);const run=s=>vm.runInContext(s,box);const get=s=>run(s);
run('start();keys.add("ArrowRight");update(.1)');assert(get('player.x')>90);run('keys.clear();jump();update(.1)');assert(get('player.y')<590);run('start();player.x=760;keys.add("ArrowUp");for(let i=0;i<85;i++)update(.01)');assert.equal(get('player.y'),490);assert.equal(get('player.checkpoint'),1);assert.equal(get('score'),100);run('keys.clear();keys.add("ArrowDown");for(let i=0;i<85;i++)update(.01)');assert.equal(get('player.y'),590);
run('start();player.x=410;update(.01)');assert.equal(get('lives'),2);run('update(.01)');assert.equal(get('lives'),2);run('start();player.x=350;keys.add("ArrowRight");jump();for(let i=0;i<70;i++)update(.01)');assert.equal(get('lives'),3);
run('start();player.x=enemies[0].x;player.y=enemies[0].y;update(.01)');assert.equal(get('lives'),2);
run('start();player.x=250;update(.01)');assert.equal(get('score'),10);run('update(.01)');assert.equal(get('score'),10);
run('pause();update(1)');assert.equal(get('state'),'paused');run('pause()');assert.equal(get('state'),'running');run('damage();invincible=0;damage();invincible=0;damage()');assert.equal(get('state'),'over');run('start()');assert.equal(get('lives'),3);assert.equal(get('score'),0);
run('player.x=815;player.y=90;player.checkpoint=5;update(.01)');assert.equal(get('state'),'cleared');assert(get('score')>=800);assert.equal(get('best'),get('score'));run('draw()');console.log('PASS: movement, jump, climb up/down, checkpoint, pins, invulnerability, enemies, acorns, pause, game over, restart, goal, drawing');

run('start();remaining=.01;update(.02)');assert.equal(get('state'),'over');assert.equal(get('remaining'),0);assert.equal(get('lives'),3);
run('start();pause()');const before=get('remaining');run('update(10)');assert.equal(get('remaining'),before);run('pause();update(1)');assert.equal(get('remaining'),before-1);
run('start();lives=1;remaining=30;player.x=815;player.y=90;player.checkpoint=5;update(.01)');assert.equal(get('state'),'cleared');const carry=get('score');const frozen=get('remaining');run('update(5)');assert.equal(get('remaining'),frozen);run('nextStage()');assert.equal(get('level'),2);assert.equal(get('score'),carry);assert.equal(get('lives'),2);assert.equal(get('remaining'),115);assert.equal(get('player.checkpoint'),0);assert.equal(get('player.y'),590);
run('start()');let previousPins=0,previousEnemies=0,previousSpeed=0,previousTime=Infinity;
for(let n=1;n<=10;n++){
 assert.equal(get('level'),n);assert(get('pins.length')>=previousPins);assert(get('enemies.length')>=previousEnemies);assert(get('Math.abs(enemies[0].v)')>previousSpeed);assert(get('remaining')<previousTime);
 previousPins=get('pins.length');previousEnemies=get('enemies.length');previousSpeed=get('Math.abs(enemies[0].v)');previousTime=get('remaining');
 // Every ladder has safe landings and no nearby pins, including each checkpoint.
 assert(get('ladders.every(l=>pins.every(p=>Math.abs(p.y-l.top)>1&&Math.abs(p.y-l.bottom)>1||Math.abs(p.x-l.x)>60))'));
 run('draw();player.x=815;player.y=90;player.checkpoint=5;update(.01)');assert.equal(get('state'),n===10?'won':'cleared');
 if(n<10)run('nextStage()');
}
const finalScore=get('score');run('nextStage();update(1)');assert.equal(get('level'),10);assert.equal(get('score'),finalScore);assert.equal(get('best'),finalScore);run('start()');assert.equal(get('level'),1);assert.equal(get('remaining'),120);assert.equal(get('score'),0);assert.equal(get('lives'),3);
console.log('PASS: timeout, paused timer, clear screen timer, score carry, healing, all 10 stages, increasing difficulty, safe ladders, final victory, full restart');
