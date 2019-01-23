const root = document.getElementById("root");

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const id = getParameterByName("p");

if (!id) window.location.replace("https://twitter.com/adoptapetatsa");

fetch(
  `https://gv5wp4nyl5.execute-api.ap-southeast-2.amazonaws.com/dev/getpets/${id}`
)
  .then(resp => resp.json())
  .then(data => {
    document.title = `${data.type} in ${
      data.location
    } | Workswell - Frontend Development Specialist`;
    const mockup = `<h1>Hey, we found following pets in ${data.location}</h1>
	<span><i>Note: Some pets may be unavailable after <time>${
    data.dt || dateFns.format(dateFns.addHours(new Date(data.ts), 2), 'Do MMMM YYYY, HH:mm')
  }</time></i></span>
  <ol id="petlist">
  ${data.pets.map((pet, index) => {
    const img = pet.img
      ? `<p><a href="https://www.adoptapet.com.au/pet/${
          pet.id
        }"><img src="https://www.adoptapet.com.au/${
          pet.img
        }" style="width: 100%; max-width: 300px;"></a></p>`
      : "";
    return `<li>${index + 1}. <b>${pet.name}</b> - ${pet.sex}, ${pet.age}, ${
      pet.breed
    } ${img}
  <p><a href="https://www.adoptapet.com.au/pet/${
    pet.id
  }" class="button">More details</a></p>
</li>`;
  }).join('')}
  </ol>`;
    root.innerHTML = mockup;
  })
  .catch(() => window.location.replace("https://twitter.com/adoptapetatsa"));

const [ location2, type2, datetime2] = id.replace('-and-',' & ').toUpperCase().split('-');

document.title = `${type2} in ${location2} | Workswell - Frontend Development Specialist`;
root.innerHTML = `<h1>Hey, we found following pets in ${location2}</h1><div id="loader"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>`