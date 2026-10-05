// Sync the offset of the main tag based on the height of the header tag
function headerOffset() {
  const headerHight = document.querySelector('header').getBoundingClientRect().height
  document.querySelector('main').style.setProperty('--target-height', `${headerHight}px`)
  document.querySelector('#shop-drop-down').style.setProperty('--target-height', `${headerHight}px`)
  console.log(2)
}

window.addEventListener('DOMContentLoaded', headerOffset);
window.addEventListener('resize', headerOffset);


// Check whether the desktop or mobile optimized version should be shown
function desktopMobileOptimizer() {
  console.log(1)

}

window.addEventListener('DOMContentLoaded', desktopMobileOptimizer);
window.addEventListener('resize', desktopMobileOptimizer);
