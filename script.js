const data = [
  {campaign:"Summer Sale",channel:"Instagram",spend:42000,impressions:185000,clicks:7400,conversions:310,revenue:124000},
  {campaign:"Summer Sale",channel:"Google Ads",spend:56000,impressions:142000,clicks:8520,conversions:420,revenue:168000},
  {campaign:"Brand Awareness",channel:"YouTube",spend:38000,impressions:310000,clicks:6200,conversions:145,revenue:58000},
  {campaign:"Brand Awareness",channel:"Instagram",spend:26000,impressions:220000,clicks:5500,conversions:180,revenue:72000},
  {campaign:"Festive Offers",channel:"Google Ads",spend:68000,impressions:175000,clicks:10500,conversions:560,revenue:224000},
  {campaign:"Festive Offers",channel:"Facebook",spend:33000,impressions:198000,clicks:5940,conversions:240,revenue:96000},
  {campaign:"Retargeting",channel:"Facebook",spend:24000,impressions:76000,clicks:6080,conversions:390,revenue:156000},
  {campaign:"Retargeting",channel:"Google Ads",spend:31000,impressions:69000,clicks:6210,conversions:350,revenue:140000}
];

const $ = id => document.getElementById(id);
const money = n => "₹" + Math.round(n).toLocaleString("en-IN");
const number = n => Math.round(n).toLocaleString("en-IN");
const pct = (a,b) => b ? (a/b*100).toFixed(2)+"%" : "0%";

const campaignFilter = $("campaignFilter");
const channelFilter = $("channelFilter");
[...new Set(data.map(d=>d.campaign))].forEach(v=>campaignFilter.add(new Option(v,v)));
[...new Set(data.map(d=>d.channel))].forEach(v=>channelFilter.add(new Option(v,v)));

function filtered(){
  return data.filter(d=>(campaignFilter.value==="all"||d.campaign===campaignFilter.value)&&(channelFilter.value==="all"||d.channel===channelFilter.value));
}
function aggregate(rows,key,metric){
  const map={};
  rows.forEach(r=>map[r[key]]=(map[r[key]]||0)+r[metric]);
  return Object.entries(map).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);
}
function drawBars(target,items,format){
  const max=Math.max(...items.map(x=>x.value),1);
  $(target).innerHTML=items.map(x=>`<div class="bar-row"><span class="bar-label" title="${x.label}">${x.label}</span><div class="bar-track"><div class="bar-fill" style="width:${x.value/max*100}%"></div></div><span class="bar-value">${format(x.value)}</span></div>`).join("");
}
function render(){
  const rows=filtered();
  const totals=rows.reduce((a,r)=>({spend:a.spend+r.spend,impressions:a.impressions+r.impressions,clicks:a.clicks+r.clicks,conversions:a.conversions+r.conversions,revenue:a.revenue+r.revenue}),{spend:0,impressions:0,clicks:0,conversions:0,revenue:0});
  $("spendMetric").textContent=money(totals.spend);
  $("impressionsMetric").textContent=number(totals.impressions);
  $("clicksMetric").textContent=number(totals.clicks);
  $("conversionsMetric").textContent=number(totals.conversions);
  $("ctrMetric").textContent=pct(totals.clicks,totals.impressions);
  $("cpcMetric").textContent=money(totals.conversions?totals.spend/totals.conversions:0);
  drawBars("channelChart",aggregate(rows,"channel","spend"),money);
  drawBars("conversionChart",aggregate(rows,"campaign","conversions"),number);
  $("rowCount").textContent=rows.length+" records";
  $("campaignTable").innerHTML=rows.map(r=>`<tr><td><strong>${r.campaign}</strong></td><td>${r.channel}</td><td>${money(r.spend)}</td><td>${number(r.impressions)}</td><td>${number(r.clicks)}</td><td>${pct(r.clicks,r.impressions)}</td><td>${number(r.conversions)}</td><td class="good">${(r.revenue/r.spend).toFixed(2)}x</td></tr>`).join("");
  const best=rows.slice().sort((a,b)=>(b.revenue/b.spend)-(a.revenue/a.spend))[0];
  const highestCTR=rows.slice().sort((a,b)=>(b.clicks/b.impressions)-(a.clicks/a.impressions))[0];
  const insights=[];
  if(best) insights.push(`${best.campaign} via ${best.channel} has the highest ROAS in the selected view at ${(best.revenue/best.spend).toFixed(2)}x.`);
  if(highestCTR) insights.push(`${highestCTR.channel} has the strongest click-through rate for ${highestCTR.campaign} at ${pct(highestCTR.clicks,highestCTR.impressions)}.`);
  insights.push(`The selected campaigns generated ${number(totals.conversions)} conversions from ${number(totals.clicks)} clicks.`);
  $("insightsList").innerHTML=insights.map(x=>`<li>${x}</li>`).join("");
}
function exportCSV(){
  const rows=filtered();
  const headers=["Campaign","Channel","Spend","Impressions","Clicks","CTR","Conversions","Revenue","ROAS"];
  const lines=[headers.join(",")];
  rows.forEach(r=>lines.push([r.campaign,r.channel,r.spend,r.impressions,r.clicks,pct(r.clicks,r.impressions),r.conversions,r.revenue,(r.revenue/r.spend).toFixed(2)].join(",")));
  const blob=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="campaign-report.csv";a.click();URL.revokeObjectURL(url);
}
campaignFilter.addEventListener("change",render);
channelFilter.addEventListener("change",render);
$("exportBtn").addEventListener("click",exportCSV);
$("themeToggle").addEventListener("click",()=>document.body.classList.toggle("dark"));
render();
