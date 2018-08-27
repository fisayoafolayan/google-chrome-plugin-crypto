window.addEventListener('load', function(evt) {
  const form = document.getElementById('form')
  document.getElementById('form').addEventListener('submit', function(e) {
    e.preventDefault()

    let options = {
      method : "POST",
      body : JSON.stringify({
        'email' : this.elements.email.value,
        'password' : this.elements.password.value
      }),
      headers : new Headers({'content-type': 'application/json'})
    }

    fetch("http://localhost:4003/auth",options)
    .then(res => {
      if(res.ok) return res.json()
      else throw new Error(res.status)
    })
    .then(data => {
        storeToken(data, () => {
          document.querySelector('.box').classList.remove('hide')
          document.querySelector('.login').classList.add('hide')
        })
    })
    .catch(error => {
      console.log(error)
    })
  })
  getToken(result => {
    if(!result) {
      document.querySelector('.login').classList.remove('hide')
    }
    else {
      document.querySelector('.box').classList.remove('hide')
    }
  })
})

function storeToken(data, callback){
  let dt = new Date()
  chrome.storage.local.set(
    { "access-token": 
      {
        'token' : data.token,
        'user_id' : data.user_id,
        'expires' : dt.setDate(dt.getDate()+1)
      }
    }, 
    () => callback()
  );
}

function getToken(callback){
  chrome.storage.local.get("access-token", result => {
    let data = false
    if (result['access-token']) {
      let expires = new Date(result['access-token']['expires'])
      let now = new Date()
      if (expires > now) {
        data = true
      }
      else {
        chrome.storage.local.remove("access-token", () => {})
      }
    }
    callback(data)
  });
}