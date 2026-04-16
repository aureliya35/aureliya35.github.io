export type Module = { id:string; name:string; category:string; description:string; status:'ready'|'planned' };
export const modules: Module[] = [
{id:'home',name:'Home Dashboard',category:'Core',status:'ready',description:'Launch screen, navigation, search, and system overview.'},
{id:'assistant',name:'AI Assistant',category:'Core',status:'ready',description:'Chat-style workspace for drafting, summarizing, and planning.'},
{id:'files',name:'Files Vault',category:'Core',status:'ready',description:'Upload-oriented file organization interface.'},
{id:'settings',name:'Settings',category:'Core',status:'ready',description:'User profile, preferences, privacy controls, and app configuration.'},
{id:'crm',name:'Opportunity CRM',category:'Business',status:'planned',description:'Track outreach, contacts, follow-ups, and partnerships.'},
{id:'finance',name:'Finance Dashboard',category:'Business',status:'planned',description:'Budgeting, revenue tracking, grant logging, and reports.'},
{id:'legal',name:'Document Hub',category:'Admin',status:'planned',description:'Templates, storage, and compliance reminders.'},
{id:'travel',name:'Travel Planner',category:'Operations',status:'planned',description:'Trip requests, vendors, itineraries, and logistics notes.'},
{id:'beauty',name:'MirrorMe Lite',category:'Personal',status:'planned',description:'Non-medical image/camera reflection tools and wellness notes.'},
{id:'events',name:'Event Command Center',category:'Business',status:'planned',description:'Luxury event planning checklists, vendors, and timelines.'},
{id:'vendors',name:'Vendor Directory',category:'Business',status:'planned',description:'Preferred vendors, quotes, ratings, and contact history.'},
{id:'press',name:'Press Kit Builder',category:'Brand',status:'planned',description:'Generate press bios, media pages, and outreach assets.'},
{id:'content',name:'Content Studio',category:'Brand',status:'planned',description:'Social posts, scripts, campaigns, and editorial calendar.'},
{id:'calendar',name:'Calendar Hub',category:'Productivity',status:'planned',description:'Events, reminders, scheduling, and follow-up planning.'},
{id:'tasks',name:'Task Manager',category:'Productivity',status:'planned',description:'To-dos, priorities, projects, and recurring workflows.'},
{id:'notes',name:'Notes Library',category:'Productivity',status:'planned',description:'Searchable notes, saved ideas, and structured references.'},
{id:'resume',name:'Career Studio',category:'Career',status:'planned',description:'Resumes, cover letters, job tracking, and interview prep.'},
{id:'school',name:'Academic Hub',category:'Education',status:'planned',description:'Assignments, rubrics, citations, and study workflows.'},
{id:'health-notes',name:'Health Notes',category:'Personal',status:'planned',description:'Personal notes and appointment questions; not medical diagnosis.'},
{id:'privacy',name:'Privacy Center',category:'Admin',status:'planned',description:'Data permissions, export, retention, and transparency controls.'}
];
