import { useState, useCallback, useMemo } from "react";

const V="3.0";
const START=new Date(2026,3,17);
const P={mind:{l:"MIND",i:"◆",c:"#c9a0ff",bg:"rgba(201,160,255,.07)"},body:{l:"BODY",i:"▲",c:"#ff6b6b",bg:"rgba(255,107,107,.07)"},wealth:{l:"WEALTH",i:"◈",c:"#ffd93d",bg:"rgba(255,217,61,.07)"},health:{l:"HEALTH",i:"●",c:"#6bffb8",bg:"rgba(107,255,184,.07)"},happiness:{l:"HAPPINESS",i:"✦",c:"#6bc5ff",bg:"rgba(107,197,255,.07)"}};
const LX=[0,100,250,500,850,1300,1900,2700,3800,5200,7000,9500,12500,16500,21000,27000,34000,42000,52000,65000,80000];
const LT=["Unawakened","Initiate","Apprentice","Striker","Warrior","Gladiator","Warlord","Champion","Conqueror","Overlord","Sovereign","Architect","Titan","Legend","Mythic","Ascendant","Immortal","Deity","Eternal","Transcendent","???"];
function gL(xp){let l=0;for(let i=LX.length-1;i>=0;i--)if(xp>=LX[i]){l=i;break;}const c=LX[l]||0,n=LX[l+1]||c+1e3;return{level:l,title:LT[l]||"???",inL:xp-c,need:n-c};}
const dk=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const dN=d=>Math.max(1,Math.floor((d-START)/864e5)+1);
const phFn=n=>n<=30?{n:1,nm:"FROM THE ASHES",c:"#ff6b6b"}:n<=60?{n:2,nm:"FIRST BLOOD",c:"#ffd93d"}:{n:3,nm:"THE ASCENT",c:"#6bffb8"};
const mono="'JetBrains Mono',monospace";

const DEF_H=[
  {id:"m1",p:"mind",name:"Morning Identity Priming",xp:15,desc:"Affirmations, visualization, intent"},
  {id:"m2",p:"mind",name:"Read / Learn (30 min)",xp:15,desc:"Books, courses, Maker School, EasyGrow"},
  {id:"m3",p:"mind",name:"Journal / Reflect",xp:10,desc:"Evening reflection"},
  {id:"m4",p:"mind",name:"No Mindless Scrolling",xp:10,desc:"Intentional consumption only"},
  {id:"b1",p:"body",name:"Train (PPL at Terry's)",xp:25,desc:"Progressive overload"},
  {id:"b2",p:"body",name:"Hit 3,200 Cal Target",xp:20,desc:"5 meals, high protein"},
  {id:"b3",p:"body",name:"1 Gallon Water",xp:10,desc:"Hydration"},
  {id:"b4",p:"body",name:"7+ Hours Sleep",xp:15,desc:"Recovery"},
  {id:"w1",p:"wealth",name:"Revenue Block (2 hrs)",xp:30,desc:"Outbound, calls, client work"},
  {id:"w2",p:"wealth",name:"Skill Build (1.5 hrs)",xp:20,desc:"Maker School + EasyGrow"},
  {id:"w3",p:"wealth",name:"1 Piece of Content",xp:15,desc:"Post, video, tweet"},
  {id:"w4",p:"wealth",name:"Admin / Pipeline",xp:10,desc:"CRM, follow-ups"},
  {id:"h1",p:"health",name:"Morning Hydration + Stretch",xp:10,desc:"16oz water + mobility"},
  {id:"h2",p:"health",name:"5 Meals Eaten",xp:15,desc:"Structured nutrition"},
  {id:"h3",p:"health",name:"Supplements Taken",xp:5,desc:"Creatine, protein, vitamins"},
  {id:"s1",p:"happiness",name:"Gratitude (3 things)",xp:10,desc:"3 specific things"},
  {id:"s2",p:"happiness",name:"Connect with Someone",xp:10,desc:"Real conversation"},
  {id:"s3",p:"happiness",name:"Do 1 Thing You Enjoy",xp:10,desc:"Guilt-free"},
];

const WARMUP=[
  {name:"Jumping Jacks",dur:"60s",note:"Elevate heart rate"},
  {name:"Arm Circles",dur:"30s each",note:"Shoulder joint prep"},
  {name:"Leg Swings",dur:"10/leg",note:"Hip mobility"},
  {name:"Band Pull-Aparts",dur:"15 reps",note:"Rotator cuff activation"},
  {name:"BW Squats",dur:"15 reps",note:"Knee/hip warm-up"},
  {name:"Cat-Cow",dur:"10 reps",note:"Spine mobility"},
  {name:"Dead Hangs",dur:"30s",note:"Decompress spine"},
  {name:"2 Warm-Up Sets",dur:"50%/70%",note:"Of first compound lift"},
];

const WK={
  push:{nm:"PUSH",em:"🔥",mu:"Chest / Shoulders / Tri",ex:[
    {name:"Flat Bench Press",sets:4,reps:"6-8",rest:"3m",note:"+5lb when you hit 4x8"},
    {name:"Incline DB Press",sets:3,reps:"8-10",rest:"2m",note:"30° incline"},
    {name:"Overhead Press",sets:4,reps:"6-8",rest:"2.5m",note:"Standing, core braced"},
    {name:"Lateral Raises",sets:4,reps:"12-15",rest:"60s",note:"Light, controlled"},
    {name:"Cable Flyes",sets:3,reps:"12-15",rest:"60s",note:"Constant tension"},
    {name:"Tricep Pushdowns",sets:3,reps:"10-12",rest:"60s",note:"Rope or bar"},
    {name:"OH Tri Extension",sets:3,reps:"10-12",rest:"60s",note:"Full stretch"},
  ]},
  pull:{nm:"PULL",em:"⚡",mu:"Back / Biceps / Rear Delts",ex:[
    {name:"Barbell Rows",sets:4,reps:"6-8",rest:"2.5m",note:"Overhand, lower chest"},
    {name:"Pull-Ups/Pulldown",sets:4,reps:"6-10",rest:"2m",note:"Full ROM"},
    {name:"Seated Cable Row",sets:3,reps:"10-12",rest:"90s",note:"Squeeze blades"},
    {name:"Face Pulls",sets:4,reps:"15-20",rest:"60s",note:"External rotation"},
    {name:"Barbell Curls",sets:3,reps:"8-10",rest:"60s",note:"No swinging"},
    {name:"Hammer Curls",sets:3,reps:"10-12",rest:"60s",note:"Arm thickness"},
    {name:"Reverse Curls",sets:2,reps:"12-15",rest:"60s",note:"Forearms"},
  ]},
  legs:{nm:"LEGS",em:"🦵",mu:"Quads / Hams / Glutes / Calves",ex:[
    {name:"Barbell Squats",sets:4,reps:"6-8",rest:"3m",note:"Below parallel"},
    {name:"Romanian Deadlifts",sets:4,reps:"8-10",rest:"2.5m",note:"Hinge at hips"},
    {name:"Leg Press",sets:3,reps:"10-12",rest:"2m",note:"Full ROM"},
    {name:"Walking Lunges",sets:3,reps:"12/leg",rest:"90s",note:"Long stride"},
    {name:"Leg Curls",sets:3,reps:"10-12",rest:"60s",note:"Slow eccentric"},
    {name:"Calf Raises",sets:4,reps:"15-20",rest:"60s",note:"Pause top"},
    {name:"Ab Wheel/Leg Raise",sets:3,reps:"10-15",rest:"60s",note:"Core"},
  ]},
};
const WS=["push","pull","legs","push","pull","legs","rest"];
const DNS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const MEALS=[
  {id:"m1",t:"9:00 AM",nm:"Wake Up Fuel",cal:650,pro:40,food:"4 eggs, 2 toast w/ butter, banana",alt:"Overnight oats + protein + PB + banana"},
  {id:"m2",t:"11:30 AM",nm:"Post-Workout",cal:700,pro:45,food:"2 scoops whey, 1.5c rice, 8oz chicken",alt:"Shake + PB&J + greek yogurt"},
  {id:"m3",t:"2:00 PM",nm:"Midday Power",cal:650,pro:35,food:"8oz ground beef + rice + cheese, salad",alt:"3 turkey wraps w/ cheese + avocado"},
  {id:"m4",t:"5:00 PM",nm:"Afternoon Fuel",cal:550,pro:30,food:"PB&J, shake, trail mix",alt:"2 cans tuna on crackers + fruit"},
  {id:"m5",t:"8:00 PM",nm:"Night Builder",cal:650,pro:35,food:"8oz chicken, 2c pasta, broccoli",alt:"Turkey tacos w/ rice, beans, cheese"},
];
const TCAL=MEALS.reduce((s,m)=>s+m.cal,0);const TPRO=MEALS.reduce((s,m)=>s+m.pro,0);

