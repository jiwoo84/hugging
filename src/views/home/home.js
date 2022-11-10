import * as Api from "/api.js";
import { addCommas } from "/useful-functions.js";

const bestContainer = document.querySelector(".bestContainer");
const newContainer = document.querySelector(".newContainer");
const splashImg = document.querySelector(".splashImg");
const splashContainer = document.querySelector(".splashContainer");

createDB();
getDataFromApi();

async function getDataFromApi() {
  const data = await Api.get("/api/items");
  // data = [ [{...},{...}...{...}:8개] , [{...}{}{}:3개] ]
  const { bestItems, newItems } = data;

  bestContainer.appendChild(draw(bestItems, "bestItem"));
  newContainer.appendChild(draw(newItems, "newItem"));

  attachBtn();
}

function draw(Items, className) {
  const card = document.createElement("div");
  card.setAttribute("class", "containerLayout");
  for (let i = 0; i < Items.length; i++) {
    card.innerHTML += `
    <div id="${Items[i]._id}" class="${className}">
      <img src="${Items[i].imageUrl}">
      <h3>${Items[i].name}</h3>
      <div>
<<<<<<< HEAD
        <p>${addCommas(Items[i].price)} 원 </p>
=======
        <p>${(Items[i].price).toLocaleString('ko-KR')} 원 </p>
>>>>>>> 52c3a37d1d81d4a490ce59dc634f74c464c719bd
        <h4> | </h4>
        <small>  ${Items[i].category}</small>
      </div>
    </div>
    `;
  }
  return card;
}

function createDB() {
  if (window.indexedDB) {
    const databaseName = "cart";
    const version = 1;

    const request = indexedDB.open(databaseName, version);

    request.onupgradeneeded = function () {
      request.result.createObjectStore("items", { keyPath: "id" });
      request.result.createObjectStore("nowBuy", { keyPath: "id" });
    };
    request.onsuccess = function () {};
    request.onerror = function (event) {
      alert(event.target.errorCode);
    };
  }
}

function attachBtn() {
  const detailToBtns = document.querySelectorAll(".bestItem");
  const newItemToBtns = document.querySelectorAll(".newItem");

  console.log(detailToBtns);

  detailToBtns.forEach((detailToBtn) => {
    detailToBtn.addEventListener("click", () => {
      const id = detailToBtn.id;
      localStorage.setItem("itemDetail", `${id}`);
      location.href = "/detail";
    });
  });

  newItemToBtns.forEach((newItemToBtn) => {
    newItemToBtn.addEventListener("click", () => {
      const id = newItemToBtn.id;
      localStorage.setItem("itemDetail", `${id}`);
      location.href = "/detail";
    });
  });
}

window.onload = function enterCheck() {
  if (sessionStorage.getItem("enterIn") !== "show") {
    const splashImg = document.createElement("img");
    splashImg.setAttribute("src", "../public/img/splashImg.jpg");
    splashImg.setAttribute("class", "splashImg");
    splashContainer.appendChild(splashImg);
    sessionStorage.setItem("enterIn", "show");
    setTimeout(() => {
      splashContainer.removeChild(splashImg);
    }, 1500);
    return;
  }
  splashContainer.removeChild(splashImg);
};
