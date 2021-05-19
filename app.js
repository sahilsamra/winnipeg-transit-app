const form = document.querySelector(`form`);
const input = form.querySelector(`input`);
const apiKey = `Ehg5Nso4pNe0kGRIfPW`;
const streetContainer = document.querySelector(`.streets`);
const tableContainer = document.querySelector(`tbody`);

form.addEventListener(`keypress`, function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    buildStreetList(input.value);
  }
});

streetContainer.addEventListener(`click`, function (event) {
  if (event.target.tagName === `A`) {
    buildStreetNameHeader(event.target.textContent);
    buildSchedualTable(event.target.dataset.streetKey);
  }
});

function getStreetName(inputStName) {
  return fetch(
    `https://api.winnipegtransit.com/v3/streets.json?api-key=${apiKey}&name=${inputStName}&usage=long`
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`There is a problem in street name (;T__T:)`);
      }
    })
    .then((json) => json.streets);
}

function buildStreetList(inputStName) {
  let html = ``;
  streetContainer.innerHTML = ``;

  getStreetName(inputStName).then((streetArray) => {
    if (streetArray.length !== 0) {
      streetArray.forEach((ele) => {
        html += `<a href="#" data-street-key="${ele.key}">${ele.name}</a>`;
      });
    } else {
      html = `No Streets found`;
    }

    streetContainer.insertAdjacentHTML(`beforeend`, html);
  });
}

function buildStreetNameHeader(streetName) {
  const streetNameEle = document.querySelector(`#street-name`);
  streetNameEle.textContent = ``;
  streetNameEle.textContent = `Displaying results for ${streetName}`;
}

function buildSchedualTable(streetKey) {
  let html = ``;
  tableContainer.innerHTML = ``;

  getScheduleArray(streetKey).then((scheduleArray) => {
    for (let schedule of scheduleArray) {
      for (let routeSchedule of schedule[`route-schedules`]) {
        html += ` <tr>
                      <td>${schedule.stop.street.name}</td>
                      <td>${schedule.stop[`cross-street`].name}</td>
                      <td>${schedule.stop.direction}</td>
                      <td>${routeSchedule.route.number}</td>
                      <td>${timeFormatter(
                        routeSchedule[`scheduled-stops`][0].times.departure
                          .estimated
                      )}</td>
                    </tr>`;
      }
    }

    tableContainer.insertAdjacentHTML(`beforeend`, html);
  });
}

function getScheduleArray(streetKey) {
  return gstStopNamesInStreet(streetKey).then((stopArray) => {
    const jsonPromise = [];
    const stopKeyArray = stopArray.map((ele) => ele.key);

    for (let stopKey of stopKeyArray) {
      jsonPromise.push(
        fetch(
          `https://api.winnipegtransit.com/v3/stops/${stopKey}/schedule.json?api-key=${apiKey}&max-results-per-route=2`
        )
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error(`There is a problem in stop names (;T__T:)`);
            }
          })
          .then((json) => json[`stop-schedule`])
      );
    }

    return Promise.all(jsonPromise);
  });
}

function gstStopNamesInStreet(streetKey) {
  return fetch(
    `https://api.winnipegtransit.com/v3/stops.json?street=${streetKey}&api-key=${apiKey}`
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`There is a problem in stop names (;T__T:)`);
      }
    })
    .then((json) => json.stops);
}

function timeFormatter(timeString) {
  const time = new Date(timeString);
  const options = {
    timeZone: `Canada/Central`,
    hour12: true,
    hour: `numeric`,
    minute: `numeric`,
  };
  return time.toLocaleTimeString(`en-US`, options);
}