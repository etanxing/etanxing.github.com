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
    data.dt
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
    console.log('mockup', mockup)
    root.innerHTML = mockup;
  });
