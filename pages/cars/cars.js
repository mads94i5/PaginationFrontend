import { paginator } from "../../lib/paginator/paginate.js"
import { sanitizeStringWithTableRows } from "../../utils.js"
const SERVER_URL = "http://localhost:8080/"
let SORTBY = "brand"
let SORTORDER = "asc"
let PAGE = 1
let SIZE = 10
let TOTAL_RECORDS
let TOTAL
let queryString
let cars = [];

//If not used with Navigo, just leave out match
export async function load(pg, match) {
  const inputField = document.getElementById("show-size");
  SIZE = inputField.value;
  PAGE = Number(match?.params?.page || pg);

  inputField.oninput = function() {
    SIZE = inputField.value;
    load(1);
  };

  document.getElementById("header-brand").addEventListener("click", () => {
    handleSort("brand", 1, match);
  });
  
  document.getElementById("header-model").addEventListener("click", () => {
    handleSort("model", 1, match);
  });
  
  document.getElementById("header-color").addEventListener("click", () => {
    handleSort("color", 1, match);
  });
  
  document.getElementById("header-kilometers").addEventListener("click", () => {
    handleSort("kilometers", 1, match);
  });

  TOTAL_RECORDS = await loadCarsTotal();
  TOTAL = Math.ceil(TOTAL_RECORDS / SIZE) - 1;
  cars = await loadCars(PAGE);
  const rows = generateTableRows(cars);

  // DON'T forget to sanitize the string before inserting it into the DOM
  document.getElementById("tbody").innerHTML = sanitizeStringWithTableRows(rows)


  // (C1-2) REDRAW PAGINATION
  paginator({
    target: document.getElementById("car-paginator"),
    total: TOTAL,
    current: PAGE,
    click: load
  });

  //Update URL to allow for CUT AND PASTE when used with the Navigo Router (callHandler: false ensures the handler will not be called twice)
  window.router?.navigate(`/cars${queryString}`, { callHandler: false, updateBrowserURL: true })
}

function handleSort(field, pageNo, match) {
  if (SORTBY === field) {
    SORTORDER = SORTORDER == "asc" ? "desc" : "asc"
  } else {
    SORTBY = field
    SORTORDER = "asc"
  }
  load(pageNo, match)
}

async function loadCars(PAGE) {
  queryString = `?size=${SIZE}&page=${PAGE}&sort=${SORTBY},${SORTORDER}`;
  try {
    const response = await fetch(`${SERVER_URL}api/cars/page${queryString}`);
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function loadCarsTotal() {
  try {
    const response = await fetch(`${SERVER_URL}api/cars/count`);
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}

function generateTableRows(cars) {
  return cars.map((car) => `
    <tr>
      <td>${car.brand}</td>
      <td>${car.model}</td>
      <td>${car.color}</td>
      <td>${car.kilometers}</td>
    </tr>
  `).join("");
}