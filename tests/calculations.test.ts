import {describe,it,expect} from 'vitest';
import * as c from '../src/lib/calculations';
import {defaults} from '../src/lib/defaults';
import {readScenario} from '../src/lib/storage';
import {data} from '../src/data';
import {DataSchema,effectiveStatus} from '../src/lib/validation';
import {acceptObservation} from '../src/lib/adapters';
describe('packaging and monetary normalization',()=>{
 it.each([[10,10,1000],[15,7.39,492.6666666666667],[20,10,500]])('normalizes %s kg', (kg,price,expected)=>expect(c.pricePerTon(price,kg)).toBeCloseTo(expected,8));
 it('handles incomplete pallet and whole bags separately',()=>{expect(c.pallet(5,15,65)).toEqual({kg:975,price:325,perTon:333.3333333333333});expect(c.purchase(7.39,15,1000)).toEqual({count:67,kg:1005,cost:495.13});expect(c.bagPrice(400,15)).toBe(6);});
 it('uses VAT from source, never a universal tax rate',()=>{expect(c.net(107,.07)).toBe(100);expect(c.net(119,.19)).toBe(100)});
 it('distinguishes included, unknown and quoted freight',()=>{expect(c.delivery(100,1,0).total).toBe(100);expect(c.delivery(100,1,null).total).toBeNull();expect(c.delivery(100,2,20,5,10,3)).toEqual({total:138,perTon:69});});
 it('rejects invalid units',()=>{expect(()=>c.pricePerTon(10,0)).toThrow();expect(()=>c.pricePerTon(10,-1)).toThrow();expect(()=>c.pricePerTon(NaN,1)).toThrow();});
});
describe('economics',()=>{
 it('distinguishes margin and markup',()=>{const r=c.profitability(80,100,10);expect(r.margin).toBe(.2);expect(r.markup).toBe(.25);expect(r.result).toBe(200)});
 it('handles negative profit and absent payback',()=>{const r=c.profitability(100,90,10,500,1000);expect(r.result).toBe(-600);expect(r.breakEven).toBeNull();expect(r.payback).toBeNull();});
 it('charges packaging losses to saleable tonnes',()=>{const a=c.packaging({...defaults.packaging,loss:0});const b=c.packaging({...defaults.packaging,loss:.1});expect(b.variable).toBeGreaterThan(a.variable);expect(b.variable-a.variable).toBeCloseTo((defaults.packaging.buy+defaults.packaging.transport)/9);});
 it('handles idle packaging and factory',()=>{const p=c.packaging({...defaults.packaging,utilization:0});expect(p.full).toBeNull();expect(p.result).toBe(-defaults.packaging.fixed);const f=c.factory({...defaults.factory,unit:'t',utilization:0});expect(f.annual).toBe(0);expect(f.full).toBeNull();expect(f.payback).toBeNull();expect(f.result).toBeLessThan(0);expect(Object.values(f).filter(x=>typeof x==='number').every(Number.isFinite)).toBe(true)});
 it('computes annual output, base load and break-even',()=>{const f=c.factory({...defaults.factory,unit:'t'});expect(f.annual).toBeCloseTo(31104);expect(f.kwhAnnual).toBeCloseTo(140*31104+40*8*3*300*.9);expect(f.full).toBeCloseTo(f.variable+f.fixed/f.annual);});
});
describe('physical balance',()=>{
 it('conserves dry matter with wet-basis moisture',()=>{const b=c.materialBalance(1,.5,.08,0);expect(b.dry).toBe(.5);expect(b.output).toBeCloseTo(.5/.92);expect(b.water).toBeCloseTo(1-b.output);});
 it('tracks dry losses separately from evaporated water',()=>{const b=c.materialBalance(1,.5,.08,.1);expect(b.dryLoss).toBeCloseTo(.05);expect(b.output+b.water+b.dryLoss).toBeCloseTo(1);});
 it('wet sawdust uses more feedstock than dry sawdust',()=>{expect(c.materialBalance(1,.5,.08,.03).wetPerTon).toBeGreaterThan(c.materialBalance(1,.12,.08,.03).wetPerTon)});
 it('converts volume using wet density and prices useful heat',()=>{expect(c.feedstockPrice(30,'loose-m3',.3)).toBe(100);expect(c.heatCost(60,3,.8)).toBeCloseTo(25);expect(c.drying(1,900,50)).toBe(45);expect(c.energy(140,.2,1000).annual).toBe(28000);});
 it('rejects impossible moisture and boiler efficiency',()=>{expect(()=>c.materialBalance(1,1,.08,0)).toThrow();expect(()=>c.heatCost(10,3,0)).toThrow();expect(()=>c.heatCost(10,3,1.2)).toThrow();});
});
describe('data and scenarios',()=>{
 it('validates shipped data',()=>expect(DataSchema.parse(data).offers).toHaveLength(2));
 it('rejects broken relationships and invalid monetary data',()=>{expect(()=>DataSchema.parse({...data,offers:[{...data.offers[0],productId:'missing'}]})).toThrow();expect(()=>DataSchema.parse({...data,offers:[{...data.offers[0],price:NaN}]})).toThrow();});
 it('round-trips scenario and rejects incomplete or malicious imports',()=>{expect(readScenario(JSON.stringify(defaults))).toEqual(defaults);expect(()=>readScenario('{')).toThrow();expect(()=>readScenario(JSON.stringify({...defaults,factory:{}}))).toThrow();expect(()=>readScenario(JSON.stringify({...defaults,factory:{...defaults.factory,initial:1}}))).toThrow();expect(()=>readScenario(JSON.stringify({...defaults,logistics:{...defaults.logistics,load:0}}))).toThrow();});
 it('ages verified offers without losing last known price',()=>expect(effectiveStatus(data.offers[0],Date.parse(data.offers[0].checkedAt)+8*86400000)).toBe('stale'));
 it('only creates events when commercial terms change',()=>{const o=data.offers[0];expect(acceptObservation(o,{...o,checkedAt:'2026-10-17T11:00:00Z'}).changed).toBe(false);expect(acceptObservation(o,{...o,price:o.price+1}).changed).toBe(true);expect(()=>acceptObservation(o,{...o,productId:'other'})).toThrow()});
 it('scores zero weights without division by zero',()=>expect(c.locationScore([5,5],[0,0])).toBeNull());
});
