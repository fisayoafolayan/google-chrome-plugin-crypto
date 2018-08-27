getToken(function(result) {
  if(!result) {
    window.location = "/index.html"
  }
})

function getToken(callback){
  chrome.storage.local.get("access-token", (result) => {
    let data = false
    if (result['access-token']) {
      let expires = new Date(result['access-token']['expires'])
      let now = new Date()
      if (expires > now) {
        data = { 
                'token' : result['access-token']['token'],
                'user_id' : result['access-token']['user_id']
        }
      }
      else {
        chrome.storage.local.remove("access-token", () => {})
      }
    }
    callback(data)
  })
}