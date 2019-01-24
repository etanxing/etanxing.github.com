const root = document.getElementById('root');

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const id = getParameterByName('p');

if (!id) window.location.replace('https://twitter.com/adoptapetatsa');

fetch(
  `https://gv5wp4nyl5.execute-api.ap-southeast-2.amazonaws.com/dev/getpets/${id}`
)
  .then(resp => resp.json())
  .then(data => {
    document.title = `${data.type} in ${
      data.location
    } | Workswell - Frontend Development Specialist`;
    const mockup = `<h1>Hey, we found following pets in ${data.location}</h1>
	<span><i>Note: Some pets may be unavailable after <time>${data.dt ||
    dateFns.format(
      dateFns.addHours(new Date(data.ts), 2),
      'Do MMMM YYYY, HH:mm'
    )}</time></i></span>
  <ul class="mdc-image-list mdc-image-list--masonry masonry-image-list">
  ${data.pets
    .map(pet => {
      const img = `<a href="https://www.adoptapet.com.au/pet/${pet.id}">
                    <img class="mdc-image-list__image" src="${
                      pet.img
                        ? 'https://www.adoptapet.com.au/' + pet.img
                        : 'https://via.placeholder.com/300x200?text=@adoptapetatsa'
                    }
          "></a>`;
      return `<li class="mdc-image-list__item">${img}<div class="mdc-image-list__supporting"><span class="mdc-image-list__label">${
        pet.sex
      }, ${pet.age}, ${pet.breed} </span></div>
</li>`;
    })
    .join('')}
  </ul>`;
    root.innerHTML = mockup;
  })
  .catch(() => window.location.replace('https://twitter.com/adoptapetatsa'));

const [location2, type2, datetime2] = id
  .replace('-and-', ' & ')
  .toUpperCase()
  .split('-');

document.title = `${type2} in ${location2} | Workswell - Frontend Development Specialist`;
root.innerHTML = `<h1>Hey, we found following pets in ${location2}</h1><div id="loader"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>`;
