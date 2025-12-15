// Firebase конфиг
const firebaseConfig = {
  apiKey: "AIzaSyBphPRgf5jdtVPJuvlYs_riWnycTu3EYas",
  authDomain: "online-voting-e51d7.firebaseapp.com",
  databaseURL: "https://online-voting-e51d7-default-rtdb.firebaseio.com",
  projectId: "online-voting-e51d7",
  storageBucket: "online-voting-e51d7.appspot.com",
  messagingSenderId: "947245872622",
  appId: "1:947245872622:web:cde2dc02638dc535738aff"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Кандидаттар мен мемтер
const candidates=["Аян","Нұрбек","Айлин","Диас","Мадина"];
const memes={
  "Аян":"https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Нұрбек":"https://media.giphy.com/media/3oKIPwoeGErMmaI43C/giphy.gif",
  "Айлин":"https://media.giphy.com/media/26tPoyDhjiJ2g7rEs/giphy.gif",
  "Диас":"https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
  "Мадина":"https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif"
};

// Батырмаларға click
document.querySelectorAll(".candidate-btn").forEach((btn,index)=>{
  btn.onclick=()=>{
    if(localStorage.getItem("voted")){
      alert("❌ Сіз тек 1 рет дауыс бере аласыз!"); return;
    }
    const candidate=candidates[index];
    const ref=db.ref("votes/"+candidate);
    ref.transaction(current=>(current||0)+1);
    localStorage.setItem("voted","true");
    showMeme(candidate);
  };
});

// Мем көрсету
function showMeme(candidate){
  const memeContainer=document.getElementById("meme-container");
  const memeImg=document.getElementById("meme");
  memeImg.src=memes[candidate];
  memeContainer.style.display="block";
  setTimeout(()=>{memeContainer.style.display="none";},3000);
}

// Таймер
let time=30;
const timerDiv=document.getElementById("timer");
const countdown=setInterval(()=>{
  time--;
  timerDiv.textContent=`⏳ Уақыт: ${time}`;
  if(time<=0){clearInterval(countdown); showWinner();}
},1000);

// Жеңімпаз
function showWinner(){
  db.ref("votes").once("value",snapshot=>{
    const votes=snapshot.val();
    let maxVotes=0,winner="";
    for(let c in votes){
      if(votes[c]>maxVotes){maxVotes=votes[c]; winner=c;}
    }
    const winnerScreen=document.getElementById("winner-screen");
    const winnerName=document.getElementById("winner-name");
    const winnerMeme=document.getElementById("winner-meme");
    winnerName.textContent=`🏆 Жеңімпаз: ${winner}`;
    winnerMeme.src=memes[winner];
    winnerScreen.style.display="flex";
    setTimeout(()=>{
      winnerScreen.style.display="none";
      showResults(votes);
    },6000);
  });
}

// Нәтижелер
function showResults(votes){
  const resultsDiv=document.getElementById("results");
  let html="<h2>📊 Дауыс нәтижелері:</h2><ul>";
  for(let c in votes){html+=`<li>${c}: ${votes[c]} дауыс</li>`;}
  html+="</ul>";
  resultsDiv.innerHTML=html;
}
