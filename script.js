const teachers = [
    {name: "Айжан Тұрсынова", subject: "Математика"},
    {name: "Ерлан Жұмабай", subject: "Физика"},
    {name: "Гүлнұр Әбілқасым", subject: "Қазақ тілі"},
    {name: "Асхат Марат", subject: "Химия"}
];

const users = [
    {username:"student1", role:"student"},
    {username:"parent1", role:"parent"}
];

function getQueryParam(param){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// QR код + батырмалар
window.addEventListener("DOMContentLoaded", ()=>{
    const siteURL = window.location.origin + window.location.pathname;
    const qrCanvas = document.getElementById("qrcode");
    const entryCard = document.getElementById("entryCard");

    QRCode.toCanvas(qrCanvas, siteURL, {width:220}, function(err){
        if(err) console.error(err);
        else entryCard.classList.remove("hidden");
    });

    const urlUser = getQueryParam("user");
    const currentUser = users.find(u=>u.username===urlUser);

    if(currentUser){
        document.getElementById("qrCard").classList.add("hidden");
        if(currentUser.role==="student"){ 
            document.getElementById("studentView").classList.remove("hidden"); 
            initStudentView(); 
        } else { 
            document.getElementById("parentView").classList.remove("hidden"); 
            initParentView(); 
        }
    }
});

// ===== Student View =====
let selectedEmoji = 0;
function initStudentView(){
    const teacherSelect = document.getElementById("teacher");
    teacherSelect.innerHTML="";
    teachers.forEach(t=>{
        const option = document.createElement("option");
        option.value = t.name;
        option.textContent = `${t.name} (${t.subject})`;
        teacherSelect.appendChild(option);
    });

    const emojis = document.querySelectorAll(".emojis span");
    emojis.forEach(e=>{
        e.addEventListener("click", function(){
            emojis.forEach(ev=>ev.classList.remove("selected"));
            this.classList.add("selected");
            selectedEmoji = Number(this.dataset.value);
        });
    });

    document.getElementById("submit").onclick = function(){
        const teacher = teacherSelect.value;
        const clarity = +document.getElementById("clarity").value;
        const interest = +document.getElementById("interest").value;
        const accessibility = +document.getElementById("accessibility").value;
        const participation = +document.getElementById("participation").value;
        const comment = document.getElementById("comment").value.trim();

        if(!selectedEmoji){ alert("Сабақ әсерін таңдаңыз!"); return; }

        let data = JSON.parse(localStorage.getItem("ratings"))||{};
        if(!data[teacher]) data[teacher]=[];
        data[teacher].push({clarity, interest, accessibility, participation, emoji:selectedEmoji, comment});
        localStorage.setItem("ratings", JSON.stringify(data));

        alert(`${teacher} мұғаліміне бағалау жіберілді!`);
        emojis.forEach(ev=>ev.classList.remove("selected")); selectedEmoji=0;
        document.getElementById("comment").value=""; 
        document.getElementById("clarity").value=3;
        document.getElementById("interest").value=3;
        document.getElementById("accessibility").value=3;
        document.getElementById("participation").value=3;
    };
}

// ===== Parent View =====
function initParentView(){
    const teacherParentSelect = document.getElementById("teacherParentSelect");
    teacherParentSelect.innerHTML="";
    teachers.forEach(t=>{
        const option=document.createElement("option");
        option.value=t.name;
        option.textContent=`${t.name} (${t.subject})`;
        teacherParentSelect.appendChild(option);
    });
    showTeacherParentData(teachers[0].name);
    teacherParentSelect.addEventListener("change", ()=>showTeacherParentData(teacherParentSelect.value));
}

function showTeacherParentData(name){
    const teacher = teachers.find(t=>t.name===name);
    document.getElementById("parentTeacherName").textContent = teacher.name;
    document.getElementById("parentTeacherSubject").textContent = `Пәні: ${teacher.subject}`;

    const data = JSON.parse(localStorage.getItem("ratings"))||{};
    const arr = data[teacher.name]||[];

    const avg = arr.length ? (arr.reduce((a,b)=>a+b.emoji,0)/arr.length).toFixed(1):0;
    document.getElementById("parentAvgRating").innerText=`⭐ ${avg} / 5`;

    const clarityAvg = arr.length ? (arr.map(r=>r.clarity).reduce((a,b)=>a+b,0)/arr.length).toFixed(1):0;
    const interestAvg = arr.length ? (arr.map(r=>r.interest).reduce((a,b)=>a+b,0)/arr.length).toFixed(1):0;
    const accessibilityAvg = arr.length ? (arr.map(r=>r.accessibility).reduce((a,b)=>a+b,0)/arr.length).toFixed(1):0;
    const participationAvg = arr.length ? (arr.map(r=>r.participation).reduce((a,b)=>a+b,0)/arr.length).toFixed(1):0;
    const emojiAvg = arr.length ? (arr.map(r=>r.emoji).reduce((a,b)=>a+b,0)/arr.length).toFixed(1):0;

    const levels = document.getElementById("levelRatings");
    levels.innerHTML=`
        <li>Түсініктілік: ${clarityAvg}</li>
        <li>Қызықтылық: ${interestAvg}</li>
        <li>Қолжетімділік: ${accessibilityAvg}</li>
        <li>Қатысу: ${participationAvg}</li>
        <li>Эмоция: ${emojiAvg}</li>
    `;

    const commentsList = document.getElementById("parentCommentsList");
    commentsList.innerHTML="";
    arr.slice(-5).reverse().forEach(c=>{
        if(c.comment){
            const li=document.createElement("li");
            li.textContent=c.comment;
            commentsList.appendChild(li);
        }
    });

    const ctx = document.getElementById('parentRatingChart').getContext('2d');
    if(window.parentChart) window.parentChart.destroy();
    window.parentChart=new Chart(ctx,{
        type:'bar',
        data:{
            labels:['Түсініктілік','Қызықтылық','Қолжетімділік','Қатысу','Emoji'],
            datasets:[{label:'Бағалау',data:[clarityAvg, interestAvg, accessibilityAvg, participationAvg, emojiAvg], backgroundColor:'#4ade80'}]
        },
        options:{ scales:{ y:{min:0,max:5} }, plugins:{legend:{display:false}} }
    });
}
