// ========================
// Деректер
// ========================
const teachers = [
    {name: "Айжан Тұрсынова", subject: "Математика"},
    {name: "Ерлан Жұмабай", subject: "Физика"},
    {name: "Гүлнұр Әбілқасым", subject: "Қазақ тілі"},
    {name: "Асхат Марат", subject: "Химия"}
];

// ========================
// QR код генерациясы
// ========================
window.addEventListener("DOMContentLoaded", () => {
    const qrCanvas = document.getElementById("qrcode");
    const entryCard = document.getElementById("entryCard");

    const siteURL = window.location.href.split("?")[0]; // Тек сайт URL
    QRCode.toCanvas(qrCanvas, siteURL, {width:200}, function(error){
        if(error) console.error(error);
        else entryCard.classList.remove("hidden");
    });

    // Қолданушы параметрін тексеру
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get("user");

    if(user === "student1") showStudentView();
    else if(user === "parent1") showParentView();
});

// ========================
// Оқушы беті
// ========================
let selectedEmoji = 0;

function showStudentView(){
    const container = document.getElementById("mainContainer");
    container.innerHTML = `
    <h2>Оқушы беті: Мұғалімді бағалау</h2>
    <label>Оқытушыны таңда:</label>
    <select id="teacherSelect"></select>

    <label>Сабақтың түсініктілігі:</label>
    <input type="range" min="1" max="5" value="3" id="clarity">

    <label>Сабақтың қызықтылығы:</label>
    <input type="range" min="1" max="5" value="3" id="interest">

    <label>Мұғалімнің қолжетімділігі:</label>
    <input type="range" min="1" max="5" value="3" id="accessibility">

    <label>Қатысу белсенділігі:</label>
    <input type="range" min="1" max="5" value="3" id="participation">

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
    <a href="index.html">🔙 Шығу</a>
    `;

    // Мұғалімдер тізімін қосу
    const teacherSelect = document.getElementById("teacherSelect");
    teachers.forEach(t=>{ const opt=document.createElement("option"); opt.value=t.name; opt.textContent=t.name; teacherSelect.appendChild(opt); });

    // Emoji таңдау
    const emojis = document.querySelectorAll(".emojis span");
    emojis.forEach(e=>{
        e.addEventListener("click", function(){
            emojis.forEach(ev=>ev.classList.remove("selected"));
            this.classList.add("selected");
            selectedEmoji = Number(this.dataset.value);
        });
    });

    // Бағалауды сақтау
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
        data[teacher].push({clarity, interest, accessibility, participation, emoji:selectedEmoji, comment});
        localStorage.setItem("ratings", JSON.stringify(data));

        alert(`${teacher} мұғаліміне бағалау жіберілді!`);
        document.getElementById("comment").value="";
        document.getElementById("clarity").value=3;
        document.getElementById("interest").value=3;
        document.getElementById("accessibility").value=3;
        document.getElementById("participation").value=3;
        emojis.forEach(ev=>ev.classList.remove("selected"));
        selectedEmoji=0;
    };
}

// ========================
// Ата-ана беті
// ========================
function showParentView(){
    const container = document.getElementById("mainContainer");
    container.innerHTML = `
    <h2>Ата-ана беті: Мұғалім рейтингі</h2>
    <select id="teacherParentSelect"></select>
    <div id="parentProfile"></div>
    <a href="index.html">🔙 Шығу</a>
    `;

    const teacherParentSelect = document.getElementById("teacherParentSelect");
    teachers.forEach(t=>{ const opt=document.createElement("option"); opt.value=t.name; opt.textContent=t.name; teacherParentSelect.appendChild(opt); });

    showParentData(teachers[0].name);
    teacherParentSelect.addEventListener("change", ()=> showParentData(teacherParentSelect.value));
}

function showParentData(teacherName){
    const data = JSON.parse(localStorage.getItem("ratings"))||{};
    const arr = data[teacherName]||[];
    const avg = arr.length ? (arr.reduce((a,b)=>a+b.emoji,0)/arr.length).toFixed(1) : 0;

    let profileDiv = document.getElementById("parentProfile");
    profileDiv.innerHTML = `
        <h3>${teacherName}</h3>
        <p>Орташа рейтинг: ⭐ ${avg} / 5</p>
        <h4>Соңғы пікірлер:</h4>
        <ul>${arr.slice(-5).reverse().map(c=>c.comment?`<li>${c.comment}</li>`:"").join("")}</ul>
    `;
}
