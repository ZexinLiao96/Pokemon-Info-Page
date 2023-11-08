window.addEventListener("load", async function () {

    //get all pokemon names for initializing the head bar
    const pokemonNamesObject = await fetch("/getAllPokemonNames");
    const pokemonNames = await pokemonNamesObject.json();

    //get a random pokemon for initializing the rest of the page
    const randomPokemonObject = await fetch("/getRandomPokemon")
    const randomPokemon = await randomPokemonObject.json();

    //initialize the head bar
    const header = document.getElementById("header");
    const div = document.createElement("div");
    div.setAttribute("id", "imageDiv");
    header.appendChild(div);
    pokemonNames.forEach(function (pokemonName) {
        const img = document.createElement("img");
        div.appendChild(img);
        img.setAttribute("src", `images/${pokemonName}_white.png`);
        img.setAttribute("id", `${pokemonName}`);
        img.onmouseover = function () {
            img.setAttribute("src", `images/${pokemonName}.png`);
        }
        img.onmouseleave = function () {
            img.setAttribute("src", `images/${pokemonName}_white.png`);
        }
        img.addEventListener("click", function () {
            displayPokemon(pokemonName);
        })
    });

    //initialize the like button
    const likeButtonDiv = document.createElement("div");
    header.appendChild(likeButtonDiv);
    likeButtonDiv.setAttribute("id","likeButtonDiv")
    const likeButton = document.createElement("img");
    likeButtonDiv.appendChild(likeButton);
    likeButton.setAttribute("id", "likeButton");
    likeButton.setAttribute("src", "css/pokeball_white.png")
    likeButton.addEventListener("click", function () {
        const thisPokemon = document.querySelector("#imageDiv .onPage");
        const thisPokemonName = thisPokemon.id;
        if (!likeButton.classList.contains("liked")) {
            setLikeButtonToLike(thisPokemonName);
            document.cookie = `${thisPokemonName}=liked`;
        } else {
            setLikeButtonToNotLike(thisPokemonName);
            document.cookie = `${thisPokemonName}=not_liked`;
        }
        renewIcons();
    });
    const likeButtonHint = document.createElement("p");
    likeButtonDiv.appendChild(likeButtonHint);

    //initialize the rest of the page
    await displayPokemon(randomPokemon.name);
});

async function displayPokemon(pokemonName) {

    //get the pokemon for displaying
    const pokemonObject = await fetch(`/getPokemonByName?pokemonName=${pokemonName}`);
    const pokemon = await pokemonObject.json();
    const main = document.querySelector("#main");
    main.innerHTML = "";
    const title1 = document.createElement("h2");
    main.appendChild(title1);
    title1.innerHTML = `Pokemon Details For ${pokemon.name} :`;

    main.innerHTML += `
        <img src="images/${pokemon.imageUrl}" alt="an image of ${pokemon.name}">
        <p>Types: </p>
        <ul></ul>
        <p>Descriptions:</p>
        <p>${pokemon.description}</p>
    `;

    const title2 = document.createElement("h3");
    main.appendChild(title2);
    title2.innerHTML = `Pokemon Type Data For ${pokemon.name} :`
    const tableDiv = document.createElement("div")
    main.appendChild(tableDiv);
    tableDiv.setAttribute("id", "tableDiv")

    for (const type of pokemon.types) {
        const ul = document.querySelector("ul");
        const li = document.createElement("li");
        ul.appendChild(li);
        li.innerHTML = `${type}`

        const div = document.createElement("div");
        div.setAttribute("class", "tables");
        tableDiv.appendChild(div);
        div.innerHTML += `<p>${type}</p>`;
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr><th>Against Type</th><th>Effectiveness</th></tr>
            </thead>
        `;
        div.appendChild(table);
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);
        const effectivenessesObject = await fetch(`/getTypeByName?types=${type}`);
        const effectivenesses = await effectivenessesObject.json();
        for (const effectiveness of effectivenesses.data) {
            tbody.innerHTML +=
                `<tr>
                    <td class="${effectiveness.against}">${effectiveness.against}</td>
                    <td class="${effectiveness.effectiveness}">${effectiveness.effectiveness}</td>
                </tr>`;
        }
    }

    const title3 = document.createElement("h3");
    main.appendChild(title3);
    title3.innerHTML = `Pokemon Ability Data for ${pokemonName} :`
    const ol = document.createElement("ol");
    main.appendChild(ol);
    const fullPokemonObject = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}/`);
    const fullPokemon = await fullPokemonObject.json();
    const pokemonAbilities = fullPokemon.abilities;
    console.log(pokemonAbilities);
    for (let i = 0; i < pokemonAbilities.length; i++) {
        const li = document.createElement("li");
        ol.appendChild(li);
        li.innerHTML = `<strong>${pokemonAbilities[i].ability.name.toUpperCase()}:</strong><br>`;
        const thisAbilityObject = await fetch(`${pokemonAbilities[i].ability.url}`)
        const thisAbility = await thisAbilityObject.json();
        for (let j = 0; j < thisAbility.effect_entries.length; j++) {
            if (thisAbility.effect_entries[j].language.name==="en"){
                li.innerHTML += thisAbility.effect_entries[j].effect;
                break;
            }
        }
    }

    renewIcons();
    renewLikeButton(pokemonName);
}

