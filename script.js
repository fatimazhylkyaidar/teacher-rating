const teachers = [
    {name: "Айжан Тұрсынова", subject: "Математика"},
    {name: "Ерлан Жұмабай", subject: "Физика"},
    {name: "Гүлнұр Әбілқасым", subject: "Қазақ тілі"},
    {name: "Асхат Марат", subject: "Химия"}
];

const users = [
    {username: "student1", role: "student"},
    {username: "parent1", role: "parent"}
];

function getQueryParam(param){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

window.addEventListener("DOMContentLoaded", () => {
    const urlUser = getQueryParam("user");
    const currentUser = users.find(u => u.username === urlUser);

    if(currentUser){
        document.getElementById("entryCard").classList.add("hidden");
        if(currentUser.role === "student"){
            document.getElementById("studentView").classList.remove("hidden");
            initStudentView();
        } else if(currentUser.role === "parent"){
            document.getElementById("parentView").classList.remove("hidden");
            initParentView();
        }
    }
});

// ========================
// Student View
// ========================
let selectedEmoji = 0;
function initStudentView(){
    const studentDiv = document.getElementById("studentView");
    studentDiv.innerHTML = `
    <div class="card">
        <h2>Оқытушыны бағалау</h2>
        <label>Оқытушыны таңда:</label>
        <select id="teacher"></select>

        <label>Сабақтың түсініктілігі:</label>
        <input type="range" min="1" max="5" value="3" class="slider" id="clarity">

        <label>Сабақтың қызықтылығы:</label>
        <input type="range" min="1" max="5" value="3" class="slider" id="interest">

        <label>Мұғалімнің қолжетімділігі:</label>
        <input type="range" min="1" max="5" value="3" class="slider" id="accessibility">

        <label>Қатысу белсенділігі:</label>
        <input type="range" min="1" max="5" value="3" class="slider" id="participation">

        <div class="emoji-rating">
            <h3>Сабақтың жалпы әсері:</h3>
            <div class="emojis">
                <span data-value="1">😡</span>
                <span data-value="2">😕</span>
                <span data-value="3">😐</span>
                <span data-value="4">😊</span>
                <span data-value="5">🤩</span>
            </div>
        </div>

        <div class="comment-box">
            <h3>Пікір қалдыру:</h3>
            <textarea id="comment" placeholder="Пікіріңізді жазыңыз..."></textarea>
        </div>

        <button id="submit">Бағалау жіберу</button>
    </div>
    `;

    const teacherSelect = document.getElementById("teacher");
    teachers.forEach(t=>{ const option=document.createElement("option"); option.value=t.name; option.textContent=t.name; teacherSelect.appendChild(option); });

    const emojis = document.querySelectorAll(".emojis span");
    emojis.forEach(emoji=>{
        emoji.addEventListener("click", function(){
            emojis.forEach(e=>e.classList.remove("selected"));
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
        if(!data[teacher]) data[teacher] = [];
        data[teacher].push({clarity, interest, accessibility, participation, emoji: selectedEmoji, comment});
        localStorage.setItem("ratings", JSON.stringify(data));

        alert(`${teacher} мұғаліміне бағалау жіберілді!`);
        emojis.forEach(e=>e.classList.remove("selected")); selectedEmoji=0;
        document.getElementById("comment").value=""; 
        document.getElementById("clarity").value=3;
        document.getElementById("interest").value=3; 
        document.getElementById("accessibility").value=3; 
        document.getElementById("participation").value=3;
    };
}

// ========================
// Parent View
// ========================
function initParentView(){
    const parentDiv = document.getElementById("parentView");
    parentDiv.innerHTML = `
    <div class="card">
        <h2>Оқытушылар рейтингі</h2>
        <select id="teacherParentSelect"></select>
        <div class="teacher-profile">
            <h3 id="parentTeacherName"></h3>
            <p class="subject" id="parentTeacherSubject"></p>
            <p class="rating">Орташа рейтинг: <span id="parentAvgRating">⭐ 0 / 5</span></p>
            <h4>Соңғы пікірлер:</h4>
            <ul id="parentCommentsList"></ul>
            <canvas id="parentRatingChart" width="400" height="200"></canvas>
        </div>
    </div>
    `;

    const teacherParentSelect = document.getElementById("teacherParentSelect");
    teachers.forEach(t=>{ const option=document.createElement("option"); option.value=t.name; option.textContent=t.name; teacherParentSelect.appendChild(option); });
    showTeacherParentData(teachers[0].name);
    teacherParentSelect.addEventListener("change",()=> showTeacherParentData(teacherParentSelect.value));
}

function showTeacherParentData(name){
    const teacher = teachers.find(t=>t.name===name);
    document.getElementById("parentTeacherName").textContent = teacher.name;
    document.getElementById("parentTeacherSubject").textContent = `Пәні: ${teacher.subject}`;

    const data = JSON.parse(localStorage.getItem("ratings"))||{};
    const arr = data[teacher.name]||[];
    const avg = arr.length ? (arr.reduce((a,b)=>a+b.emoji,0)/arr.length).toFixed(1) : 0;
    document.getElementById("parentAvgRating").innerText = `⭐ ${avg} / 5`;

    const commentsList = document.getElementById("parentCommentsList");
    commentsList.innerHTML = "";
    arr.slice(-5).reverse().forEach(c=>{
        if(c.comment){ const li=document.createElement("li"); li.textContent=c.comment; commentsList.appendChild(li); }
    });

    const ctx = document.getElementById('parentRatingChart').getContext('2d');
    const clarityAvg = arr.length ? (arr.map(r=>r.clarity).reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0;
    const interestAvg = arr.length ? (arr.map(r=>r.interest).reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0;
    const accessibilityAvg = arr.length ? (arr.map(r=>r.accessibility).reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0;
    const participationAvg = arr.length ? (arr.map(r=>r.participation).reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0;
    const emojiAvg = arr.length ? (arr.map(r=>r.emoji).reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 0;

    if(window.parentChart) window.parentChart.destroy();
    window.parentChart = new Chart(ctx,{
        type:'bar',
        data:{ labels:['Түсініктілік','Қызықтылық','Қолжетімділік','Қатысу','Emoji'], datasets:[{label:'Бағалау',data:[clarityAvg,interestAvg,accessibilityAvg,participationAvg,emojiAvg], backgroundColor:'#4ade80']()
