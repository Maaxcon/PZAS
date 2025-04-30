fetch('header.html')
.then(responce => responce.text())
.then(data =>{
    document.querySelector(".header").innerHTML = data
})