function renewIcons() {
    const cookies = document.cookie.split(';');
    const icons = document.querySelectorAll("#imageDiv img");

    icons.forEach(function (icon) {
        const nameTemp = icon.id + "=";
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.indexOf(nameTemp) === 0 && cookie.substring(nameTemp.length, cookie.length) === "liked") {
                setIconToLike(icon.id);
                break;
            }
            setIconToNotLike(icon.id);
        }
    })
}

function setIconToLike(pokemonName) {
    const thisPokemonIcon = document.querySelector(`#${pokemonName}`);
    thisPokemonIcon.setAttribute("src", `images/${pokemonName}.png`)
    thisPokemonIcon.onmouseover = null;
    thisPokemonIcon.onmouseleave = null;
}

function setIconToNotLike(pokemonName) {
    const thisPokemonIcon = document.getElementById(`${pokemonName}`);
    thisPokemonIcon.setAttribute("src", `images/${pokemonName}_white.png`)
    thisPokemonIcon.onmouseover = function () {
        thisPokemonIcon.setAttribute("src", `images/${pokemonName}.png`);
    }
    thisPokemonIcon.onmouseleave = function () {
        thisPokemonIcon.setAttribute("src", `images/${pokemonName}_white.png`);
    }
}

function renewLikeButton(pokemonName) {
    setAsOnPage(pokemonName);

    const name = pokemonName + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const c = cookies[i].trim();
        if (c.indexOf(name) === 0 && c.substring(name.length, c.length) === "liked") {
            setLikeButtonToLike();
            break;
        }
        setLikeButtonToNotLike();
    }
}

function setAsOnPage(pokemonName) {
    const pokemonIcons = document.querySelectorAll("#header img");
    pokemonIcons.forEach(function (pokemonIcon) {
        pokemonIcon.classList.remove("onPage");
    })
    const pokemonOnPageIcon = document.querySelector(`#${pokemonName}`)
    pokemonOnPageIcon.classList.add("onPage");
}

function setLikeButtonToLike() {
    const likeButton = document.querySelector("#likeButton")
    likeButton.classList.add("liked");
    likeButton.setAttribute("src", "css/pokeball.png");
    const likeButtonHint = document.querySelector("#likeButtonDiv p");
    likeButtonHint.innerHTML = `&nbsp;Favored&nbsp;`;
}

function setLikeButtonToNotLike() {
    const likeButton = document.querySelector("#likeButton")
    likeButton.classList.remove("liked");
    likeButton.setAttribute("src", "css/pokeball_white.png");
    const likeButtonHint = document.querySelector("#likeButtonDiv p");
    likeButtonHint.innerHTML = "Unfavored";
}