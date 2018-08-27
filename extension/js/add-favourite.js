window.addEventListener('load', function(evt) {
  let xhr = new XMLHttpRequest();
  let coinOptions = document.getElementById('coin')
  getToken(result => {
    xhr.open("GET", "http://localhost:4003/coins", true)
    xhr.setRequestHeader('x-access-token',result.token)
    xhr.send()
  })
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      let result = JSON.parse(xhr.responseText)
      result.coins.forEach(coin => {
        let el = document.createElement('option')
        el.value = coin
        coinOptions.appendChild(el)
        el.innerText = coin
      })
    }
  }
  // Form submission
})

document.getElementById('form').addEventListener('submit', function(e) {
    e.preventDefault()
    getToken(result => {
      let options = {
        method : "POST",
        body : JSON.stringify({coin : this.elements.coin.value}),
        headers : new Headers({
          'content-type': 'application/json',
          'x-access-token' : result.token
        })
      }
      fetch('http://localhost:4003/favourite/add',options)
      .then(res => {
        if(res.ok) return res.json()
        else throw new Error(res.status)
      })
      .then(data => {
        window.location = "/favourite.html"
      })
      .catch(error => console.log(error))
    })
  })