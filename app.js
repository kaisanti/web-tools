const form=document.getElementById('analyze-form');
const input=document.getElementById('video-url');
const button=document.getElementById('analyze-button');
const statusMessage=document.getElementById('status-message');
const result=document.getElementById('result');
const number=n=>new Intl.NumberFormat('id-ID',{notation:n>=1000000?'compact':'standard',maximumFractionDigits:1}).format(Number(n)||0);
const set=(id,value)=>{document.getElementById(id).textContent=value??'—'};
function validTikTokUrl(value){try{const u=new URL(value);return ['tiktok.com','www.tiktok.com','m.tiktok.com','vm.tiktok.com','vt.tiktok.com'].includes(u.hostname)||u.hostname.endsWith('.tiktok.com')}catch{return false}}
function dateText(seconds){if(!seconds)return '—';const d=new Date(Number(seconds)*1000);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(d)}
function durationText(seconds){const n=Number(seconds)||0;if(!n)return '—';return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')}
function safeImage(el,url){if(url){el.src=url;el.hidden=false}else{el.removeAttribute('src');el.hidden=true}}
function showData(d,originalUrl){
  safeImage(document.getElementById('cover'),d.cover);
  safeImage(document.getElementById('avatar'),d.author_avatar);
  set('creator-name',d.author_nickname||'Unknown creator');
  set('creator-handle',d.author_unique_id?'@'+d.author_unique_id:'Username unavailable');
  set('caption',d.title||'No caption');
  set('region','Region '+(d.region||'—'));
  set('posted',dateText(d.create_time));
  set('duration',durationText(d.duration));
  set('views',number(d.play_count));set('likes',number(d.digg_count));set('comments',number(d.comment_count));set('shares',number(d.share_count));set('saves',number(d.collect_count));
  const views=Number(d.play_count)||0;
  const interactions=(Number(d.digg_count)||0)+(Number(d.comment_count)||0)+(Number(d.share_count)||0)+(Number(d.collect_count)||0);
  set('engagement',views?((interactions/views)*100).toFixed(2)+'%':'—');
  set('detail-duration',durationText(d.duration));
  set('file-size',d.size?((Number(d.size)/1048576).toFixed(2)+' MB'):'Not provided');
  set('video-id',d.id||'—');set('detail-date',dateText(d.create_time));
  const link=document.getElementById('open-video');link.href=originalUrl;
  result.classList.remove('hidden');
  result.scrollIntoView({behavior:'smooth',block:'start'});
}
form.addEventListener('submit',async event=>{
  event.preventDefault();statusMessage.textContent='';
  const url=input.value.trim();
  if(!validTikTokUrl(url)){statusMessage.textContent='Masukkan tautan video TikTok yang valid.';return}
  button.disabled=true;button.querySelector('span').textContent='Analyzing...';result.classList.add('hidden');
  try{
    const response=await fetch('/api/tiktok-resolve?url='+encodeURIComponent(url),{headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({error:'Server returned invalid JSON.'}));
    if(!response.ok)throw new Error(payload.error||'Gagal mengambil data video ('+response.status+').');
    if(!payload||!payload.id)throw new Error('Metadata video tidak lengkap atau video tidak dapat diakses.');
    showData(payload,url);
  }catch(error){statusMessage.textContent=error.message||'Terjadi kesalahan saat menganalisis video.'}
  finally{button.disabled=false;button.querySelector('span').textContent='Analyze video'}
});
document.getElementById('reset-button').addEventListener('click',()=>{input.value='';statusMessage.textContent='';result.classList.add('hidden');input.focus();window.scrollTo({top:0,behavior:'smooth'})});