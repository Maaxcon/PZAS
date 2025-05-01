fetch('/contains(H-F)_HTML/header.html')
.then(responce => responce.text())
.then(data =>{
    document.querySelector(".header").innerHTML = data
})

fetch('/contains(H-F)_HTML/footer.html')
.then(responce => responce.text())
.then(data =>{
    document.querySelector(".footer").innerHTML = data
})


fetch("/bot.html")
.then(responce => responce.text())
.then(data =>{
    document.querySelector(".header").innerHTML += data
})
