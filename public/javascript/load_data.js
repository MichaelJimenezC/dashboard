import {
  tiempoArr,
  precipitacionArr,
  uvArr,
  temperaturaArr,
} from "./static_data.js";

let fechaActual = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


let cargarTemperatura = (data) => {
  //Obtenga la fecha actual
  let actual = fechaActual();
  //Defina un arreglo temporal vacío
  let max = 0;
  let min = 0;
  let prom = 0;
  let tiempoArray = data['daily']['time']
  for (let index = 0; index < tiempoArray.length; index++) {
    const tiempo = tiempoArray[index];
    const temp_max = data['daily']['temperature_2m_max'][index];
    const temp_min = data['daily']['temperature_2m_min'][index];
    if (tiempo == (actual)) {
      console.log("entré")
      max = temp_max
      min = temp_min
    }
  }
  prom = (max + min) / 2
  let temperaturaMinValue = document.getElementById("temperaturaMinValue");
  let temperaturaPromValue = document.getElementById(
    "temperaturaPromValue"
  );
  let temperaturaMaxValue = document.getElementById("temperaturaMaxValue");
  //Actualice los elementos HTML con los valores correspondientes
  temperaturaMinValue.textContent = `Min ${min} [mm]`;
  temperaturaPromValue.textContent = `Prom ${Math.round(prom * 100) / 100
    } [mm]`;
  temperaturaMaxValue.textContent = `Max ${max} [mm]`;


};


let cargarDatos = (data, prop, minId, promId, maxId) => {
  // Obtén la fecha actual
  let actual = fechaActual();

  // Define un arreglo temporal vacío
  let datos = [];
  let tiempoArray = data['hourly']['time'];

  // Itera en el arreglo tiempoArr para filtrar los valores de prop que sean igual con la fecha actual
  for (let index = 0; index < tiempoArray.length; index++) {
    const tiempo = tiempoArray[index];
    const valor = data['hourly'][prop][index];

    if (tiempo.includes(actual)) {
      datos.push(valor);
    }
  }

  // Con los valores filtrados, obtén los valores máximo, promedio y mínimo
  let max = Math.max(...datos);
  let min = Math.min(...datos);
  let sum = datos.reduce((a, b) => a + b, 0);
  let prom = sum / datos.length || 0;

  // Obtén la referencia a los elementos HTML con los IDs proporcionados
  let minElement = document.getElementById(minId);
  let promElement = document.getElementById(promId);
  let maxElement = document.getElementById(maxId);

  // Actualiza los elementos HTML con los valores correspondientes
  minElement.textContent = `Min ${min} [mm]`;
  promElement.textContent = `Prom ${Math.round(prom * 100) / 100} [mm]`;
  maxElement.textContent = `Max ${max} [mm]`;
};


let cargarFechaActual = () => {
  //Obtenga la referencia al elemento h6
  //Obtenga la referencia al elemento h6
  let coleccionHTML = document.getElementsByTagName("h6");

  let tituloH6 = coleccionHTML[0];
  //Actualice la referencia al elemento h6 con el valor de la función fechaActual()
  tituloH6.textContent = fechaActual();
};


let cargarOpenMeteo = () => {
  //URL que responde con la respuesta a cargar
  let URL =
    "https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&current=temperature_2m,rain,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto";

  fetch(URL)
    .then((responseText) => responseText.json())
    .then((responseJSON) => {
      console.log(responseJSON)
      cargarTemperatura(responseJSON);
      cargarDatos(responseJSON, 'precipitation', 'precipitacionMinValue', 'precipitacionPromValue', 'precipitacionMaxValue');
      cargarDatos(responseJSON, 'uv_index', 'uvMinValue', 'uvPromValue', 'uvMaxValue');

      //Respuesta en formato JSON
      //Referencia al elemento con el identificador plot
      let plotRef = document.getElementById("plot1");

      //Etiquetas del gráfico
      let labels = responseJSON.hourly.time;

      //Etiquetas de los datos
      let data = responseJSON.hourly.temperature_2m;

      //Objeto de configuración del gráfico
      let config = {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Temperatura [2m]",
              data: data,
              borderColor: '#800080',
              backgroundColor: '#800080',
            },
          ],
        },
      };

      //Objeto con la instanciación del gráfico
      let chart1 = new Chart(plotRef, config);
    })
    .catch(console.error);
};


