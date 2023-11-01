import {
    tiempoArr,
    precipitacionArr,
    uvArr,
    temperaturaArr,
} from "./static_data.js";
let fechaActual = () => new Date().toISOString().slice(0, 10);
let cargarPrecipitacion = () => {
    //Obtenga la fecha actual
    let actual = fechaActual();

    //Defina un arreglo temporal vacío
    let datos = [];
    //Itere en el arreglo tiempoArr para filtrar los valores de precipitacionArr que sean igual con la fecha actual
    for (let index = 0; index < tiempoArr.length; index++) {
        const tiempo = tiempoArr[index];
        const precipitacion = precipitacionArr[index];

        if (tiempo.includes(actual)) {
            datos.push(precipitacion);
        }
    }
    let max = Math.max(...datos);
    let min = Math.min(...datos);
    let sum = datos.reduce((a, b) => a + b, 0);
    let prom = sum / datos.length || 0;
    let precipitacionMinValue = document.getElementById("precipitacionMinValue");
    let precipitacionPromValue = document.getElementById(
        "precipitacionPromValue"
    );
    let precipitacionMaxValue = document.getElementById("precipitacionMaxValue");
    precipitacionMinValue.textContent = `Min ${min} [mm]`;
    precipitacionPromValue.textContent = `Prom ${Math.round(prom * 100) / 100
        } [mm]`;
    precipitacionMaxValue.textContent = `Max ${max} [mm]`;
    //Obtenga la función fechaActual
    //Defina un arreglo temporal vacío
    //Itere en el arreglo tiempoArr para filtrar los valores de precipitacionArr que sean igual con la fecha actual
    //Con los valores filtrados, obtenga los valores máximo, promedio y mínimo
    //Obtenga la referencia a los elementos HTML con id precipitacionMinValue, precipitacionPromValue y precipitacionMaxValue
    //Actualice los elementos HTML con los valores correspondientes
};

cargarPrecipitacion();
