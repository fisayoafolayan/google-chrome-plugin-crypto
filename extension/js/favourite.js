const pusher = new Pusher('a1fe16427550ee94f4db', {
  cluster: 'eu',
  encrypted: true
})

window.addEventListener('load', function(evt) {
  let xhr = new XMLHttpRequest();
  getToken(function(result) {
    xhr.open("GET", 'http://localhost:4003/favourite', true);
    xhr.setRequestHeader('x-access-token',result.token)
    xhr.send();
  })
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      let res = JSON.parse(xhr.responseText)
      if(res.event) handleBinding(res.event)
      else document.getElementById('crypto-prices').innerHTML = res.message
    }
  }
})

function handleBinding(event){
  let channel = pusher.subscribe('cryptowatch');
  channel.bind(event, (data) => {
    let priceLists = ""
    let obj = JSON.parse(data.update)
    Object.keys(obj).forEach( (key, index) => {
       priceLists += `<li>${key}: </br>`
       let currencies = obj[key]
       let currencyLists = "<ul>"
       Object.keys(currencies).forEach( (currency, index) => {
         currencyLists += `<li>${currency} : ${currencies[currency]}</li>`
       });
       currencyLists += "</ul>"
       priceLists += `${currencyLists}</li>`
     });
     document.getElementById('crypto-prices').innerHTML = priceLists
  });
}