let parseXML = (responseText) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(responseText, "application/xml");
  console.log(xml);

  // Referencia al elemento `#forecastbody` del documento HTML

  let forecastElement = document.querySelector("#forecastbody");
  forecastElement.innerHTML = "";

  // Procesamiento de los elementos con etiqueta `<time>` del objeto xml
  let timeArr = xml.querySelectorAll("time");

  timeArr.forEach((time) => {
    let from = time.getAttribute("from").replace("T", " ");

    let humidity = time.querySelector("humidity").getAttribute("value");
    let windSpeed = time.querySelector("windSpeed").getAttribute("mps");
    let precipitation = time
      .querySelector("precipitation")
      .getAttribute("probability");
    let pressure = time.querySelector("pressure").getAttribute("value");
    let cloud = time.querySelector("clouds").getAttribute("all");

    let template = `
          <tr>
              <td>${from}</td>
              <td>${humidity}</td>
              <td>${windSpeed}</td>
              <td>${precipitation}</td>
              <td>${pressure}</td>
              <td>${cloud}</td>
          </tr>
      `;

    //Renderizando la plantilla en el elemento HTML
    forecastElement.innerHTML += template;
  });
};


// Función para realizar la petición a la API y actualizar el localStorage
async function fetchAndUpdateCityData(cityName, APIkey) {
  try {
    let url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&mode=xml&appid=${APIkey}`;
    let response = await fetch(url);
    let responseText = await response.text();
    parseXML(responseText);
    localStorage.setItem(
      cityName,
      JSON.stringify({ data: responseText, timestamp: new Date().getTime() })
    );
  } catch (error) {
    console.error("Error al realizar la petición:", error);
  }
}


// Callback async para manejar la selección de la ciudad
let selectListener = async (event) => {
  let selectedCity = event.target.value;
  let cityIdMap = {
    'Guayaquil': '3657509',
    'Machala': '3654533',
    'Quito': '3652462',
  };
  let cityId = cityIdMap[selectedCity];

  if (cityId) {
    loadOpenWeatherMapWidget(cityId);
  }
  let cityStorage = localStorage.getItem(selectedCity);

  // API key
  let APIkey = "15c22b52f3d8d6c4b70d75e8eeaba391";

  if (!cityStorage) {
    // Si la ciudad no está en el localStorage, realiza la petición y actualiza los datos
    await fetchAndUpdateCityData(selectedCity, APIkey);
  } else {
    let storedData = JSON.parse(cityStorage);
    let storedTimestamp = storedData.timestamp;
    let currentTimestamp = new Date().getTime();
    if (currentTimestamp - storedTimestamp > 3 * 60 * 60 * 1000) {
      // Si han pasado más de 3 horas, actualiza los datos
      await fetchAndUpdateCityData(selectedCity, APIkey);
    } else {
      // Si no han pasado 3 horas, utiliza los datos almacenados
      parseXML(storedData.data);
    }
  }
};



let loadForecastByCity = () => {
  let selectElement = document.querySelector("select");
  selectElement.addEventListener("change", selectListener);

};


let loadExternalTable = async () => {

  //Requerimiento asíncrono
  let proxyURL = 'https://cors-anywhere.herokuapp.com/'
  let url = proxyURL + 'https://www.gestionderiesgos.gob.ec/monitoreo-de-inundaciones/'
  let response = await fetch(url);
  let responseText = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(responseText, "text/html");
  let elementoXML = xml.querySelector("#postcontent table");
  let elementoDOM = document.getElementById("monitoreo")
  elementoDOM.innerHTML = elementoXML.outerHTML




}
let loadOpenWeatherMapWidget = (idCity) => {
  // Limpia el contenedor del widget si ya existe
  let widgetContainer = document.getElementById('openweathermap-widget-11');
  if (widgetContainer) {
    // Limpia el contenido del contenedor
    widgetContainer.innerHTML = '';
    // Elimina cualquier instancia previa del widget para evitar duplicados
    window.myWidgetParam = [];
  } else {
    // Si no existe el contenedor, lo crea
    widgetContainer = document.createElement('div');
    widgetContainer.id = 'openweathermap-widget-11';
    document.body.appendChild(widgetContainer); // O el lugar específico donde debe ir el widget
  }

  // Añade los parámetros del widget
  window.myWidgetParam.push({
    id: 11,
    cityid: idCity,
    appid: '15c22b52f3d8d6c4b70d75e8eeaba391',
    units: 'metric',
    containerid: 'openweathermap-widget-11',
  });

  // Encuentra si ya se ha cargado el script del widget
  let existingScript = document.querySelector('script[src="//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js"]');
  if (existingScript) {
    // Elimina el script existente para forzar la recarga
    existingScript.remove();
  }

  // Crea un nuevo script para el widget
  let script = document.createElement('script');
  script.async = true;
  script.charset = 'utf-8';
  script.src = '//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js';
  // Añade el nuevo script al documento
  document.body.appendChild(script);
};


//ZONA CLIMA ACTUAL
let weather_interpretation = {
  0: 'Cielo despejado',
  1: 'Completamente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  80: 'Lluvia ligera'
};


let current_time = (data) => {
  const current_timeHTML = document.getElementById('current_time');
  let maxim = data['current_weather']['time']
  let fecha = maxim.split('T')
  current_timeHTML.textContent = fecha[1] + " " + fecha[0];
}


let temperatura = (data) => {
  const temperaturaHTML = document.getElementById('temperatura');
  let maxim = data['current_weather']['temperature']
  temperaturaHTML.textContent = maxim + ' ' + data['daily_units']['temperature_2m_max'];
}


let windspeed = (data) => {
  const windspeedHTML = document.getElementById('windspeed');
  let maxim = data['current_weather']['windspeed']
  windspeedHTML.textContent = maxim + ' ' + data['daily_units']['windspeed_10m_max'];
}


let weathercode = (data) => {
  const weathercodeHTML = document.getElementById('weathercode');
  let maxim = data['current_weather']['weathercode']
  let claves = Object.keys(weather_interpretation);
  for (let i = 0; i < claves.length; i++) {
    let clave = claves[i];
    if (clave == maxim) {
      weathercodeHTML.textContent = weather_interpretation[maxim];
    }
  }
}

let timezone = (data) => {
  let timezone = data['timezone']
  const timezoneHTML = document.getElementById('timezone')
  timezoneHTML.textContent = timezone
}


//Carga datos que van a ser llamados
let load = () => {
  let URL = 'https://api.open-meteo.com/v1/forecast?latitude=-2.20&longitude=-79.89&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max&current_weather=true&start_date=2023-06-22&end_date=2023-06-29&timezone=auto';
  fetch(URL)
    .then(response => response.json())
    .then(data => {
      temperatura(data);
      windspeed(data);
      weathercode(data);
      timezone(data);
      current_time(data);
      plotminvsmax(data);
      plotmin(data);
      precipitation_probability(data);

    })
    .catch(console.error);

}


//Temperatura semanal de temperaturas minimas vs maximas
let plotminvsmax = (data) => {
  const ctx = document.getElementById('plot2');
  const dataset = {
    labels: data.daily.time, /* ETIQUETA DE DATOS */
    datasets: [{
      label: 'Temperatura semanal minima', /* ETIQUETA DEL GRÁFICO */
      data: data.daily.temperature_2m_min, /* ARREGLO DE DATOS */
      fill: false,
      tension: 0.5,
      backgroundColor: 'rgba(54, 162, 235, 0.2)', // Color de fondo
      borderColor: 'rgba(54, 162, 235, 1)', // Color del borde
      borderWidth: 1,// Ancho del borde
    },
    {
      label: 'Temperatura semanal maxima', /* ETIQUETA DEL GRÁFICO */
      data: data.daily.temperature_2m_max, /* ARREGLO DE DATOS */
      fill: false,
      tension: 0.5,
      backgroundColor: 'rgba(255, 159, 64, 1)', // Color de fondo
      borderColor: 'rgba(255, 159, 64, 1)', // Color del borde
      borderWidth: 1,// Ancho del borde
    }
    ]
  };
  const config = {
    type: 'line',
    data: dataset,
  };
  const chart = new Chart(ctx, config);
}


let plotmin = (data) => {
  const ctx = document.getElementById('plot4');
  const dataset = {
    labels: data.daily.time, /* ETIQUETA DE DATOS */
    datasets: [{
      label: 'Precipitaciones en la semana', /* ETIQUETA DEL GRÁFICO */
      data: data.daily.precipitation_sum, /* ARREGLO DE DATOS */
      fill: false,
      tension: 0.1,
      backgroundColor: 'rgba(54, 162, 235, 0.2)', // Color de fondo
      borderColor: 'rgba(54, 162, 235, 1)', // Color del borde
      borderWidth: 1,// Ancho del borde
    }]
  };
  const config = {
    type: 'bar',
    data: dataset,
  };
  const chart = new Chart(ctx, config);
}


let precipitation_probability = (data) => {
  //Referencia al elemento con el identificador plot
  let plotRef = document.getElementById("plot3");

  //Etiquetas del gráfico
  let labels = data.hourly.time;

  //Etiquetas de los datos

  let data3 = data.hourly.precipitation_probability;

  //Objeto de configuración del gráfico
  let config = {
    type: "line",
    data: {
      labels: labels,
      datasets: [

        {
          label: "Probabilidad de precipitación",
          data: data3,
          borderColor: '#14a44d',
          backgroundColor: '#14a44d',
        },
      ],
    },
  };

  //Objeto con la instanciación del gráfico
  let chart1 = new Chart(plotRef, config);
}

load();
loadExternalTable();
loadForecastByCity();
cargarFechaActual();
cargarOpenMeteo();
