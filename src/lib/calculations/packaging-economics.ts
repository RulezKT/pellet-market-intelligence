import Decimal from 'decimal.js';
import {z} from 'zod';
import type {Offer,Product} from '../validation';
const amount=z.number().min(0).max(1e9);
export const PackagingEconomicsSchema=z.object({
 version:z.literal(1),offerId:z.string().nullable(),bagKg:z.number().positive().max(1000),bags:z.number().int().positive().max(100000),salePrice:amount,saleBasis:z.enum(['bag','pallet']),saleGross:z.boolean(),saleVat:z.number().min(0).max(1),
 bulkPrice:amount,buyGross:z.boolean(),buyVat:z.number().min(0).max(1),readyPrice:amount,readyGross:z.boolean(),readyVat:z.number().min(0).max(1),
 bagCost:amount,palletCost:amount,kwh:amount,electricity:amount,labour:amount,warehouse:amount,delivery:amount,other:amount,loss:z.number().min(0).lt(1),commission:z.number().min(0).lt(1),fixedMonth:amount,monthlyTonnes:amount,yearlyTonnes:amount,
 optimistic:z.number().min(0).max(.9),pessimistic:z.number().min(0).max(.9),scenario:z.enum(['base','optimistic','pessimistic'])
});
export type PackagingEconomicsInput=z.infer<typeof PackagingEconomicsSchema>;
export const PACKAGING_KEY='pmi-packaging-economics-v1';
export const packagingDefaults:PackagingEconomicsInput={version:1,offerId:null,bagKg:15,bags:65,salePrice:6,saleBasis:'bag',saleGross:true,saleVat:.07,bulkPrice:250,buyGross:false,buyVat:.07,readyPrice:350,readyGross:false,readyVat:.07,bagCost:.28,palletCost:12,kwh:12,electricity:.22,labour:20,warehouse:8,delivery:25,other:5,loss:.015,commission:.05,fixedMonth:1500,monthlyTonnes:100,yearlyTonnes:1200,optimistic:.1,pessimistic:.1,scenario:'base'};
const D=(n:Decimal.Value)=>new Decimal(n);
export function calculatePackagingEconomics(raw:PackagingEconomicsInput){
 const p=PackagingEconomicsSchema.parse(raw);const net=(v:number,gross:boolean,vat:number)=>gross?D(v).div(D(1).plus(vat)):D(v);
 const mass=D(p.bagKg).mul(p.bags);const tonnes=mass.div(1000);
 const shock=p.scenario==='optimistic'?-p.optimistic:p.scenario==='pessimistic'?p.pessimistic:0;
 const factor=D(1).plus(shock);const saleFactor=D(1).minus(shock);
 const revenue=net(p.salePrice,p.saleGross,p.saleVat).mul(p.saleBasis==='bag'?p.bags:1).mul(saleFactor);
 const saleGross=revenue.mul(D(1).plus(p.saleVat));const commission=revenue.mul(p.commission);
 const bulk=net(p.bulkPrice,p.buyGross,p.buyVat).mul(tonnes).div(D(1).minus(p.loss)).mul(factor);
 const ready=net(p.readyPrice,p.readyGross,p.readyVat).mul(tonnes).mul(factor);
 const common={warehouse:D(p.warehouse).mul(tonnes).mul(factor),delivery:D(p.delivery).mul(tonnes).mul(factor),other:D(p.other).mul(tonnes).mul(factor),commission};
 const packaging={raw:bulk,bags:D(p.bagCost).mul(p.bags).mul(factor),pallet:D(p.palletCost).mul(factor),electricity:D(p.kwh).mul(p.electricity).mul(tonnes).mul(factor),labour:D(p.labour).mul(tonnes).mul(factor),...common};
 const resale={ready,...common};
 function model(parts:Record<string,Decimal>){
  const variable=Object.values(parts).reduce((a,b)=>a.plus(b),D(0));const contribution=revenue.minus(variable);const contributionPerTon=contribution.div(tonnes);
  const fixed=p.monthlyTonnes?D(p.fixedMonth).mul(factor).div(p.monthlyTonnes).mul(tonnes):null;
  const cost=fixed?variable.plus(fixed):p.fixedMonth===0?variable:null;
  const result=cost?revenue.minus(cost):null;
  const fixedAnnual=D(p.fixedMonth).mul(12).mul(factor);const month=contributionPerTon.mul(p.monthlyTonnes).minus(D(p.fixedMonth).mul(factor));const year=contributionPerTon.mul(p.yearlyTonnes).minus(fixedAnnual);
  const commissionFree=variable.minus(commission);
  return {parts:Object.fromEntries(Object.entries(parts).map(([k,v])=>[k,v.toNumber()])),variable:variable.toNumber(),cost:cost?.toNumber()??null,costPerTon:cost?.div(tonnes).toNumber()??null,result:result?.toNumber()??null,resultPerTon:result?.div(tonnes).toNumber()??null,margin:result&&!revenue.isZero()?result.div(revenue).toNumber():null,contribution:contribution.toNumber(),month:month.toNumber(),year:year.toNumber(),breakEvenTonnes:contributionPerTon.gt(0)?D(p.fixedMonth).mul(factor).div(contributionPerTon).toNumber():p.fixedMonth===0?0:null,breakEvenSale:cost?commissionFree.plus(fixed??0).div(D(1).minus(p.commission)).toNumber():null};
 }
 const a=model(resale),b=model(packaging);const delta=(a:number|null,b:number|null)=>a===null||b===null?null:D(b).minus(a).toNumber();
 return {massKg:mass.toNumber(),tonnes:tonnes.toNumber(),revenue:revenue.toNumber(),saleGross:saleGross.toNumber(),saleVat:saleGross.minus(revenue).toNumber(),bulkNetPerTon:net(p.bulkPrice,p.buyGross,p.buyVat).mul(factor).toNumber(),bulkGrossPerTon:net(p.bulkPrice,p.buyGross,p.buyVat).mul(factor).mul(D(1).plus(p.buyVat)).toNumber(),inputTonnes:tonnes.div(D(1).minus(p.loss)).toNumber(),a,b,delta:{pallet:delta(a.result,b.result),tonne:delta(a.resultPerTon,b.resultPerTon),month:delta(a.month,b.month),year:delta(a.year,b.year)}};
}
export function applyRetailOffer(current:PackagingEconomicsInput,offer:Offer,product:Product):PackagingEconomicsInput{
 if(offer.productId!==product.id)throw new Error('Offer/product mismatch');
 const bags=offer.type==='pallet'?offer.weightKg/product.bagKg:current.bags;
 if(!Number.isInteger(bags)||bags<=0)throw new Error('Pallet mass is inconsistent with whole bags');
 return PackagingEconomicsSchema.parse({...current,offerId:offer.id,bagKg:product.bagKg,bags,salePrice:offer.type==='pallet'?offer.price:D(offer.price).mul(product.bagKg).div(offer.weightKg).toNumber(),saleBasis:offer.type==='pallet'?'pallet':'bag',saleGross:offer.vatIncluded,saleVat:offer.vat??current.saleVat,readyPrice:D(offer.price).div(offer.weightKg).mul(1000).toNumber(),readyGross:offer.vatIncluded,readyVat:offer.vat??current.readyVat});
}
export function packagingCsv(p:PackagingEconomicsInput,provenance:Record<string,string|number|null>={}){
 const r=calculatePackagingEconomics(p);const rows:(string|number|null)[][]=[['Pellet Packaging Economics','Model assumptions / not net profit'],['Scenario',p.scenario],['Offer ID',p.offerId],...Object.entries(provenance),['Metric','A resale','B packaging','B minus A'],['Mass kg',r.massKg,r.massKg,0],['Revenue net / pallet',r.revenue,r.revenue,0],['Cost net / pallet',r.a.cost,r.b.cost,null],['Result / pallet',r.a.result,r.b.result,r.delta.pallet],['Result / tonne',r.a.resultPerTon,r.b.resultPerTon,r.delta.tonne],['Result / month',r.a.month,r.b.month,r.delta.month],['Result / year',r.a.year,r.b.year,r.delta.year],['Return on sales',r.a.margin,r.b.margin,null],['Break-even tonnes / month',r.a.breakEvenTonnes,r.b.breakEvenTonnes,null],['Break-even sale net / pallet',r.a.breakEvenSale,r.b.breakEvenSale,null],['Sale gross / pallet',r.saleGross],['Sale VAT / pallet',r.saleVat],['Input','Value'],...Object.entries(p).map(([k,v])=>[k,String(v)]),['B cost item','Net EUR / pallet'],...Object.entries(r.b.parts)];
 const quote=(v:string|number|null)=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';return '\uFEFF'+rows.map(row=>row.map(quote).join(',')).join('\r\n');
}
