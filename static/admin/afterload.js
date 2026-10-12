function headerOffset() {
  try {
    const headerHight = document.querySelector('header').getBoundingClientRect().height
    document.querySelector('main').style.setProperty('--target-height', `${headerHight}px`)
  } catch { }
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

function login() {
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
}


function descriptioncontent() {
  try {

    marked.use({ breaks: true, gfm: true });

    const allDescriptions = document.querySelectorAll('.descriptioncontent');

    allDescriptions.forEach(element => {
      element.innerHTML = marked.parse(JSON.parse(`"${element.textContent}"`));
    });

  } catch {
    // Sometimes description won't be there, and that's fine.
  }
}

function newColour() {
  try {
    const newColour = document.querySelector('#newColour');

    newColour.addEventListener('click', function () {
      window.location = "/admin/colours/new"
    });

  } catch {
    // Sometimes newColour won't be there, and that's fine.
  }
}


function newProduct() {
  try {
    const newColour = document.querySelector('#newProduct');

    newColour.addEventListener('click', function () {
      window.location = "/admin/product/new"
    });

  } catch {
    // Sometimes newProduct won't be there, and that's fine.
  }
}

function newproductVariant() {
  try {
    const newproductVariant = document.querySelector('#newproductVariant');

    newproductVariant.addEventListener('click', function () {
      let usededid = []
      document.querySelectorAll('.variant').forEach(variant => { usededid.push(variant.getAttribute("data-dbid")) })
      usededid.forEach(id => { document.querySelector(`#DBcolourId_${id}`).classList.add("hidden") })
      document.querySelector('#colorPicker').showModal();
    });

  } catch (e) {
  }
}


function productExtradata() {
  try {
    const Extra = document.querySelector('#productExtradata');
    const newExtra = document.querySelector('#newExtradata');



    newExtra.addEventListener('click', function () {
      let id = 0

      const Extras = Extra.children;

      try {
        if (Extras[Extras.length - 1].id) {
          id = parseInt(Extras[Extras.length - 1].id.replace("extra_", ""), 10) + 1
        }
      } catch { }


      Extra.insertAdjacentHTML("beforeend", `
        <form class="extradata" id="extra_${id}">
          <label id="title" for="extraName">Extra Name:</label>
          <input type="text" class="extraName" value="" name="extraName">

          <div class="gap"></div>

          <label id="title" for="extraDescription">Extra Description:</label>
          <textarea name="extratDescription" class="extraDescription" rows="8">You can use markdown</textarea>


          <div class="gap"></div>

          <label id="title" for="extraHex">Extra Color:</label>
          <input type="color" class="extraHex" name="extraHex" value="#ffffff">

           <div class="gap"></div>

           <a class="cancel remove">Delete</a>
        </form>`)

      document.querySelector(`#extra_${id} .remove`).addEventListener('click', function (event) {
        try {
          const element = event.currentTarget
          element.parentElement.remove()
        } catch { }
      });

    });

  } catch {
    // Sometimes productExtradata won't be there, and that's fine.
  }
}

function colourSelector() {
  try {
    const colourSelector = document.querySelector('#colourSelector');

    const iframe = document.querySelector('#newColourDialogueIframe');

    iframe.addEventListener('load', () => {
      const currentUrl = iframe.contentWindow.location.href;
      if (currentUrl == `${new URL(window.location).origin}/admin`) {
        document.querySelector('#newColourDialogue').close();
        htmx.trigger(document.querySelector('#colourSelector'), 'refreshdata');

        if (iframe.contentWindow.location.href !== `${new URL(window.location).origin}/admin/colours/new?uienabled=false`) {
            iframe.src = "/admin/colours/new?uienabled=false";
        }

        timeouts = [50, 75, 100, 150, 200, 250, 500]
        timeouts.forEach((timeout) => {
          setTimeout(() => {
            let usededid = [];
            document.querySelectorAll('.variant').forEach(variant => { usededid.push(variant.getAttribute("data-dbid")) });
            usededid.forEach(id => { document.querySelector(`#DBcolourId_${id}`).classList.add("hidden") });
          }, timeout);
        })

      }
    });

    colourSelector.addEventListener('click', (event) => {
      if (event.target.closest('#newColourDialogueButton')) {
          document.querySelector('#newColourDialogue').showModal();
        return;
      }


      const elid = event.target.id
      const dbid = elid.replace(/\D/g, '');
      const colourName = document.querySelector(`#${elid}`).textContent.replace(" 􀆊", "");
      const colourHex = event.target.querySelector(".colourBall").getAttribute('data-colour');


      const Extra = document.querySelector(`#productVariant`)

      let id = 0

      const Extras = Extra.children;

      try {
        if (Extras[Extras.length - 1].id) {
          id = parseInt(Extras[Extras.length - 1].id.replace("variant_", ""), 10) + 1
        }
      } catch { }


      Extra.insertAdjacentHTML("beforeend", `
        <form class="variant" id="variant_${id}" data-dbid="${dbid}">
            <div class="topInfo">
              <div class="colourInfo">
                <div class="colourBall" data-colour='${colourHex}'></div>
                ${colourName}
              </div>

              <div class="filler"></div>

              <div class="priceInfo">
                <div>$</div>
                <input type="number" class="variantPrice" value="" name="variantPrice">
              </div>
            </div>


            <label for="variantSizetype">Size type:</label>
            <select id="variantSizetype" name="variantSizetype">
              <option value="gendered">Gendered</option>
              <option value="unisex">Unisex</option>
              <option value="nonhumanarbitrarysize">Non-Human Arbitrary Size</option>
            </select>

            <div class="sizes">
              <div class="size typeF">
                <div class="sizeName">F:</div> <div class="filler"></div>

                <input type="checkbox" name="fsize" data-text="6" id="sizeCheckbox" />
                <input type="checkbox" name="fsize" data-text="7" id="sizeCheckbox" />
                <input type="checkbox" name="fsize" data-text="8" id="sizeCheckbox" />
                <input type="checkbox" name="fsize" data-text="9" id="sizeCheckbox" />
                <input type="checkbox" name="fsize" data-text="10" id="sizeCheckbox" />
                <input type="checkbox" name="fsize" data-text="11" id="sizeCheckbox" />
                <input type="checkbox" name="fsize" data-text="12" id="sizeCheckbox" />
              </div>

              <div class="size typeM">
                <div class="sizeName">M:</div> <div class="filler"></div>

                <input type="checkbox" name="msize" data-text="7" id="sizeCheckbox" />
                <input type="checkbox" name="msize" data-text="8" id="sizeCheckbox" />
                <input type="checkbox" name="msize" data-text="9" id="sizeCheckbox" />
                <input type="checkbox" name="msize" data-text="10" id="sizeCheckbox" />
                <input type="checkbox" name="msize" data-text="11" id="sizeCheckbox" />
                <input type="checkbox" name="msize" data-text="12" id="sizeCheckbox" />
                <input type="checkbox" name="msize" data-text="13" id="sizeCheckbox" />
              </div>

              <div class="size typeU hidden">
                <div class="sizeName">U:</div> <div class="filler"></div>

                <input type="checkbox" name="usize" data-text="6" id="sizeCheckbox" />
                <input type="checkbox" name="usize" data-text="7" id="sizeCheckbox" />
                <input type="checkbox" name="usize" data-text="8" id="sizeCheckbox" />
                <input type="checkbox" name="usize" data-text="9" id="sizeCheckbox" />
                <input type="checkbox" name="usize" data-text="10" id="sizeCheckbox" />
                <input type="checkbox" name="usize" data-text="11" id="sizeCheckbox" />
                <input type="checkbox" name="usize" data-text="12" id="sizeCheckbox" />
                <input type="checkbox" name="usize" data-text="13" id="sizeCheckbox" />
              </div>


              <div class="size typeS hidden">
                <div class="sizeName">Size:</div> <div class="filler"></div>

                <input type="checkbox" name="fsize" data-text="Size 1" id="sizeCheckbox" />
                <input type="checkbox" name="fsize" data-text="Size 2" id="sizeCheckbox" />
                <input type="checkbox" name="fsize" data-text="Size 3" id="sizeCheckbox" />
                <input type="checkbox" name="fsize" data-text="Size 4" id="sizeCheckbox" />
                <input type="checkbox" name="fsize" data-text="Size 5" id="sizeCheckbox" />
              </div>
            </div>



            <div class="gap"></div>

             <div class="filler"></div>

            <a class="cancel remove">Delete</a>
        </form>` );

      document.querySelector("#imageColor").insertAdjacentHTML("beforeend", `<option id="ColourOption_${dbid}" value="Colour_${dbid}">${colourName}</option>`)

      document.querySelector(`#variant_${id}`).addEventListener('change', (event) => {
        if (event.target.value == "gendered") {
          document.querySelector(`#variant_${id} .typeF`).classList.remove('hidden');
          document.querySelector(`#variant_${id} .typeM`).classList.remove('hidden');
          document.querySelector(`#variant_${id} .typeU`).classList.add('hidden');
          document.querySelectorAll(`#variant_${id} .typeU input[type="checkbox"]`).forEach(checkbox => { checkbox.checked = false; });
          document.querySelector(`#variant_${id} .typeS`).classList.add('hidden');
          document.querySelectorAll(`#variant_${id} .typeS input[type="checkbox"]`).forEach(checkbox => { checkbox.checked = false; });

        }

        if (event.target.value == "unisex") {
          document.querySelector(`#variant_${id} .typeF`).classList.add('hidden');
          document.querySelectorAll(`#variant_${id} .typeF input[type="checkbox"]`).forEach(checkbox => { checkbox.checked = false; });
          document.querySelector(`#variant_${id} .typeM`).classList.add('hidden');
          document.querySelectorAll(`#variant_${id} .typeM input[type="checkbox"]`).forEach(checkbox => { checkbox.checked = false; });
          document.querySelector(`#variant_${id} .typeU`).classList.remove('hidden');
          document.querySelector(`#variant_${id} .typeS`).classList.add('hidden');
          document.querySelectorAll(`#variant_${id} .typeS input[type="checkbox"]`).forEach(checkbox => { checkbox.checked = false; });
        }

        if (event.target.value == "nonhumanarbitrarysize") {
          document.querySelector(`#variant_${id} .typeF`).classList.add('hidden');
          document.querySelectorAll(`#variant_${id} .typeF input[type="checkbox"]`).forEach(checkbox => { checkbox.checked = false; });
          document.querySelector(`#variant_${id} .typeM`).classList.add('hidden');
          document.querySelectorAll(`#variant_${id} .typeM input[type="checkbox"]`).forEach(checkbox => { checkbox.checked = false; });
          document.querySelector(`#variant_${id} .typeU`).classList.add('hidden');
          document.querySelectorAll(`#variant_${id} .typeU input[type="checkbox"]`).forEach(checkbox => { checkbox.checked = false; });
          document.querySelector(`#variant_${id} .typeS`).classList.remove('hidden');
        }
      });

      document.querySelector(`#variant_${id} .remove`).addEventListener('click', function (event) {
        try {
          const element = event.currentTarget
          colourIDfromEL = event.currentTarget.parentElement.getAttribute('data-dbid');
          document.querySelector(`#DBcolourId_${colourIDfromEL}`).classList.remove('hidden');
          element.parentElement.remove()
          document.querySelector(`ColourOption_${dbid}`).remove()
        } catch { }
      });

      document.querySelector(`#DBcolourId_${dbid}`).classList.add('hidden');
      document.querySelector('#colorPicker').close();
    });
  } catch { }
}


function productImage() {
  try {
    const newExtra = document.querySelector('#newproductImage');

    const iframe = document.querySelector('#newImageDialogueIframe');

    iframe.addEventListener('load', () => {
      const currentUrl = iframe.contentWindow.location.href;

        if (currentUrl == `${new URL(window.location).origin}/admin`) {
          document.querySelector('#newImageDialogue').close();
          if (iframe.contentWindow.location.href !== `${new URL(window.location).origin}/admin/uploadimage?uienabled=false`) {
            iframe.src = "/admin/uploadimage?uienabled=false";
          }
        } else {
          const frameUrl = new URL(iframe.contentWindow.location.href);
          const path = frameUrl.pathname;
          const neededpath = "/static/photos/";

          if (path.includes(neededpath)) {
            document.querySelector('#newImageDialogue').close();
            if (iframe.contentWindow.location.href !== `${new URL(window.location).origin}/admin/uploadimage?uienabled=false`) {
              iframe.src = "/admin/uploadimage?uienabled=false";
            }

            const photo = path.replace(neededpath, "")
            const Extra = document.querySelector('#productImage');

            let id = 0

            const Extras = Extra.children;

            try {
              if (Extras[Extras.length - 1].id) {
                id = parseInt(Extras[Extras.length - 1].id.replace("image_", ""), 10) + 1
              }
            } catch { }

            const addHtml = `
            <form class="image" id="image_${id}">
              <div class="gap"></div>

              <img src="/static/photos/${photo}" >

              <div class="gap"></div>

              <label id="title" for="imageColor">Image Color:</label>
              <select name="imageColor">
                  ${document.querySelector("#imageColor").innerHTML}
              </select>


               <div class="gap"></div>

               <a class="cancel remove">Delete</a>
            </form>`

            Extra.insertAdjacentHTML("beforeend", addHtml);

            document.querySelector(`#image_${id} .remove`).addEventListener('click', function (event) {
              try {
                const element = event.currentTarget
                element.parentElement.remove()
              } catch { }
            });

          }
        }
    });

    newExtra.addEventListener('click', function () {
      document.querySelector('#newImageDialogue').showModal();
    });

  } catch {
    // Sometimes productImage won't be there, and that's fine.
  }
}



function saveproduct() {

  try {

    document.querySelector("#productsubmit").addEventListener("click", (event) => {

      const productName = document.querySelector("#productName").value
      const productType = document.querySelector("#productType").value
      let productDescription = document.querySelector("#productDescription").value
      if (productDescription == 'You can use markdown like *bold*,\n#H1\n#H2\n#H3,\nect.\n                ') {
        productDescription = ""
      }


      productobject = {
        "name": productName,
        "type": productType,
        "description": productDescription,
        "extradata": [],
        "variants": [],
        "images": [],
        "groups": {
          "sport": [],
          "vibe": [],
          "category": []
        },
      }


      document.querySelectorAll("#productExtradata form").forEach((el) => {
        extradata = {
          "name": el.querySelector(".extraName").value,
          "colour": el.querySelector(".extraHex").value,
          "description": el.querySelector(".extraDescription").value,
        }

        if (extradata = { name: '', colour: '#ffffff', description: 'You can use markdown' }) {
          return;
        }

        productobject[extradata].push(extradata)
      })

      document.querySelectorAll(".variant").forEach((el) => {
        variantobject = {
          "colourID": el.getAttribute("data-dbid"),
          "price": el.querySelector(".variantPrice").value,
          "M": [],
          "W": [],
          "U": [],
          "size": [],
        }

        el.querySelectorAll(".typeM input").forEach((el) => {
          if (el.value = 'on') {
            variantobject["M"].push(parseInt(el.getAttribute("data-text")))
          }
        })

        el.querySelectorAll(".typeW input").forEach((el) => {
          if (el.value = 'on') {
            variantobject["W"].push(parseInt(el.getAttribute("data-text")))
          }
        })

        el.querySelectorAll(".typeU input").forEach((el) => {
          if (el.value = 'on') {
            variantobject["U"].push(parseInt(el.getAttribute("data-text")))
          }
        })

        el.querySelectorAll(".typeS input").forEach((el) => {
          if (el.value = 'on') {
            variantobject["size"].push(parseInt(el.getAttribute("data-text")))
          }
        })

        productobject["variants"].push(variantobject)
      });



      Array.from(document.querySelector("#productSport").selectedOptions).forEach((el) => {
        productobject["groups"]["sport"].push(parseInt(el.value.replace("Sport_", "")))
      });

      Array.from(document.querySelector("#productCategory").selectedOptions).forEach((el) => {
        productobject["groups"]["category"].push(parseInt(el.value.replace("Category__", "")))
      });

      Array.from(document.querySelector("#productVibe").selectedOptions).forEach((el) => {
        productobject["groups"]["vibe"].push(parseInt(el.value.replace("Vibe__", "")))
      });

      document.querySelectorAll("#productImage form").forEach((el) => {
        image = {
          "file": new URL(el.querySelector("img").src).pathname.replace("/static/photos/", ""),
          "colourID": el.querySelector("select").value.replace("Colour_", ""),
        }
        productobject["images"].push(image)
      })

      console.log(productobject)
    });

  } catch { }
}



htmxOnchange()
login()
descriptioncontent()
newColour()
newProduct()
newproductVariant()
colourSelector()
productExtradata()
productImage()
saveproduct()
