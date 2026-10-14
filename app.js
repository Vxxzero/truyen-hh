const $ = id => document.getElementById(id);
let token = localStorage.getItem("th_token") || "";
let user = JSON.parse(localStorage.getItem("th_user") || "null");
let mode = "all", sort = "new", selectedStory = null, chapters = [], chapterNumber = 1, authMode = "login";
let saved = JSON.parse(localStorage.getItem("th_saved") || "[]");
let localHistory = JSON.parse(localStorage.getItem("th_history") || "[]");
let currentStories = [];

async function api(url, options={}) {
  const headers = { "Content-Type":"application/json", ...(options.headers||{}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {...options, headers});
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra.");
  return data;
}
function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
$("menuBtn").onclick=()=>$("menu").classList.toggle("open");
$("authOpen").onclick=$("loginCta").onclick=()=>openAuth("login");
$("authClose").onclick=()=>$("authModal").classList.remove("open");
$("switchMode").onclick=e=>{e.preventDefault();openAuth(authMode==="login"?"register":"login")};
function openAuth(modeName){authMode=modeName;$("authModal").classList.add("open");$("authTitle").textContent=modeName==="login"?"Đăng nhập":"Tạo tài khoản";$("authSubmit").textContent=modeName==="login"?"Đăng nhập":"Đăng ký";$("registerFields").hidden=modeName!=="register";$("authSwitch").innerHTML=modeName==="login"?'Chưa có tài khoản? <a href="#" id="switchMode">Đăng ký</a>':'Đã có tài khoản? <a href="#" id="switchMode">Đăng nhập</a>';$("switchMode").onclick=e=>{e.preventDefault();openAuth(authMode==="login"?"register":"login")};$("authMessage").textContent=""}
$("authSubmit").onclick=async()=>{
 try{
  const body={email:$("authEmail").value.trim(),password:$("authPassword").value};
  let result;
  if(authMode==="register"){body.username=$("regName").value.trim();result=await api("/api/auth/register",{method:"POST",body:JSON.stringify(body)});$("authMessage").textContent="Đăng ký thành công. Hãy đăng nhập.";return}
  result=await api("/api/auth/login",{method:"POST",body:JSON.stringify(body)});
  token=result.token;user=result.user;localStorage.setItem("th_token",token);localStorage.setItem("th_user",JSON.stringify(user));$("authModal").classList.remove("open");alert("Xin chào "+user.username);
 }catch(e){$("authMessage").textContent=e.message}
};
$("search").oninput=()=>loadStories();
$("filterBtn").onclick=()=>{mode="filter";loadStories()};
$("resetBtn").onclick=()=>{$("search").value="";$("keyword").value="";$("genreSelect").selectedIndex=-1;mode="all";loadStories()};
$("genreBtn").onclick=()=>$("genres").scrollIntoView({behavior:"smooth"});
$("allBtn").onclick=()=>{mode="all";loadStories()};
$("savedBtn").onclick=()=>{mode="saved";renderStories()};
$("historyBtn").onclick=()=>{mode="history";renderStories()};
document.querySelectorAll("[data-protagonist]").forEach(b=>b.onclick=()=>{mode="protagonist";loadStories(b.dataset.protagonist)});
document.querySelectorAll("[data-sort]").forEach(b=>b.onclick=()=>{sort="hot";mode="all";loadStories()});
$("newTab").onclick=()=>{sort="new";setTabs();loadStories()};
$("hotTab").onclick=()=>{sort="hot";setTabs();loadStories()};
function setTabs(){$("newTab").classList.toggle("active",sort==="new");$("hotTab").classList.toggle("active",sort==="hot")}
async function loadStories(protagonist=""){
 try{
  const params=new URLSearchParams();
  const q=$("search").value.trim();
  if(q)params.set("q",q);
  if(protagonist)params.set("protagonist",protagonist);
  if(sort==="hot")params.set("sort","hot");
  if(mode==="filter"){
   const genres=[...$("genreSelect").selectedOptions].map(o=>o.value);
   if(genres.length)params.set("genre",genres.join(","));
   const words=$("keyword").value.toLowerCase().split("+").map(x=>x.trim()).filter(Boolean);
   if(words.length)params.set("q",words.join(" "));
  }
  const data=await api("/api/stories?"+params.toString());
  currentStories=data.items;
  if(mode==="saved")currentStories=currentStories.filter(s=>saved.includes(s._id));
  if(mode==="history")currentStories=currentStories.filter(s=>localHistory.includes(s._id));
  renderStories();
 }catch(e){$("storyList").innerHTML=`<div class="empty">${escapeHtml(e.message)}<br>Kiểm tra máy chủ và MongoDB.</div>`}
}
function renderStories(){
 let list=currentStories;
 if(mode==="saved")list=list.filter(s=>saved.includes(s._id));
 if(mode==="history")list=list.filter(s=>localHistory.includes(s._id));
 $("listTitle").textContent=mode==="saved"?"Truyện đã lưu":mode==="history"?"Lịch sử đọc":mode==="filter"?"Kết quả lọc":"Truyện mới cập nhật";
 if(!list.length){$("storyList").innerHTML='<div class="empty">Chưa có truyện phù hợp.</div>';return}
 $("storyList").innerHTML=list.map((s,i)=>`
 <div class="story"><div class="cover">${s.cover?`<img src="${escapeHtml(s.cover)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:7px">`:"📖"}</div>
 <div class="story-main"><div class="story-title">${escapeHtml(s.title)} ${i<3?'<span class="new">NEW</span>':""}</div>
 <p class="desc">${escapeHtml(s.description||"Chưa có mô tả.")}</p>
 <div class="meta">✍ ${escapeHtml(s.author||"Đang cập nhật")} · ${escapeHtml((s.genres||[]).join(", "))}<br>👁 ${(s.views||0).toLocaleString("vi-VN")} lượt đọc</div>
 <div class="story-actions"><button class="read" data-read="${s._id}">Đọc truyện</button><button data-save="${s._id}">${saved.includes(s._id)?"❤️ Đã lưu":"♡ Lưu"}</button></div></div></div>`).join("");
 document.querySelectorAll("[data-read]").forEach(b=>b.onclick=()=>openStory(b.dataset.read));
 document.querySelectorAll("[data-save]").forEach(b=>b.onclick=()=>toggleSave(b.dataset.save));
}
function toggleSave(id){saved=saved.includes(id)?saved.filter(x=>x!==id):[id,...saved];localStorage.setItem("th_saved",JSON.stringify(saved));renderStories()}
async function openStory(id){
 try{
  const data=await api(`/api/stories/${id}`);selectedStory=data.story;chapters=data.chapters;
  if(!chapters.length){alert("Truyện chưa có chương.");return}
  chapterNumber=chapters[0].number;$("reader").classList.add("open");await showChapter(chapterNumber);loadComments();
 }catch(e){alert(e.message)}
}
async function showChapter(number){
 try{
  const data=await api(`/api/stories/${selectedStory._id}/chapters/${number}`);
  chapterNumber=number;$("readerTitle").textContent=selectedStory.title;$("chapterTitle").textContent=`Chương ${number}: ${data.chapter.title||""}`;
  $("readerCounter").textContent=`${chapters.findIndex(c=>c.number===number)+1}/${chapters.length}`;
  $("chapterText").textContent=data.chapter.content;
  $("prevChapter").disabled=!chapters.some(c=>c.number===number-1);
  $("nextChapter").disabled=!chapters.some(c=>c.number===number+1);
  localHistory=[selectedStory._id,...localHistory.filter(x=>x!==selectedStory._id)].slice(0,100);localStorage.setItem("th_history",JSON.stringify(localHistory));
  if(token)api("/api/history",{method:"POST",body:JSON.stringify({storyId:selectedStory._id,chapterId:data.chapter._id,chapterNumber:number})}).catch(()=>{});
  $("reader").scrollTop=0;
 }catch(e){alert(e.message)}
}
$("readerBack").onclick=()=>$("reader").classList.remove("open");
$("prevChapter").onclick=()=>showChapter(chapterNumber-1);
$("nextChapter").onclick=()=>showChapter(chapterNumber+1);
async function loadComments(){
 try{const d=await api(`/api/comments/story/${selectedStory._id}`);$("commentList").innerHTML=d.comments.map(c=>`<div class="comment"><b>${escapeHtml(c.user?.username||"Người dùng")}</b>${escapeHtml(c.content)}</div>`).join("")||'<p class="muted">Chưa có bình luận.</p>'}
 catch(e){$("commentList").textContent=e.message}
}
$("commentSend").onclick=async()=>{
 if(!token){openAuth("login");return}
 try{await api("/api/comments",{method:"POST",body:JSON.stringify({storyId:selectedStory._id,content:$("commentText").value})});$("commentText").value="";loadComments()}
 catch(e){alert(e.message)}
};
loadStories();
