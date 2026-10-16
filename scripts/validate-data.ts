import {readFileSync} from 'node:fs';
import {DataSchema} from '../src/lib/validation';
const load=(f:string)=>JSON.parse(readFileSync(new URL('../src/data/'+f+'.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
export function loadData(){return DataSchema.parse({products:load('products'),offers:load('offers'),manufacturers:load('manufacturers'),history:load('price-history'),indices:load('market-indices'),sources:load('sources')});}
if(process.argv[1]?.endsWith('validate-data.ts')){const data=loadData();console.log('Valid:',data.products.length,'products,',data.offers.length,'offers,',data.history.length,'observations');}
