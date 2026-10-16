import {writeFileSync,mkdirSync} from 'node:fs';
import {loadData} from './validate-data';
import {adapters,acceptObservation} from '../src/lib/adapters';
import {DataSchema} from '../src/lib/validation';
const data=loadData();const report:{id:string;state:string;detail?:string}[]=[];
for(const source of data.sources){
 // Permission gate applies to availability requests too. No requests to unapproved sources.
 const adapter=adapters.find(a=>a.id===source.id&&a.permitted);
 if(!adapter){report.push({id:source.id,state:'not-connected',detail:'Automated access/reuse permission not established. Manual import available.'});continue;}
 try{const incoming=await adapter.collect();for(const offer of incoming){const existing=data.offers.find(o=>o.id===offer.id);if(!existing)throw new Error('Unknown offer: register product first');const next=acceptObservation(existing,offer);if(next.changed)data.history.push({offerId:offer.id,price:offer.price,weightKg:offer.weightKg,observedAt:offer.checkedAt,source:offer.source});Object.assign(existing,next.offer);}source.checkedAt=new Date().toISOString();source.status='automated';report.push({id:source.id,state:'ok'});}catch(error){report.push({id:source.id,state:'failed',detail:(error as Error).message});}
}
DataSchema.parse(data);
for(const [key,filename] of [['offers','offers'],['history','price-history'],['sources','sources']] as const)writeFileSync('src/data/'+filename+'.json',JSON.stringify(data[key],null,2)+'\n');
mkdirSync('reports',{recursive:true});writeFileSync('reports/collection.json',JSON.stringify({checkedAt:new Date().toISOString(),sources:report},null,2));console.log(JSON.stringify(report,null,2));
