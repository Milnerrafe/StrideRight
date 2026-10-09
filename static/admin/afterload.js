function headerOffset() {
  const headerHight = document.querySelector('header').getBoundingClientRect().height
  document.querySelector('main').style.setProperty('--target-height', `${headerHight}px`)
}

window.addEventListener('DOMContentLoaded', headerOffset);
window.addEventListener('resize', headerOffset);

function logout() {
  document.cookie = `passcode=""; max-age=0; path=/;`;
  window.location.reload()
}

function handleLogin(correctpasscode, passcode) {
  if (correctpasscode) {
    document.cookie = `passcode="${encodeURIComponent(passcode)}"; max-age=604800; path=/; SameSite=Lax;`;
    window.location.reload()
  } else {
    document.querySelector("#login").reset()
    document.querySelector("#wrongpassword").classList.remove("hiden")
  }
}

try {
  const loginForm = document.querySelector("#login")

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault()
    const logindata = new FormData(loginForm);
    const passcode = logindata.get("passcode");

    fetch('/admin/checkpasscode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"passcode" : passcode})
      }).then(response => response.json()).then(result => handleLogin(result["correctpasscode"], passcode))
  });

} catch {
  // Sometimes loginForm won't be there, and that's fine.
}


try {

  const allDescriptions = document.querySelectorAll('.descriptioncontent');

  console.log(allDescriptions)

  allDescriptions.forEach(element => {
      element.innerHTML = marked.parse(element.textContent);
  });

} catch(e) {
  console.log(e)
  // Sometimes description won't be there, and that's fine.
}
