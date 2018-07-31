const pusher = new Pusher('a1fe16427550ee94f4db', {
  cluster: 'eu',
  encrypted: true
})

let channel = pusher.subscribe('cryptowatch');
channel.bind('prices', (data) => {
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