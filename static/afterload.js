// Sync the offset of the main tag based on the height of the header tag
function headerOffset() {
  const headerHight = document.querySelector('header').getBoundingClientRect().height
  document.querySelector('main').style.setProperty('--target-height', `${headerHight}px`)
  document.querySelector('#shop-drop-down').style.setProperty('--target-height', `${headerHight}px`)

}

window.addEventListener('DOMContentLoaded', headerOffset);
window.addEventListener('resize', headerOffset);


// Check whether the desktop or mobile optimized version should be shown
function desktopMobileOptimizer() {


}

window.addEventListener('DOMContentLoaded', desktopMobileOptimizer);
window.addEventListener('resize', desktopMobileOptimizer);


// Dropdowncode

let sportsorcasual = true

if (sportsorcasual == true) {
  document.querySelectorAll('.sliding-segmented-control .item')[0].style.color = "#000";
  document.querySelectorAll('.sliding-segmented-control .item')[1].style.color = "#fff";
  document.querySelector('.sliding-segmented-control .selected').style.setProperty('--translate', `0%`);
}

if (sportsorcasual == false) {
  document.querySelectorAll('.sliding-segmented-control .item')[0].style.color = "#fff";
  document.querySelectorAll('.sliding-segmented-control .item')[1].style.color = "#000";
  document.querySelector('.sliding-segmented-control .selected').style.setProperty('--translate', `100%`);
}

document.querySelector('.sliding-segmented-control').addEventListener('click', (event) => {
      if (event.target == document.querySelectorAll('.sliding-segmented-control .item')[0]) {
        document.querySelectorAll('.sliding-segmented-control .item')[0].style.color = "#000";
        document.querySelectorAll('.sliding-segmented-control .item')[1].style.color = "#fff";
        document.querySelector('.sliding-segmented-control .selected').style.setProperty('--translate', `0%`);
        sportsorcasual = true;
      }

      if (event.target == document.querySelectorAll('.sliding-segmented-control .item')[1]) {
        document.querySelectorAll('.sliding-segmented-control .item')[0].style.color = "#fff";
        document.querySelectorAll('.sliding-segmented-control .item')[1].style.color = "#000";
        document.querySelector('.sliding-segmented-control .selected').style.setProperty('--translate', `100%`);
        sportsorcasual = false;
      }
});




let shopDropdownopen = true
let target = '#FOOTBALL'
let pretarget = ''
let activeAnimation = null;
let cooldown = 0

function animate(timestamp) {

  if (cooldown > 0) {
    cooldown = cooldown - 0.01
  }

  const footballel = document.querySelector(target);



  if (target !== pretarget) {
    try {
      document.querySelector(pretarget).style.color = "#000"
      const bigtext = document.querySelector('#bigtext')

      if (cooldown > 0) {
        bigtext.textContent = footballel.textContent
      } else {
        cooldown = 1
        const activeAnimation = bigtext.animate([
          { opacity: 1, transform: 'translateY(0px)' },
          { opacity: 0, transform: 'translateY(-10px)' }
        ], {
          duration: 300,
          easing: 'ease-in'
        });

        activeAnimation.onfinish = () => {
          bigtext.textContent = footballel.textContent

          bigtext.animate([
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0px)' }
          ], {
            duration: 300,
            easing: 'ease-out'
         }); }
      }

    } catch (error) {
      // No need to handle error; Sometimes pretarget will be empty and that's fine.
    } finally {
      pretarget = target
    }
  };

  footballel.style.color = "#fff"

  const range = document.createRange();
  range.selectNodeContents(footballel);
  const football = range.getBoundingClientRect();
  const cursor = document.querySelector('#cursor');
  const container = document.querySelector('.div3').getBoundingClientRect();

  const RightwidthDifference = football.right - document.querySelector('.div3').getBoundingClientRect().right;
  const LeftwidthDifference = document.querySelector('.div3').getBoundingClientRect().left - football.left;

  let cursorWidth = football.width

  if (football.right > document.querySelector('.div3').getBoundingClientRect().right ) {
     cursorWidth = football.width - RightwidthDifference
   };

  if (document.querySelector('.div3').getBoundingClientRect().left > football.left) {
     cursorWidth = football.width - LeftwidthDifference
   };



  cursor.style.setProperty('--target-height', `${football.height / cursor.currentCSSZoom}px`);
  cursor.style.setProperty('--target-width', `${cursorWidth / cursor.currentCSSZoom}px`);
  cursor.style.setProperty('--target-top', `${(football.top - document.querySelector('#sports').getBoundingClientRect().top) / cursor.currentCSSZoom}px`);


  if (shopDropdownopen) {
    requestAnimationFrame(animate);
  }
}

requestAnimationFrame(animate);

document.querySelector('.div3').addEventListener('scroll', (event) => {
  document.querySelector('#cursor').style.setProperty('--target-left', `0px`);
  document.querySelector('#cursor').style.setProperty('--target-left', `${(document.querySelector('#sports').getBoundingClientRect().left - cursor.getBoundingClientRect().left) / cursor.currentCSSZoom}px`);
});







const sports = document.querySelectorAll('.sportslink');

sports.forEach(sport => {
  sport.id = sport.textContent.replaceAll(' ', '').toUpperCase()
  sport.addEventListener('mouseenter', (event) => {
    target = `#${sport.id}`
  });

  sport.addEventListener('click', (event) => {
    target = `#${sport.id}`
  });
});


const trigger = document.querySelector('#shop-link');
const dropdown = document.querySelector('#shop-drop-down');

let hideTimeout = null;

function openMenuLink() {
  trigger.classList.add('underline')
  clearTimeout(hideTimeout);
  dropdown.classList.remove('hiden');
  requestAnimationFrame(animate);

  if (!shopDropdownopen) {
    shopDropdownopen = true
      dropdown.animate([
        { opacity: 1, transform: 'translateY(-700px)' },
        { opacity: 1, transform: 'translateY(0px)' }],
        { duration: 150, easing: 'ease-in' }
      );
  }
}

function keepMenuopen() {
  trigger.classList.add('underline')
  clearTimeout(hideTimeout);
  dropdown.classList.remove('hiden');
  shopDropdownopen = true
  requestAnimationFrame(animate);
}

function closeMenuWithDelay() {
  trigger.classList.remove('underline')
  hideTimeout = setTimeout(() => {
    shopDropdownopen = false
    const leaveanimation = dropdown.animate([
      { opacity: 1, transform: 'translateY(0px)' },
      { opacity: 1, transform: 'translateY(-700px)' }],
      { duration: 150, easing: 'ease-out' }
    );

    leaveanimation.onfinish = () => {
      dropdown.classList.add('hiden');
    }
  }, 200);
}

trigger.addEventListener('mouseenter', openMenuLink);
trigger.addEventListener('mouseleave', closeMenuWithDelay);

dropdown.addEventListener('mouseenter', keepMenuopen);
dropdown.addEventListener('mouseleave', closeMenuWithDelay);