const ROUTINE=[
  {t:"9:00",task:"Wake + Water + Stretch",dur:"15m",hid:"h1",pill:"health"},
  {t:"9:15",task:"Meal 1",dur:"20m",pill:"health",mid:"m1"},
  {t:"9:30",task:"Identity Priming",dur:"10m",hid:"m1",pill:"mind"},
  {t:"9:45",task:"Supplements",dur:"2m",hid:"h3",pill:"health"},
  {t:"10:00",task:"Train — PPL",dur:"75m",hid:"b1",pill:"body"},
  {t:"11:15",task:"Meal 2",dur:"20m",pill:"body",mid:"m2"},
  {t:"12:00",task:"Revenue Block",dur:"2hr",hid:"w1",pill:"wealth"},
  {t:"2:00",task:"Meal 3",dur:"20m",pill:"health",mid:"m3"},
  {t:"2:30",task:"Skill Build",dur:"90m",hid:"w2",pill:"wealth"},
  {t:"4:00",task:"Admin/Pipeline",dur:"30m",hid:"w4",pill:"wealth"},
  {t:"4:30",task:"Create Content",dur:"45m",hid:"w3",pill:"wealth"},
  {t:"5:00",task:"Meal 4",dur:"15m",pill:"health",mid:"m4"},
  {t:"5:30",task:"Read/Learn",dur:"30m",hid:"m2",pill:"mind"},
  {t:"6:00",task:"Free Block",dur:"2hr",hid:"s3",pill:"happiness"},
  {t:"8:00",task:"Meal 5",dur:"20m",pill:"health",mid:"m5"},
  {t:"8:30",task:"Connect",dur:"30m",hid:"s2",pill:"happiness"},
  {t:"9:00",task:"Gratitude + Journal",dur:"20m",hid:"m3",pill:"mind"},
  {t:"9:30",task:"Wind Down",dur:"30m",hid:"m4",pill:"mind"},
  {t:"10:00",task:"Sleep",dur:"11hr",hid:"b4",pill:"body"},
];

const ROADMAP=[
  {w:1,d:"1-7",title:"Foundation",ph:1,body:"163→165",wealth:"Maker School, EasyGrow M1-2",ms:["CRM + templates set up","50 cold DMs","PPL locked in","3200 cal 5/7 days"],boss:"50 outreach, first reply"},
  {w:2,d:"8-14",title:"First Contact",ph:1,body:"165→166",wealth:"EasyGrow M3-4",ms:["100 outreach","First call","5 content pieces","Lifts up"],boss:"Book first call"},
  {w:3,d:"15-21",title:"Proving Ground",ph:1,body:"166→168",wealth:"Pitch refined",ms:["200 outreach","3+ calls","Content traction","Strength up"],boss:"Close client OR 3 calls"},
  {w:4,d:"22-30",title:"First Blood",ph:1,body:"168→170",wealth:"First client",ms:["$500-1k collected","Results delivered","System repeatable","Weight up"],boss:"First payment collected"},
  {w:5,d:"31-37",title:"Scale",ph:2,body:"170→172",wealth:"$1-2k MRR",ms:["2-3 clients","Delivery refined","Case studies","Intermediate lifts"],boss:"$1k revenue"},
  {w:6,d:"38-44",title:"Compound",ph:2,body:"172→174",wealth:"Systematize",ms:["Retention built","Testimonials","Content refined","Visible changes"],boss:"First testimonial"},
  {w:7,d:"45-51",title:"Momentum",ph:2,body:"174→176",wealth:"$2-3k MRR",ms:["4-5 clients","Referrals","Inbound starting","Macros consistent"],boss:"$2k MRR — Mom gets $2k"},
  {w:8,d:"52-60",title:"War Chest",ph:2,body:"176→178",wealth:"$3k+",ms:["Runway secured","Car fixed","5+ clients","15+ lbs gained"],boss:"$3k MRR"},
  {w:9,d:"61-67",title:"Empire",ph:3,body:"178→180",wealth:"$4k+",ms:["First contractor","SOPs done","Premium offer","PRs"],boss:"Delegate — CEO mode"},
  {w:10,d:"68-74",title:"Authority",ph:3,body:"180→182",wealth:"$5k+",ms:["Known in niche","Speaking/pods","Waitlist","Advanced training"],boss:"Get featured"},
  {w:11,d:"75-81",title:"Domination",ph:3,body:"182→185",wealth:"$6k+",ms:["8-10 clients","Predictable rev","Content machine","Goal physique"],boss:"$6k MRR — Mom cleared"},
  {w:12,d:"82-90",title:"Transcendence",ph:3,body:"185→187",wealth:"$7-10k",ms:["Systems running","Multi-stream","Transformation visible","Identity complete"],boss:"Different person in mirror"},
];

const STORY={
  1:{t:"The Awakening",x:"You open your eyes. Something shifted. Today the old Ola dies. 90 days. $100. No car. Mom counting on you. Rise."},
  7:{t:"First Week",x:"Seven days. Every one. Muscles ache. Mind clear. Outreach going. Foundation setting like concrete."},
  14:{t:"The Grind",x:"Two weeks. Novelty gone. 95% quit here. You're still here. The unsexy middle — where empires are built."},
  21:{t:"Identity Shift",x:"You don't try. You DO. You train. You hunt. You barely recognize Day 1 you."},
  30:{t:"PHASE 1 DONE",x:"30 days from ashes. Discipline forged. Body responding. Agency alive. Phase 2 begins."},
  45:{t:"Compound",x:"45 days. Accelerating. Clients. Body different. People noticing. Every action stacking."},
  60:{t:"PHASE 2 DONE",x:"60 days. Revenue flowing. Mom paid. Car fixed. 15+ lbs. From $100 to something real. The Ascent."},
  75:{t:"Final Push",x:"75 days. 15 left. Champions separate here. Push harder than Day 1."},
  90:{t:"TRANSCENDENCE",x:"90 days. 163→185+. $100→$7k+. Zero→business. You killed one version and built another. Ascend."},
};

const SOPS={
  gym:{title:"GYM SOP",icon:"🏋️",steps:["Phone DND. AirPods in. No social media.","5-min dynamic warmup (see warmup section).","2 warm-up sets: 50% and 70% of working weight.","Execute workout. Log every set in app.","Progressive overload: hit top rep range all sets → +5lb next time.","Rest: 2-3min compounds, 60-90s isolation.","Mind-muscle connection every rep. Control the eccentric.","Post-workout: shake within 30min. Meal 2 within 60min.","Ask: Did I beat last session on at least one lift?"]},
  deepwork:{title:"DEEP WORK SOP",icon:"🎯",steps:["Phone airplane mode or different room. Close all tabs.","25-min Pomodoro. One task. No switching.","Revenue priority: (1) Follow up warm leads (2) New outreach (3) Content.","'One more' rule: when you want to stop, one more message.","Track INPUTS: DMs sent, calls made, proposals out.","After each Pomo: stand, stretch, water. Back in.","End of block: update pipeline, schedule follow-ups.","Ask: Did I do the uncomfortable thing today?","Rule: Revenue activities FIRST. Learning AFTER."]},
  night:{title:"NIGHT SOP",icon:"🌙",steps:["9:00 — Gratitude: 3 specific things.","9:10 — Journal: What went well? What didn't? Tomorrow's plan?","9:20 — Prep: Review schedule. Set out gym clothes. Prep meals.","9:30 — Screens off. Blue light glasses if needed.","9:30-10:00 — Wind down: Read, stretch, meditate, breathe.","Room: Cool (65-68°F), dark, phone across room.","No caffeine after 2 PM. No heavy food after 8:30 PM.","10:00 — Lights out. 7+ hours minimum.","Racing mind? 4-7-8 breathing × 4 rounds."]},
  priming:{title:"IDENTITY PRIMING SOP",icon:"🔥",steps:["Sit upright. Close eyes. 3 deep breaths.","Read Vision (Soul tab). Visualize as already real — 2 min.","Read Anti-Vision. Feel the disgust. Use it as fuel.","Affirmations (out loud, with conviction):","→ I am building an empire. Every action compounds.","→ I am disciplined, focused, and relentless.","→ I am becoming who my family needs me to be.","→ Money flows to me because I create massive value.","→ My body is a machine. I fuel it and it performs.","Set #1 intention for today. Write it down.","Stand up. Execute."]},
};

