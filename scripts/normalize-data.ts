import {writeFileSync} from 'node:fs';
import {loadData} from './validate-data';
import {pricePerTon} from '../src/lib/calculations';
const data=loadData();
writeFileSync('docs/normalized-offers.json',JSON.stringify(data.offers.map(o=>({id:o.id,pricePerTon:pricePerTon(o.price,o.weightKg),vatIncluded:o.vatIncluded,delivery:o.delivery})),null,2));
console.log('Normalized offers written to docs/normalized-offers.json');
