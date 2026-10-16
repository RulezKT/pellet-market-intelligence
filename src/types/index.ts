export type {Product,Offer,Manufacturer,Source} from '../lib/validation';
export type {FactoryInput} from '../lib/calculations';
export interface ManufacturingSite {id:string;manufacturerId:string;address:string;capacityTonnes:number|null}
export interface Brand {id:string;name:string;ownerId:string|null}
export interface Seller {id:string;name:string;source:string}
export interface Certificate {name:string;number:string|null;source:string}
export interface ShippingQuote {offerId:string;postcode:string;tonnes:number;price:number|null;validAt:string;status:'quoted'|'estimated'|'request'}
export interface PriceObservation {offerId:string;price:number;observedAt:string;source:string}
export interface MarketIndex {source:string;date:string;region:string;tonnes:number;price:number}
export interface RawMaterial {name:string;unit:'t'|'solid-m3'|'loose-m3';price:number;moisture:number;wetDensity:number;loss:number}
export interface Equipment {name:string;source:string;capacity:number|null;price:number|null}
export interface FactoryConfiguration {name:string;assumptions:Record<string,number>;status:'estimated'}
export interface LogisticsRoute {origin:string;destination:string;costPerTon:number;status:'estimated'|'manual'}
export interface BusinessScenario {version:1;name:string;assumptions:Record<string,number>}
export interface CostAssumption {name:string;value:number;unit:string;status:'manual'|'estimated';source:string|null}
export interface FinancialProjection {revenue:number;opex:number;ebitda:number;depreciation:number;interest:number;tax:number;cashFlow:number}
