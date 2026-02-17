function login(){
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("/login", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.token){
      localStorage.setItem("token", data.token);
      window.location="dashboard.html";
    } else {
      alert("Login failed");
    }
  });
}

function downloadVideo(){
  const url = document.getElementById("videoURL").value;
  const token = localStorage.getItem("token");
  const progressBar = document.getElementById("progressBar");

  progressBar.style.width="30%";

  fetch("/download", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": token
    },
    body: JSON.stringify({ url })
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.success){
      progressBar.style.width="100%";
      const link=document.getElementById("downloadLink");
      link.href=data.file;
      link.download="nokiyapu-adare.mp4";
      link.innerText="Download nokiyapu-adare.mp4";
      link.style.display="block";
    } else {
      alert("Download failed");
    }
  });
}

function logout(){
  localStorage.removeItem("token");
  window.location="login.html";
}