const HACKS=[
  {cat:"Breathing",items:[
    {name:"Box Breathing",how:"Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. 4-6 rounds.",when:"Before calls, anxiety, pre-workout"},
    {name:"4-7-8 Breathing",how:"Inhale 4s → Hold 7s → Exhale 8s. 4 rounds.",when:"Can't sleep, need to calm fast"},
    {name:"Wim Hof",how:"30 deep breaths, hold empty 60-90s, inhale hold 15s. 3 rounds.",when:"Morning energy, before cold shower"},
  ]},
  {cat:"Focus",items:[
    {name:"Pomodoro",how:"25 min work → 5 min break → repeat. 4 rounds then 15-30 min break.",when:"Deep work, studying"},
    {name:"2-Minute Rule",how:"Takes <2 min? Do it now. Don't list it.",when:"Admin, emails, quick tasks"},
    {name:"Eat the Frog",how:"Hardest/scariest task first. Everything after feels easy.",when:"Start of revenue block"},
    {name:"Environment Design",how:"Phone gone. One tab. Water on desk. Zero distractions visible.",when:"Every work session"},
  ]},
  {cat:"Energy",items:[
    {name:"10-Min Walk",how:"Outside. No phone. Let mind wander or problem-solve.",when:"After meals, between blocks, when stuck"},
    {name:"Cold Face Splash",how:"Cold water on face/wrists 30s. Dive reflex activation.",when:"Afternoon slump, need alertness"},
    {name:"Power Pose",how:"Hands on hips, chest out, chin up. 2 min.",when:"Before calls, low confidence"},
    {name:"Morning Sunlight",how:"Direct sunlight within 30 min of waking. 10-15 min.",when:"Every morning — circadian rhythm"},
  ]},
  {cat:"Mindset",items:[
    {name:"Reframe",how:"Bad thing happens → 'How is this FOR me, not TO me?'",when:"Rejection, setbacks, bad days"},
    {name:"5-Second Rule",how:"Impulse to act → count 5-4-3-2-1 → physically move.",when:"Getting up, starting work, making calls"},
    {name:"10/10/10",how:"How will I feel in 10 min? 10 months? 10 years?",when:"Tempted to skip, making decisions"},
    {name:"Identity Stack",how:"Don't say 'I need to.' Say 'I'm the type of person who...'",when:"All day. Language shapes identity."},
  ]},
  {cat:"Recovery",items:[
    {name:"5-Min Meditation",how:"Sit. Eyes closed. Breath focus. Mind wanders → return. No judgment.",when:"Morning, before bed, between tasks"},
    {name:"PMR",how:"Tense each muscle 5s, release 10s. Feet to head.",when:"Before sleep, high stress"},
    {name:"Foam Rolling",how:"Each major group 60-90s. Slow. Stop on tender spots.",when:"Post-workout, rest days"},
    {name:"Gratitude Interrupt",how:"Spiraling? Name 5 things grateful for RIGHT NOW.",when:"Negative self-talk, comparison, bad mood"},
  ]},
];

const BUDGET_CATS=[
  {id:"income",name:"Income",icon:"💰",type:"in"},
  {id:"groceries",name:"Groceries",icon:"🛒",type:"out",budget:75},
  {id:"gas",name:"Gas/Transport",icon:"⛽",type:"out",budget:60},
  {id:"car",name:"Car Expenses",icon:"🚗",type:"out",budget:200},
  {id:"phone",name:"Phone",icon:"📱",type:"out",budget:50},
  {id:"tools",name:"Biz Tools",icon:"🛠️",type:"out",budget:50},
  {id:"personal",name:"Personal",icon:"🎯",type:"out",budget:40},
  {id:"mom",name:"Mom Repayment",icon:"❤️",type:"out",budget:0},
  {id:"savings",name:"Savings",icon:"🏦",type:"out",budget:0},
  {id:"other",name:"Other",icon:"📦",type:"out",budget:0},
];

const BODY_MET={weight:{s:163,u:"lbs",l:"Weight",tg:[165,166,168,170,172,174,176,178,180,182,185,187]},bench:{s:95,u:"lbs",l:"Bench",tg:[105,115,125,135,145,155,165,175,185,185,195,205]},squat:{s:115,u:"lbs",l:"Squat",tg:[135,155,175,185,205,225,235,245,255,265,275,285]},deadlift:{s:135,u:"lbs",l:"Deadlift",tg:[155,185,205,225,245,265,285,305,315,325,335,345]}};
const MONEY_MET={revenue:{s:0,u:"$",l:"Monthly Revenue",tg:[0,0,500,1000,2000,3000,4000,5000,6000,7000,8000,10000]},clients:{s:0,u:"",l:"Active Clients",tg:[0,1,1,2,3,5,6,8,10,10,12,12]}};

const DAY_MSGS=["Day conquered.","You showed up.","Discipline > Motivation.","Empire grows.","Relentless.","Stack days.","Proof."];

function ld(){try{const r=localStorage.getItem("asc3");if(r)return JSON.parse(r);}catch{}return null;}
function sv(s){try{localStorage.setItem("asc3",JSON.stringify(s));}catch{}}
function init(){const s=ld();if(s&&s.v===V)return s;return{v:V,habits:DEF_H,days:{},totalXP:0,wknd:false,notes:{},workouts:{},mealLog:{},metrics:{},transactions:[]};}

