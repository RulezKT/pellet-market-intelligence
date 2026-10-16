import {useEffect,useRef} from 'react';
export default function Chart({labels,series,kind='line',height=300,horizontal=false}:{labels:string[];series:{name:string;data:(number|null)[];stack?:string;itemStyle?:{color:string}}[];kind?:'line'|'bar';height?:number;horizontal?:boolean}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let cancelled=false;let cleanup:(()=>void)|undefined;
  void Promise.all([import('echarts/core'),import('echarts/charts'),import('echarts/components'),import('echarts/renderers')]).then(([echarts,charts,components,renderers])=>{
   if(cancelled||!ref.current)return;
   echarts.use([charts.LineChart,charts.BarChart,components.GridComponent,components.TooltipComponent,components.LegendComponent,renderers.CanvasRenderer]);
   const chart=echarts.init(ref.current);chart.setOption({animation:false,color:['#16745b','#d6973a','#678bba','#b55b58'],tooltip:{trigger:'axis'},legend:{bottom:0},grid:{left:horizontal?110:65,right:24,top:24,bottom:70},xAxis:horizontal?{type:'value',axisLabel:{color:'#7b8792'},splitLine:{lineStyle:{color:'#dfe6e522'}}}:{type:'category',data:labels,axisLabel:{color:'#7b8792'}},yAxis:horizontal?{type:'category',data:labels,axisLabel:{color:'#7b8792'}}:{type:'value',axisLabel:{color:'#7b8792'},splitLine:{lineStyle:{color:'#dfe6e522'}}},series:series.map(s=>({...s,type:kind,smooth:false,symbolSize:9,showSymbol:true,connectNulls:false,lineStyle:{width:3},areaStyle:kind==='line'?{opacity:0.04}:undefined}))});
   const observer=new ResizeObserver(()=>chart.resize());observer.observe(ref.current);cleanup=()=>{observer.disconnect();chart.dispose()};
  });return()=>{cancelled=true;cleanup?.()};
 },[labels,series,kind,horizontal]);
 return <div role="img" aria-label={series.map(s=>s.name).join(', ')} ref={ref} style={{height,width:'100%'}}/>;
}
