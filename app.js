const allowedUsers=["타미","대구프린스","명명","김뼝"];
let friends=[];
let currentUser=null;
let chart=null;

function login(){
    const nick=document.getElementById("nickname").value.trim();
    if(!allowedUsers.includes(nick)){
        document.getElementById("login-error").innerText="접근 불가 닉네임입니다.";
        return;
    }
    currentUser=nick;
    localStorage.setItem("user",currentUser);
    if(!localStorage.getItem("startDate")){
        localStorage.setItem("startDate",new Date().toISOString());
    }
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("main-screen").classList.remove("hidden");
    document.getElementById("welcome").innerText=currentUser+"님 환영합니다!";
    checkExpiration();
    loadFriends();
}

function checkExpiration(){
    const start=localStorage.getItem("startDate");
    if(!start) return;
    const diff=(new Date()-new Date(start))/(1000*60*60*24);
    if(diff>30){
        document.getElementById("expired-message").innerText="30일이 지나 사용 종료.";
        document.querySelectorAll("button").forEach(b=>b.disabled=true);
    }
}

function saveRecord(){
    const date=new Date().toISOString().split("T")[0];
    const record={
        distance:document.getElementById("distance").value,
        steps:document.getElementById("steps").value,
        speed:document.getElementById("speed").value
    };
    localStorage.setItem(currentUser+"_"+date,JSON.stringify(record));
    document.getElementById("save-message").innerText="저장 완료!";
}

function showWeeklySection(){
    document.getElementById("weekly-section").classList.remove("hidden");
    document.getElementById("main-screen").classList.add("hidden");
    renderChart();
    renderTable();
}

function renderTable(){
    const tbody=document.querySelector("#weekly-table tbody");tbody.innerHTML="";
    let totalDist=0,totalSteps=0,totalSpeed=0,count=0;
    for(let i=6;i>=0;i--){
        const d=new Date();d.setDate(d.getDate()-i);
        const date=d.toISOString().split("T")[0];
        const data=localStorage.getItem(currentUser+"_"+date);
        if(data){
            const r=JSON.parse(data);
            tbody.innerHTML+=`<tr><td>${date}</td><td>${r.distance}</td><td>${r.steps}</td><td>${r.speed}</td></tr>`;
            totalDist+=Number(r.distance);
            totalSteps+=Number(r.steps);
            totalSpeed+=Number(r.speed);
            count++;
        }
    }
    document.getElementById("weekly-summary").innerText=
        `총 거리: ${totalDist}km / 총 걸음수: ${totalSteps} / 평균 속도: ${(count?totalSpeed/count:0).toFixed(1)} km/h`;
}

function renderChart(){
    const type=document.getElementById("chart-type").value;
    const labels=[];const data=[];
    for(let i=6;i>=0;i--){
        const d=new Date();d.setDate(d.getDate()-i);
        const date=d.toISOString().split("T")[0];
        const r=JSON.parse(localStorage.getItem(currentUser+"_"+date)||'{"distance":0,"steps":0,"speed":0}');
        labels.push(date);data.push(r[type]);
    }
    if(chart) chart.destroy();
    const ctx=document.getElementById("weekly-chart").getContext("2d");
    chart=new Chart(ctx,{
        type:'line',
        data:{labels:labels,datasets:[{label:type,backgroundColor:'rgba(0,123,255,0.2)',borderColor:'rgba(0,123,255,1)',data:data,fill:true}]},
        options:{responsive:true}
    });
}

function showInputSection(){
    document.getElementById("input-section").classList.remove("hidden");
    document.getElementById("main-screen").classList.add("hidden");
}

function showFriendsSection(){
    document.getElementById("friends-section").classList.remove("hidden");
    document.getElementById("main-screen").classList.add("hidden");
    renderFriends();
}

function addFriend(){
    const f=document.getElementById("friend-name").value.trim();
    if(f && allowedUsers.includes(f) && f!==currentUser && !friends.includes(f)){
        friends.push(f);
        saveFriends();
        renderFriends();
        document.getElementById("friend-name").value='';
    }
}

function renderFriends(){
    const ul=document.getElementById("friends-list");ul.innerHTML='';
    friends.forEach(f=>{
        const li=document.createElement('li');
        li.innerText=f+' ';
        const btn=document.createElement('button');
        btn.innerText='삭제';
        btn.onclick=()=>{friends=friends.filter(x=>x!==f);saveFriends();renderFriends();};
        li.appendChild(btn);ul.appendChild(li);
    });
}

function saveFriends(){localStorage.setItem(currentUser+"_friends",JSON.stringify(friends));}
function loadFriends(){friends=JSON.parse(localStorage.getItem(currentUser+"_friends")||'[]');}
function backToMain(){
    document.getElementById("input-section").classList.add("hidden");
    document.getElementById("weekly-section").classList.add("hidden");
    document.getElementById("friends-section").classList.add("hidden");
    document.getElementById("main-screen").classList.remove("hidden");
}
function logout(){location.reload();}