function Ring({pct,size=80,stroke=5,color="#c9a0ff",children}){const r=(size-stroke)/2,c=2*Math.PI*r;return(<div style={{position:"relative",width:size,height:size}}><svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c-(pct/100)*c} strokeLinecap="round" style={{transition:"stroke-dashoffset .5s ease"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>{children}</div></div>);}
function Bar({pct,color="#c9a0ff",h=6}){return(<div style={{height:h,borderRadius:h/2,background:"rgba(255,255,255,.05)",overflow:"hidden",width:"100%"}}><div style={{height:"100%",borderRadius:h/2,background:color,width:`${Math.min(100,pct)}%`,transition:"width .5s ease"}}/></div>);}

export default function App(){
  const[state,_s]=useState(init);
  const up=useCallback(fn=>_s(p=>{const n=fn(p);sv(n);return n;}),[]);
  const[tab,setTab]=useState("home");
  const[sub,setSub]=useState(null);
  const[celeb,setCeleb]=useState(null);
  const[showEdit,setShowEdit]=useState(false);
  const[expEx,setExpEx]=useState(null);
  const[showSOP,setShowSOP]=useState(null);
  const[txForm,setTxForm]=useState({amount:"",cat:"income",note:""});

  const today=new Date(),dKey=dk(today),dn=dN(today),curPh=phFn(dn),lvl=gL(state.totalXP);
  const dd=state.days[dKey]||{completed:[]},compl=dd.completed||[];
  const maxXP=state.habits.reduce((s,h)=>s+h.xp,0),earnXP=state.habits.filter(h=>compl.includes(h.id)).reduce((s,h)=>s+h.xp,0);
  const dayPct=maxXP>0?Math.round(earnXP/maxXP*100):0;

  const streak=useMemo(()=>{let s=0;const d=new Date(today);const td=state.days[dk(d)];const ok=td&&(td.completed||[]).length>=Math.floor(state.habits.length*.7);if(!ok)d.setDate(d.getDate()-1);while(true){const k=dk(d);const x=state.days[k];if(!x||(x.completed||[]).length<Math.floor(state.habits.length*.7))break;s++;d.setDate(d.getDate()-1);}if(ok)s=Math.max(s,1);return s;},[state.days,state.habits]);
  const weekPct=useMemo(()=>{const ws=new Date(today);const day=ws.getDay();ws.setDate(ws.getDate()-(day===0?6:day-1));let t=0,p=0;for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(d.getDate()+i);const dow=d.getDay();if(!state.wknd&&(dow===0||dow===6))continue;p+=maxXP;const x=state.days[dk(d)];if(x)t+=state.habits.filter(h=>(x.completed||[]).includes(h.id)).reduce((s,h)=>s+h.xp,0);}return p>0?Math.round(t/p*100):0;},[state.days,state.habits,state.wknd,maxXP]);
  const monthPct=useMemo(()=>{const y=today.getFullYear(),m=today.getMonth();let t=0,p=0;for(let i=1;i<=today.getDate();i++){const d=new Date(y,m,i);const dow=d.getDay();if(!state.wknd&&(dow===0||dow===6))continue;p+=maxXP;const x=state.days[dk(d)];if(x)t+=state.habits.filter(h=>(x.completed||[]).includes(h.id)).reduce((s,h)=>s+h.xp,0);}return p>0?Math.round(t/p*100):0;},[state.days,state.habits,state.wknd,maxXP]);

  const toggleH=id=>{up(p=>{const d2=p.days[dKey]||{completed:[]};const was=d2.completed.includes(id);const c2=was?d2.completed.filter(x=>x!==id):[...d2.completed,id];const h=p.habits.find(x=>x.id===id);const xd=was?-(h?.xp||0):(h?.xp||0);if(!was&&c2.length===p.habits.length)setTimeout(()=>setCeleb(DAY_MSGS[Math.floor(Math.random()*DAY_MSGS.length)]),300);return{...p,days:{...p.days,[dKey]:{...d2,completed:c2}},totalXP:Math.max(0,p.totalXP+xd)};});};

  const wType=WS[(dn-1)%7],wData=WK[wType],wLog=state.workouts[dKey]||{};
  const logSet=(ei,si,f,v)=>up(p=>{const w={...(p.workouts[dKey]||{})};w[`${ei}-${si}`]={...(w[`${ei}-${si}`]||{}),[f]:v};return{...p,workouts:{...p.workouts,[dKey]:w}};});
  const ml=state.mealLog[dKey]||{};
  const toggleM=id=>up(p=>{const m={...(p.mealLog[dKey]||{})};m[id]=!m[id];return{...p,mealLog:{...p.mealLog,[dKey]:m}};});
  const mealsOk=MEALS.filter(m=>ml[m.id]).length,calOk=MEALS.filter(m=>ml[m.id]).reduce((s,m)=>s+m.cal,0),proOk=MEALS.filter(m=>ml[m.id]).reduce((s,m)=>s+m.pro,0);
  const saveMet=(key,val)=>up(p=>{const m={...p.metrics};if(!m[key])m[key]={};m[key][dKey]=parseFloat(val)||0;return{...p,metrics:m};});
  const getLat=key=>{const e=state.metrics[key]||{};const d=Object.keys(e).sort();return d.length>0?e[d[d.length-1]]:(BODY_MET[key]?.s||MONEY_MET[key]?.s||0);};
  const curStory=useMemo(()=>{const ks=Object.keys(STORY).map(Number).sort((a,b)=>b-a);for(const k of ks)if(dn>=k)return{day:k,...STORY[k]};return{day:1,...STORY[1]};},[dn]);
  const curWeek=Math.min(12,Math.ceil(dn/7));

  const thisMonth=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;
  const monthTx=state.transactions.filter(t=>t.date.startsWith(thisMonth));
  const totalIn=monthTx.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0);
  const totalOut=monthTx.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0);
  const addTx=()=>{const amt=parseFloat(txForm.amount);if(!amt)return;const cat=BUDGET_CATS.find(c=>c.id===txForm.cat);up(p=>({...p,transactions:[...p.transactions,{id:Date.now(),date:dKey,amount:amt,cat:txForm.cat,note:txForm.note,type:cat?.type||"out"}]}));setTxForm({amount:"",cat:"income",note:""});};
  const delTx=id=>up(p=>({...p,transactions:p.transactions.filter(t=>t.id!==id)}));
  const totalMomPaid=state.transactions.filter(t=>t.cat==="mom").reduce((s,t)=>s+t.amount,0);

  const TABS=[{id:"home",ic:"⚔️",nm:"HQ"},{id:"routine",ic:"📋",nm:"FLOW"},{id:"body",ic:"💪",nm:"BODY"},{id:"fuel",ic:"🍗",nm:"FUEL"},{id:"money",ic:"💰",nm:"$$$"},{id:"map",ic:"🗺️",nm:"MAP"},{id:"tools",ic:"🧰",nm:"TOOLS"},{id:"soul",ic:"🔮",nm:"SOUL"}];
  const inp={background:"rgba(255,255,255,.03)",color:"#fff",border:"1px solid rgba(255,255,255,.05)",borderRadius:5,padding:"5px 7px",fontSize:11,outline:"none",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box"};
  const sec=(c)=>({fontSize:9,fontWeight:800,letterSpacing:3,color:c||"rgba(255,255,255,.25)",marginBottom:8});

  const HabitRow=({h})=>{const on=compl.includes(h.id);return(<div onClick={()=>toggleH(h.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",marginBottom:2,background:on?P[h.p].bg:"rgba(255,255,255,.01)",borderLeft:`3px solid ${on?P[h.p].c:"rgba(255,255,255,.04)"}`,borderRadius:6,cursor:"pointer",userSelect:"none"}}><div style={{width:18,height:18,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:on?P[h.p].c:"transparent",border:on?"none":"2px solid rgba(255,255,255,.08)",fontSize:10,color:"#0a0a0f"}}>{on&&"✓"}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:500,color:on?"rgba(255,255,255,.3)":"rgba(255,255,255,.8)",textDecoration:on?"line-through":"none"}}>{h.name}</div></div><div style={{fontSize:9,fontWeight:700,color:on?P[h.p].c:"rgba(255,255,255,.1)",fontFamily:mono}}>+{h.xp}</div></div>);};

  return(
    <div style={{minHeight:"100vh",background:"#08080f",color:"#fff",fontFamily:"'DM Sans',sans-serif",maxWidth:540,margin:"0 auto",paddingBottom:80}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@700;800;900&display=swap');@keyframes scaleIn{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}@keyframes slideUp{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes glow{0%,100%{box-shadow:0 0 12px rgba(201,160,255,.08)}50%{box-shadow:0 0 25px rgba(201,160,255,.18)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.05);border-radius:3px}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>

      {celeb&&<div onClick={()=>setCeleb(null)} style={{position:"fixed",inset:0,zIndex:1e3,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.85)",backdropFilter:"blur(12px)",cursor:"pointer",padding:16}}><div style={{background:"linear-gradient(135deg,#12122a,#0a0a18)",border:"1px solid rgba(201,160,255,.2)",borderRadius:18,padding:"36px 26px",maxWidth:360,textAlign:"center",animation:"scaleIn .3s cubic-bezier(.34,1.56,.64,1)"}}><div style={{fontSize:40,marginBottom:8}}>⚔️</div><div style={{fontSize:16,fontWeight:900,color:"#c9a0ff",letterSpacing:2,marginBottom:8}}>QUEST COMPLETE</div><div style={{fontSize:13,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>{celeb}</div></div></div>}

      {showSOP&&<div onClick={()=>setShowSOP(null)} style={{position:"fixed",inset:0,zIndex:1e3,display:"flex",alignItems:"flex-start",justifyContent:"center",background:"rgba(0,0,0,.88)",backdropFilter:"blur(12px)",padding:"28px 12px",overflowY:"auto"}}><div onClick={e=>e.stopPropagation()} style={{background:"#0c0c18",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:18,width:"100%",maxWidth:460}}>
        <div style={{fontSize:13,fontWeight:800,color:"#c9a0ff",marginBottom:10}}>{SOPS[showSOP].icon} {SOPS[showSOP].title}</div>
        {SOPS[showSOP].steps.map((s,i)=><div key={i} style={{fontSize:10,color:s.startsWith("→")?"#c9a0ff":"rgba(255,255,255,.5)",padding:"5px 0 5px 10px",borderLeft:s.startsWith("→")?"2px solid #c9a0ff":"2px solid rgba(255,255,255,.04)",marginBottom:1,lineHeight:1.5}}>{!s.startsWith("→")&&<span style={{color:"rgba(255,255,255,.12)",fontFamily:mono,fontSize:8,marginRight:6}}>{String(i+1).padStart(2,"0")}</span>}{s}</div>)}
        <div onClick={()=>setShowSOP(null)} style={{marginTop:12,textAlign:"center",padding:8,borderRadius:7,background:"#c9a0ff",color:"#0a0a0f",fontSize:11,fontWeight:800,cursor:"pointer"}}>Got It</div>
      </div></div>}

      {showEdit&&<div onClick={()=>setShowEdit(false)} style={{position:"fixed",inset:0,zIndex:1e3,display:"flex",alignItems:"flex-start",justifyContent:"center",background:"rgba(0,0,0,.88)",backdropFilter:"blur(12px)",padding:"28px 12px",overflowY:"auto"}}><div onClick={e=>e.stopPropagation()} style={{background:"#0c0c18",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:18,width:"100%",maxWidth:460}}>
        <div style={{fontSize:13,fontWeight:800,color:"#c9a0ff",letterSpacing:2,marginBottom:10}}>EDIT QUESTS</div>
        {state.habits.map((h,i)=><div key={h.id} style={{display:"flex",gap:4,alignItems:"center",marginBottom:3}}>
          <select value={h.p} onChange={e=>{const n=[...state.habits];n[i]={...n[i],p:e.target.value};up(p=>({...p,habits:n}));}} style={{...inp,width:58,fontSize:8,padding:3}}>{Object.keys(P).map(k=><option key={k} value={k}>{P[k].l}</option>)}</select>
          <input value={h.name} onChange={e=>{const n=[...state.habits];n[i]={...n[i],name:e.target.value};up(p=>({...p,habits:n}));}} style={{...inp,flex:1,minWidth:0,fontSize:10}}/>
          <input type="number" value={h.xp} onChange={e=>{const n=[...state.habits];n[i]={...n[i],xp:parseInt(e.target.value)||0};up(p=>({...p,habits:n}));}} style={{...inp,width:36,textAlign:"center",color:"#ffd93d",fontSize:10}}/>
          <span onClick={()=>up(p=>({...p,habits:p.habits.filter((_,j)=>j!==i)}))} style={{cursor:"pointer",color:"#ff6b6b",fontSize:11}}>×</span>
        </div>)}
        <div onClick={()=>up(p=>({...p,habits:[...p.habits,{id:`c${Date.now()}`,p:"mind",name:"New Quest",xp:10,desc:""}]}))} style={{marginTop:6,textAlign:"center",padding:6,borderRadius:6,border:"1px dashed rgba(201,160,255,.15)",color:"#c9a0ff",fontSize:9,fontWeight:700,cursor:"pointer"}}>+ Add</div>
        <div onClick={()=>setShowEdit(false)} style={{marginTop:10,textAlign:"center",padding:8,borderRadius:7,background:"#c9a0ff",color:"#0a0a0f",fontSize:11,fontWeight:800,cursor:"pointer"}}>Done</div>
      </div></div>}

      {/* HEADER */}
      <div style={{padding:"20px 20px 10px",textAlign:"center",background:"linear-gradient(180deg,rgba(201,160,255,.035) 0%,transparent 100%)",borderBottom:"1px solid rgba(255,255,255,.025)"}}><div style={{fontSize:6,fontWeight:700,letterSpacing:5,color:"rgba(201,160,255,.35)"}}>THE</div><div style={{fontSize:20,fontWeight:900,letterSpacing:8,color:"#c9a0ff",fontFamily:"'Outfit',sans-serif",textShadow:"0 0 20px rgba(201,160,255,.15)"}}>ASCEND</div><div style={{fontSize:6,fontWeight:700,letterSpacing:6,color:"rgba(255,255,255,.12)"}}>PROTOCOL</div><div style={{display:"inline-flex",marginTop:6,padding:"2px 10px",borderRadius:12,background:`${curPh.c}0c`,border:`1px solid ${curPh.c}18`,fontSize:7,fontWeight:700,letterSpacing:2,color:curPh.c}}>PHASE {curPh.n} — {curPh.nm}</div></div>

      {/* LEVEL */}
      <div style={{padding:"10px 20px",display:"flex",alignItems:"center",gap:10}}><Ring pct={lvl.inL/lvl.need*100} size={52} stroke={4}><div style={{fontSize:15,fontWeight:900,color:"#c9a0ff"}}>{lvl.level}</div></Ring><div style={{flex:1}}><div style={{fontSize:10,fontWeight:800}}>{lvl.title}</div><div style={{fontSize:7,color:"rgba(255,255,255,.22)",fontFamily:mono,marginBottom:3}}>{state.totalXP.toLocaleString()} XP</div><Bar pct={lvl.inL/lvl.need*100}/><div style={{fontSize:6,color:"rgba(255,255,255,.13)",marginTop:1,fontFamily:mono}}>{lvl.inL}/{lvl.need}</div></div></div>
      <div style={{display:"flex",gap:3,padding:"0 20px 8px"}}>{[{l:"DAY",v:dn,c:curPh.c},{l:"STREAK",v:`${streak}🔥`,c:"#ffd93d"},{l:"WEEK",v:`${weekPct}%`,c:"#6bc5ff"},{l:"MONTH",v:`${monthPct}%`,c:"#6bffb8"}].map(s=><div key={s.l} style={{flex:1,textAlign:"center",padding:"7px 2px",borderRadius:8,background:"rgba(255,255,255,.012)",border:"1px solid rgba(255,255,255,.02)"}}><div style={{fontSize:14,fontWeight:900,color:s.c,fontFamily:mono}}>{s.v}</div><div style={{fontSize:5,fontWeight:700,letterSpacing:2,color:"rgba(255,255,255,.18)"}}>{s.l}</div></div>)}</div>

      <div style={{padding:"0 20px",animation:"slideUp .2s ease"}} key={tab+(sub||"")}>

      {/* HOME */}
      {tab==="home"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={sec()}>TODAY'S QUESTS</div><div style={{fontSize:10,fontWeight:900,color:dayPct===100?"#6bffb8":"#c9a0ff",fontFamily:mono}}>{dayPct}%</div></div>
        <Bar pct={dayPct} color={dayPct===100?"#6bffb8":"#c9a0ff"} h={6}/><div style={{fontSize:7,color:"rgba(255,255,255,.13)",marginTop:2,marginBottom:10,fontFamily:mono}}>{compl.length}/{state.habits.length} · +{earnXP}/{maxXP} XP</div>
        {Object.keys(P).map(pk=>{const hs=state.habits.filter(h=>h.p===pk);if(!hs.length)return null;return(<div key={pk} style={{marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}><span style={{color:P[pk].c,fontSize:8}}>{P[pk].i}</span><span style={{fontSize:7,fontWeight:800,letterSpacing:3,color:P[pk].c}}>{P[pk].l}</span></div>{hs.map(h=><HabitRow key={h.id} h={h}/>)}</div>)})}
        <div onClick={()=>setShowEdit(true)} style={{textAlign:"center",padding:6,borderRadius:6,border:"1px solid rgba(201,160,255,.1)",color:"#c9a0ff",fontSize:9,fontWeight:700,cursor:"pointer",marginTop:3}}>✎ Edit</div>
        <div style={{marginTop:14}}><div style={sec()}>DAY {dn} LOG</div><textarea value={state.notes[dKey]||""} onChange={e=>up(p=>({...p,notes:{...p.notes,[dKey]:e.target.value}}))} placeholder="Wins, lessons..." style={{...inp,width:"100%",minHeight:55,resize:"vertical",fontSize:10}}/></div>
      </div>}

      {/* ROUTINE */}
      {tab==="routine"&&<div><div style={sec()}>DAILY PROTOCOL</div>
        {ROUTINE.map((r,i)=>{const isDone=r.hid&&compl.includes(r.hid);const isMeal=r.mid&&ml[r.mid];const done=isDone||isMeal;const pc=P[r.pill]?.c||"#c9a0ff";return(<div key={i} onClick={()=>{if(r.hid)toggleH(r.hid);if(r.mid)toggleM(r.mid);}} style={{display:"flex",gap:8,padding:"7px 9px",marginBottom:2,borderRadius:7,cursor:"pointer",background:done?`${pc}05`:"rgba(255,255,255,.008)",borderLeft:`3px solid ${done?pc:"rgba(255,255,255,.03)"}`,opacity:done?.45:1,userSelect:"none"}}><div style={{minWidth:38}}><div style={{fontSize:8,fontWeight:700,color:pc,fontFamily:mono}}>{r.t}</div><div style={{fontSize:6,color:"rgba(255,255,255,.08)"}}>{r.dur}</div></div><div style={{flex:1,fontSize:10,fontWeight:done?500:600,color:done?"rgba(255,255,255,.2)":"rgba(255,255,255,.7)",textDecoration:done?"line-through":"none"}}>{r.task}</div><div style={{width:14,height:14,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:done?pc:"transparent",border:done?"none":"1.5px solid rgba(255,255,255,.06)",fontSize:8,color:"#0a0a0f"}}>{done&&"✓"}</div></div>);})}
      </div>}

      {/* BODY */}
      {tab==="body"&&<div>
        <div style={{display:"flex",gap:0,marginBottom:10}}>{["workout","metrics"].map(t=><div key={t} onClick={()=>setSub(t)} style={{flex:1,textAlign:"center",padding:"5px 0",cursor:"pointer",borderBottom:`2px solid ${(sub||"workout")===t?"#ff6b6b":"rgba(255,255,255,.025)"}`,color:(sub||"workout")===t?"#ff6b6b":"rgba(255,255,255,.18)",fontSize:8,fontWeight:700,letterSpacing:2}}>{t.toUpperCase()}</div>)}</div>

        {(sub||"workout")==="workout"&&<div>
          <div style={{display:"flex",gap:2,marginBottom:10}}>{DNS.map((d,i)=>{const w=WS[i];const isT=i===((today.getDay()+6)%7);return(<div key={d} style={{flex:1,textAlign:"center",padding:"4px 0",borderRadius:5,background:isT?"rgba(255,107,107,.07)":"rgba(255,255,255,.008)",border:isT?"1px solid rgba(255,107,107,.18)":"1px solid rgba(255,255,255,.015)"}}><div style={{fontSize:6,fontWeight:700,color:isT?"#ff6b6b":"rgba(255,255,255,.15)"}}>{d}</div><div style={{fontSize:5,color:isT?"#ff6b6b":"rgba(255,255,255,.08)",textTransform:"capitalize"}}>{w==="rest"?"🛌":w}</div></div>)})}</div>

          {wType==="rest"?<div style={{textAlign:"center",padding:25}}><div style={{fontSize:28}}>🛌</div><div style={{fontSize:13,fontWeight:800,color:"#6bc5ff",marginTop:6}}>REST DAY</div><div style={{fontSize:9,color:"rgba(255,255,255,.2)",marginTop:4}}>Recovery = Growth</div></div>:<div>
            <div style={{padding:9,marginBottom:8,borderRadius:8,background:"rgba(255,217,61,.025)",border:"1px solid rgba(255,217,61,.06)"}}><div style={{fontSize:8,fontWeight:800,letterSpacing:2,color:"rgba(255,217,61,.45)",marginBottom:4}}>🔥 WARMUP</div>{WARMUP.map((w,i)=><div key={i} style={{fontSize:9,color:"rgba(255,255,255,.3)",padding:"1px 0 1px 6px",borderLeft:"1.5px solid rgba(255,217,61,.08)"}}><span style={{color:"#ffd93d",fontWeight:600}}>{w.name}</span> — {w.dur}</div>)}</div>

            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}><span style={{fontSize:20}}>{wData.em}</span><div><div style={{fontSize:13,fontWeight:800,color:"#ff6b6b"}}>{wData.nm} DAY</div><div style={{fontSize:8,color:"rgba(255,255,255,.2)"}}>{wData.mu}</div></div><div onClick={()=>setShowSOP("gym")} style={{marginLeft:"auto",padding:"3px 8px",borderRadius:5,background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.04)",fontSize:8,color:"rgba(255,255,255,.25)",cursor:"pointer",fontWeight:600}}>SOP</div></div>

            {wData.ex.map((ex,ei)=>{const isExp=expEx===ei;return(<div key={ei} style={{marginBottom:4,padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,.012)",border:"1px solid rgba(255,255,255,.02)"}}>
              <div onClick={()=>setExpEx(isExp?null:ei)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}><div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.75)"}}>{ex.name}</div><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:7,color:"rgba(255,255,255,.12)",fontFamily:mono}}>{ex.sets}×{ex.reps}</span><span style={{fontSize:8,color:"rgba(255,255,255,.1)",transform:isExp?"rotate(180deg)":"none",transition:"transform .2s"}}>▾</span></div></div>
              {isExp&&<div style={{marginTop:5}}><div style={{fontSize:7,color:"rgba(255,255,255,.12)",marginBottom:4}}>Rest: {ex.rest} · {ex.note}</div>{Array.from({length:ex.sets}).map((_,si)=>{const k=`${ei}-${si}`;const log=wLog[k]||{};return(<div key={si} style={{display:"flex",gap:4,alignItems:"center",marginBottom:2}}><div style={{fontSize:6,color:"rgba(255,255,255,.1)",width:16,fontFamily:mono}}>S{si+1}</div><input placeholder="lbs" value={log.weight||""} onChange={e=>logSet(ei,si,"weight",e.target.value)} style={{...inp,width:42,textAlign:"center",color:"#ffd93d",fontFamily:mono,fontSize:9,padding:3}}/><span style={{fontSize:6,color:"rgba(255,255,255,.06)"}}>×</span><input placeholder="reps" value={log.reps||""} onChange={e=>logSet(ei,si,"reps",e.target.value)} style={{...inp,width:32,textAlign:"center",color:"#6bffb8",fontFamily:mono,fontSize:9,padding:3}}/></div>)})}</div>}
            </div>)})}
          </div>}
        </div>}

        {sub==="metrics"&&<div><div style={sec()}>BODY METRICS</div>
          {Object.entries(BODY_MET).map(([key,m])=>{const lat=getLat(key);const wi=Math.min(11,Math.floor((dn-1)/7));const tgt=m.tg[wi]||m.tg[m.tg.length-1];const pct=tgt>m.s?Math.min(100,((lat-m.s)/(tgt-m.s))*100):0;return(<div key={key} style={{padding:8,marginBottom:4,borderRadius:8,background:"rgba(255,255,255,.012)",border:"1px solid rgba(255,255,255,.02)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.65)"}}>{m.l}</div><input type="number" placeholder={String(lat)} onBlur={e=>{if(e.target.value){saveMet(key,e.target.value);e.target.value="";}}} style={{...inp,width:48,textAlign:"center",color:"#ffd93d",fontFamily:mono,fontSize:9,padding:3}}/></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:7,color:"rgba(255,255,255,.12)"}}>Now: {lat}{m.u}</span><span style={{fontSize:7,color:"#c9a0ff"}}>Target: {tgt}{m.u}</span></div><Bar pct={Math.max(0,pct)} color={pct>=100?"#6bffb8":"#c9a0ff"}/>
          </div>)})}
        </div>}
      </div>}

      {/* FUEL */}
      {tab==="fuel"&&<div><div style={sec()}>FUEL TRACKER</div>
        <div style={{display:"flex",gap:5,marginBottom:14,justifyContent:"center"}}>{[{l:"CAL",v:calOk,t:TCAL,c:"#ffd93d"},{l:"PRO",v:`${proOk}g`,t:TPRO,c:"#ff6b6b"},{l:"MEALS",v:mealsOk,t:5,c:"#6bffb8"}].map(x=><div key={x.l} style={{textAlign:"center"}}><Ring pct={(typeof x.v==="number"?x.v:proOk)/x.t*100} size={60} stroke={4} color={x.c}><div style={{fontSize:11,fontWeight:900,color:x.c}}>{x.v}</div><div style={{fontSize:5,color:"rgba(255,255,255,.15)"}}>/{x.t}{x.l==="PRO"?"g":""}</div></Ring><div style={{fontSize:5,fontWeight:700,color:"rgba(255,255,255,.18)",marginTop:2,letterSpacing:1}}>{x.l}</div></div>)}</div>
        {MEALS.map(m=>{const done=ml[m.id];return(<div key={m.id} onClick={()=>toggleM(m.id)} style={{padding:9,marginBottom:3,borderRadius:8,cursor:"pointer",userSelect:"none",background:done?"rgba(107,255,184,.03)":"rgba(255,255,255,.008)",border:`1px solid ${done?"rgba(107,255,184,.08)":"rgba(255,255,255,.02)"}`,opacity:done?.5:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:14,height:14,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",background:done?"#6bffb8":"transparent",border:done?"none":"1.5px solid rgba(255,255,255,.06)",fontSize:8,color:"#0a0a0f"}}>{done&&"✓"}</div><div style={{fontSize:10,fontWeight:700,color:done?"rgba(255,255,255,.25)":"rgba(255,255,255,.7)"}}>{m.nm}</div></div><div style={{fontSize:7,color:"rgba(255,255,255,.12)",fontFamily:mono}}>{m.t}</div></div>
          <div style={{fontSize:8,color:"rgba(255,255,255,.25)",paddingLeft:19}}>{m.food}</div>
          <div style={{display:"flex",gap:6,paddingLeft:19,marginTop:1}}><span style={{fontSize:7,color:"#ffd93d"}}>{m.cal}cal</span><span style={{fontSize:7,color:"#ff6b6b"}}>{m.pro}g</span></div>
        </div>)})}
      </div>}

      {/* MONEY */}
      {tab==="money"&&<div>
        <div style={sec("rgba(255,217,61,.4)")}>FINANCIAL COMMAND</div>
        <div style={{display:"flex",gap:5,marginBottom:12}}>{[{l:"IN",v:totalIn,c:"#6bffb8"},{l:"OUT",v:totalOut,c:"#ff6b6b"},{l:"NET",v:totalIn-totalOut,c:totalIn-totalOut>=0?"#6bffb8":"#ff6b6b"}].map(x=><div key={x.l} style={{flex:1,padding:10,borderRadius:9,background:`${x.c}06`,border:`1px solid ${x.c}10`,textAlign:"center"}}><div style={{fontSize:6,fontWeight:700,letterSpacing:2,color:`${x.c}66`}}>{x.l}</div><div style={{fontSize:17,fontWeight:900,color:x.c,fontFamily:mono}}>${Math.abs(x.v).toLocaleString()}</div></div>)}</div>

        <div style={{padding:9,marginBottom:12,borderRadius:9,background:"rgba(255,107,107,.025)",border:"1px solid rgba(255,107,107,.06)"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:8,fontWeight:700,color:"#ff6b6b"}}>❤️ Mom Repayment</span><span style={{fontSize:9,fontWeight:900,color:"#ff6b6b",fontFamily:mono}}>${totalMomPaid}/$6k</span></div><Bar pct={totalMomPaid/6000*100} color="#ff6b6b"/><div style={{fontSize:7,color:"rgba(255,255,255,.12)",marginTop:2}}>May 22 deadline · ${(6000-totalMomPaid).toLocaleString()} left</div></div>

        <div style={sec()}>REVENUE METRICS</div>
        {Object.entries(MONEY_MET).map(([key,m])=>{const lat=getLat(key);const wi=Math.min(11,Math.floor((dn-1)/7));const tgt=m.tg[wi]||m.tg[m.tg.length-1];const pct=tgt>m.s?Math.min(100,((lat-m.s)/(tgt-m.s))*100):0;return(<div key={key} style={{padding:8,marginBottom:4,borderRadius:8,background:"rgba(255,255,255,.012)",border:"1px solid rgba(255,255,255,.02)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}><span style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.65)"}}>{m.l}</span><input type="number" placeholder={String(lat)} onBlur={e=>{if(e.target.value){saveMet(key,e.target.value);e.target.value="";}}} style={{...inp,width:50,textAlign:"center",color:"#ffd93d",fontFamily:mono,fontSize:9,padding:3}}/></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:7,color:"rgba(255,255,255,.12)"}}>Now: {m.u}{lat}</span><span style={{fontSize:7,color:"#ffd93d"}}>Target: {m.u}{tgt}</span></div><Bar pct={Math.max(0,pct)} color={pct>=100?"#6bffb8":"#ffd93d"}/>
        </div>)})}

        <div style={{...sec(),marginTop:10}}>ADD TRANSACTION</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:5}}>
          <select value={txForm.cat} onChange={e=>setTxForm({...txForm,cat:e.target.value})} style={{...inp,flex:"1 1 90px",fontSize:9}}>{BUDGET_CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>
          <input type="number" placeholder="$" value={txForm.amount} onChange={e=>setTxForm({...txForm,amount:e.target.value})} style={{...inp,width:55,textAlign:"center",color:"#ffd93d",fontSize:10}}/>
          <input placeholder="Note" value={txForm.note} onChange={e=>setTxForm({...txForm,note:e.target.value})} style={{...inp,flex:"1 1 60px",fontSize:9}}/>
          <div onClick={addTx} style={{padding:"5px 10px",borderRadius:5,background:"#ffd93d",color:"#0a0a0f",fontSize:10,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center"}}>+</div>
        </div>

        <div style={{...sec(),marginTop:10}}>BUDGET</div>
        {BUDGET_CATS.filter(c=>c.type==="out"&&c.budget>0).map(c=>{const spent=monthTx.filter(t=>t.cat===c.id).reduce((s,t)=>s+t.amount,0);return(<div key={c.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><span style={{fontSize:10}}>{c.icon}</span><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}><span style={{fontSize:8,color:"rgba(255,255,255,.4)"}}>{c.name}</span><span style={{fontSize:8,color:spent>c.budget?"#ff6b6b":"rgba(255,255,255,.25)",fontFamily:mono}}>${spent}/${c.budget}</span></div><Bar pct={c.budget>0?spent/c.budget*100:0} color={spent>c.budget?"#ff6b6b":"#6bffb8"} h={3}/></div></div>)})}

        {state.transactions.length>0&&<div style={{marginTop:10}}><div style={sec()}>RECENT</div>
          {[...state.transactions].reverse().slice(0,8).map(t=>{const cat=BUDGET_CATS.find(c=>c.id===t.cat);return(<div key={t.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.015)"}}><span style={{fontSize:9}}>{cat?.icon||"📦"}</span><div style={{flex:1}}><div style={{fontSize:9,color:"rgba(255,255,255,.4)"}}>{cat?.name}{t.note?` — ${t.note}`:""}</div></div><span style={{fontSize:10,fontWeight:700,color:t.type==="in"?"#6bffb8":"#ff6b6b",fontFamily:mono}}>{t.type==="in"?"+":"−"}${t.amount}</span><span onClick={()=>delTx(t.id)} style={{cursor:"pointer",color:"rgba(255,255,255,.08)",fontSize:9,padding:"0 2px"}}>×</span></div>)})}
        </div>}
      </div>}

      {/* MAP */}
      {tab==="map"&&<div>
        <div style={sec()}>90-DAY ROADMAP</div>
        <div style={{position:"relative",marginBottom:16}}><div style={{height:3,borderRadius:2,background:"rgba(255,255,255,.035)"}}><div style={{height:"100%",borderRadius:2,background:"linear-gradient(90deg,#ff6b6b,#ffd93d,#6bffb8)",width:`${Math.min(100,dn/90*100)}%`}}/></div><div style={{position:"absolute",top:-4,left:`${Math.min(96,dn/90*100)}%`,width:11,height:11,borderRadius:6,background:"#c9a0ff",border:"2px solid #08080f",animation:"pulse 2s infinite"}}/></div>
        {ROADMAP.map((w,i)=>{const isCur=curWeek===w.w;const isPast=curWeek>w.w;const pc=w.ph===1?"#ff6b6b":w.ph===2?"#ffd93d":"#6bffb8";return(<div key={i} style={{padding:10,marginBottom:4,borderRadius:9,background:isCur?`${pc}05`:"rgba(255,255,255,.008)",border:`1px solid ${isCur?`${pc}15`:"rgba(255,255,255,.018)"}`,opacity:isPast?.35:1}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><div style={{display:"flex",alignItems:"center",gap:4}}>{isCur&&<div style={{width:5,height:5,borderRadius:3,background:pc,animation:"pulse 1.5s infinite"}}/>}<span style={{fontSize:10,fontWeight:800,color:pc}}>W{w.w} {w.title}</span></div><span style={{fontSize:6,color:"rgba(255,255,255,.1)",fontFamily:mono}}>D{w.d}</span></div>
          <div style={{fontSize:7,color:"rgba(255,255,255,.18)",marginBottom:3}}>🏋️{w.body} 💰{w.wealth}</div>
          {w.ms.map((m,j)=><div key={j} style={{fontSize:8,color:"rgba(255,255,255,.25)",paddingLeft:6,borderLeft:"1.5px solid rgba(255,255,255,.025)",marginBottom:1}}>{m}</div>)}
          <div style={{marginTop:5,padding:"5px 7px",borderRadius:5,background:`${pc}05`,fontSize:8,fontWeight:700,color:pc}}>⚔️ {w.boss}</div>
        </div>)})}
      </div>}

      {/* TOOLS */}
      {tab==="tools"&&<div>
        <div style={sec()}>SOPs</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:16}}>
          {Object.entries(SOPS).map(([key,sop])=><div key={key} onClick={()=>setShowSOP(key)} style={{padding:12,borderRadius:9,background:"rgba(255,255,255,.012)",border:"1px solid rgba(255,255,255,.025)",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:20,marginBottom:3}}>{sop.icon}</div><div style={{fontSize:9,fontWeight:700,color:"#c9a0ff"}}>{sop.title}</div></div>)}
        </div>

        <div style={sec()}>HACKS TOOLKIT</div>
        {HACKS.map((cat,ci)=><div key={ci} style={{marginBottom:12}}>
          <div style={{fontSize:8,fontWeight:800,letterSpacing:2,color:"#6bc5ff",marginBottom:5}}>{cat.cat.toUpperCase()}</div>
          {cat.items.map((h,hi)=><div key={hi} style={{padding:8,marginBottom:3,borderRadius:7,background:"rgba(255,255,255,.008)",border:"1px solid rgba(255,255,255,.02)"}}>
            <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.7)",marginBottom:1}}>{h.name}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,.3)",lineHeight:1.4}}>{h.how}</div>
            <div style={{fontSize:7,color:"#6bc5ff",marginTop:2,fontWeight:600}}>When: {h.when}</div>
          </div>)}
        </div>)}
      </div>}

      {/* SOUL */}
      {tab==="soul"&&<div>
        <div style={{textAlign:"center",marginBottom:14}}><div style={{fontSize:6,fontWeight:700,letterSpacing:5,color:"rgba(201,160,255,.3)"}}>THE</div><div style={{fontSize:16,fontWeight:900,letterSpacing:4,color:"#c9a0ff",fontFamily:"'Outfit',sans-serif"}}>ALCHEMY OF SELF</div><div style={{fontSize:7,color:"rgba(255,255,255,.12)",marginTop:3}}>Who you are becoming. Read daily.</div></div>

        <div style={{padding:14,marginBottom:8,borderRadius:10,background:"linear-gradient(135deg,rgba(107,255,184,.03),rgba(201,160,255,.03))",border:"1px solid rgba(107,255,184,.08)"}}>
          <div style={{fontSize:8,fontWeight:800,letterSpacing:3,color:"#6bffb8",marginBottom:6}}>🌟 THE VISION</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.55)",lineHeight:1.7}}>July 2026. 185 pounds lean at 6'4". Ascend Agency generating $7-10k/month for coaches and creators. 10+ clients. Systems run the business — I'm a CEO. Mom flew to Nigeria with $6k in hand. Car fixed. $5k+ saved. Financially free for the first time. Disciplined, focused, building something that lasts decades. Proof that 90 days can change everything.</div>
        </div>

        <div style={{padding:14,marginBottom:8,borderRadius:10,background:"rgba(255,107,107,.03)",border:"1px solid rgba(255,107,107,.08)"}}>
          <div style={{fontSize:8,fontWeight:800,letterSpacing:3,color:"#ff6b6b",marginBottom:6}}>💀 THE ANTI-VISION</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.45)",lineHeight:1.7}}>July 2026. Still 163. Still broke. Mom left disappointed. Car still broken. Looking for another job. Scrolling for hours watching others build what I wanted. Same excuses. Same results. Same person. Nothing changed because I didn't. This version is dead. I refuse to let him exist.</div>
        </div>

        <div style={{padding:14,marginBottom:8,borderRadius:10,background:"rgba(201,160,255,.03)",border:"1px solid rgba(201,160,255,.08)"}}>
          <div style={{fontSize:8,fontWeight:800,letterSpacing:3,color:"#c9a0ff",marginBottom:6}}>🔮 CORE IDENTITY</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.5)",lineHeight:1.7}}>I am the Empire Builder. I create value so massive that money is a byproduct. Hardest worker in every room. My body is a machine — I fuel it, train it, push it daily. I don't wait for motivation. I execute. Disciplined when easy, especially when hard. I build systems, not sandcastles. Long-term games. My family counts on me because I show up every single day.</div>
        </div>

        <div style={{padding:14,marginBottom:8,borderRadius:10,background:"rgba(107,197,255,.03)",border:"1px solid rgba(107,197,255,.08)"}}>
          <div style={{fontSize:8,fontWeight:800,letterSpacing:3,color:"#6bc5ff",marginBottom:6}}>🧠 INTRINSIC</div>
          {["Know what I'm capable of when I go all-in with zero excuses.","Look in the mirror and respect who looks back.","Master my mind — discipline over comfort, every time.","Prove I can build something from nothing.","The quiet confidence from doing hard things consistently.","Become someone my future kids would be proud of."].map((m,i)=><div key={i} style={{fontSize:9,color:"rgba(255,255,255,.45)",padding:"3px 0 3px 8px",borderLeft:"1.5px solid rgba(107,197,255,.12)",marginBottom:2,lineHeight:1.4}}>{m}</div>)}
        </div>

        <div style={{padding:14,marginBottom:8,borderRadius:10,background:"rgba(255,217,61,.03)",border:"1px solid rgba(255,217,61,.08)"}}>
          <div style={{fontSize:8,fontWeight:800,letterSpacing:3,color:"#ffd93d",marginBottom:6}}>💰 EXTRINSIC</div>
          {["Pay Mom $6k before May 22.","Fix car — tie rod, tire/rim, bumper. Full independence.","$7-10k/month by Day 90.","185-190 lbs at 6'4\".","Ascend Agency with systems and real clients.","Never ask anyone for money again."].map((m,i)=><div key={i} style={{fontSize:9,color:"rgba(255,255,255,.45)",padding:"3px 0 3px 8px",borderLeft:"1.5px solid rgba(255,217,61,.12)",marginBottom:2,lineHeight:1.4}}>{m}</div>)}
        </div>

        <div style={{padding:14,marginBottom:8,borderRadius:10,background:"rgba(255,255,255,.015)",border:"1px solid rgba(255,255,255,.03)"}}>
          <div style={{fontSize:8,fontWeight:800,letterSpacing:3,color:"rgba(255,255,255,.3)",marginBottom:6}}>⚔️ NON-NEGOTIABLES</div>
          {["Train every scheduled day. No exceptions.","5 meals, 3200 cal. Body is a project.","2 hrs revenue work before anything else.","No passive scrolling. Every minute has purpose.","Journal every night. Self-awareness is a weapon.","No complaining. No blaming. Own everything.","Rest on rest days. Recovery is discipline.","Read Vision + Anti-Vision every morning.","When I want to quit: one more rep, message, meal.","Nobody is coming. I am the rescue."].map((r,i)=><div key={i} style={{fontSize:9,color:"rgba(255,255,255,.42)",padding:"3px 0 3px 8px",borderLeft:"1.5px solid rgba(255,255,255,.05)",marginBottom:2,lineHeight:1.4}}>{r}</div>)}
        </div>

        <div style={{padding:14,borderRadius:10,background:"rgba(201,160,255,.02)",border:"1px solid rgba(201,160,255,.06)"}}>
          <div style={{fontSize:8,fontWeight:800,letterSpacing:3,color:"rgba(201,160,255,.35)",marginBottom:6}}>🔄 HABITS → IDENTITY</div>
          {[{h:"Train daily",id:"I am an athlete",p:"body"},{h:"5 meals / 3200 cal",id:"I fuel a machine",p:"body"},{h:"2-hr revenue block",id:"I generate revenue daily",p:"wealth"},{h:"Create content",id:"I ship every day",p:"wealth"},{h:"Morning priming",id:"I program my mind first",p:"mind"},{h:"Journal",id:"I learn from every day",p:"mind"},{h:"No scrolling",id:"I protect my attention",p:"mind"},{h:"Gratitude",id:"I focus on abundance",p:"happiness"}].map((x,i)=><div key={i} style={{display:"flex",gap:5,alignItems:"center",marginBottom:3}}><div style={{flex:1,fontSize:8,color:P[x.p].c,fontWeight:600}}>{x.h}</div><div style={{fontSize:8,color:"rgba(255,255,255,.12)"}}>→</div><div style={{flex:1,fontSize:8,color:"rgba(255,255,255,.38)",fontStyle:"italic"}}>"{x.id}"</div></div>)}
        </div>

        {/* Story */}
        <div style={{marginTop:16}}>
          <div style={sec()}>THE CHRONICLE</div>
          <div style={{padding:16,borderRadius:10,marginBottom:10,background:"linear-gradient(135deg,rgba(201,160,255,.04),rgba(107,197,255,.02))",border:"1px solid rgba(201,160,255,.08)",animation:"glow 4s infinite"}}>
            <div style={{fontSize:7,fontWeight:700,letterSpacing:3,color:"rgba(255,255,255,.18)"}}>DAY {curStory.day}</div>
            <div style={{fontSize:14,fontWeight:900,color:"#c9a0ff",marginBottom:6,fontFamily:"'Outfit',sans-serif"}}>{curStory.t}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.5)",lineHeight:1.7,fontStyle:"italic"}}>{curStory.x}</div>
          </div>
          {Object.entries(STORY).sort((a,b)=>Number(a[0])-Number(b[0])).map(([day,s])=>{const unlocked=dn>=Number(day);return(<div key={day} style={{padding:9,marginBottom:3,borderRadius:8,background:"rgba(255,255,255,.008)",border:"1px solid rgba(255,255,255,.02)",opacity:unlocked?1:.25}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:9,fontWeight:700,color:unlocked?"#c9a0ff":"rgba(255,255,255,.2)"}}>{s.t}</span><span style={{fontSize:7,color:"rgba(255,255,255,.1)"}}>Day {day} {!unlocked?"🔒":Number(day)===curStory.day?"▶":""}</span></div>
          </div>)})}
        </div>
      </div>}

      </div>

      {/* NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:540,display:"flex",background:"rgba(8,8,15,.96)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,.025)",padding:"3px 0 6px",zIndex:100}}>
        {TABS.map(t=><div key={t.id} onClick={()=>{setTab(t.id);setSub(null);setExpEx(null);}} style={{flex:1,textAlign:"center",padding:"2px 0",cursor:"pointer"}}><div style={{fontSize:14,filter:tab===t.id?"none":"grayscale(1) opacity(.28)"}}>{t.ic}</div><div style={{fontSize:4.5,fontWeight:700,letterSpacing:.5,color:tab===t.id?"#c9a0ff":"rgba(255,255,255,.08)"}}>{t.nm}</div></div>)}
      </div>
    </div>
  );
}
