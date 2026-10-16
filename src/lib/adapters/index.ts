import {OfferSchema,type Offer} from '../validation';
export interface PriceAdapter {id:string;permitted:boolean;collect:()=>Promise<Offer[]>}
export function acceptObservation(current:Offer,incoming:Offer){const next=OfferSchema.parse(incoming);if(current.id!==next.id||current.productId!==next.productId)throw new Error('Product identity mismatch');return {offer:next,changed:current.price!==next.price||current.weightKg!==next.weightKg||current.vat!==next.vat||current.vatIncluded!==next.vatIncluded||current.shipping!==next.shipping||current.delivery!==next.delivery};}
// Keep empty until automated reuse is established and a source-specific parser is tested.
export const adapters:PriceAdapter[]=[];
