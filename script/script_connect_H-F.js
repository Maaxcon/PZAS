fetch('/containsHF_HTML/header.html')
.then(responce => responce.text())
.then(data =>{
    document.querySelector(".header").innerHTML = data
})

fetch('/containsHF_HTML/footer.html')
.then(responce => responce.text())
.then(data =>{
    document.querySelector(".footer").innerHTML = data
})
