import CurrentLocation from "./CurrentLocation.js";

import { setLocationObject, 
    getHomeLocation, 
    getWeatherFromCoords,
    getNameFromCoord,
    cleanText,
    getCoordsFromApi } from "./dataFunctions.js";

import { 
    setPlaceholderText,
    addSpinner,
    displayErr, 
    displayApiError, 
    updateDisplay,
    updateScreenReaderConfirmation } from "./domFunctions.js";

const currentLoc = new CurrentLocation;
const initApp = () => {
     //addlisteners for the 6 diff events.
    const geoButton = document.getElementById("getLocation");
    geoButton.addEventListener("click", getGeoWeather);

    const homeButton = document.getElementById("home");
    homeButton.addEventListener("click", loadWeather); 

    const saveButton = document.getElementById("saveLocation");
    saveButton.addEventListener("click", saveLocation);

    const unitButton = document.getElementById("unit");
    unitButton.addEventListener("click", setUnitPref);

    const refreshButton = document.getElementById("refresh");
    refreshButton.addEventListener("click", refreshWeather);

    const locationEntry = document.getElementById("searchBar__form");
    locationEntry.addEventListener("submit", submitNewLocation);
     //set up

    setPlaceholderText();

     // load default weather
    loadWeather();
};
    

document.addEventListener("DOMContentLoaded", initApp);

const getGeoWeather = (event) => {
    if (event){
        if (event.type === "click"){
            const mapIcon = document.querySelector(".fa-map-marker-alt");
            addSpinner(mapIcon);
        }
    }
    if (!navigator.geolocation) return geoError();
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
};

const geoError = (errObj) => {
    const errMsg = errObj ? errObj.message : "Geolocation not supported";
    displayErr(errMsg, errMsg);
};

const geoSuccess = /*async*/ (position) =>{
    const myCoordsObj = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: `Lat: ${position.coords.latitude}, Lon: ${position.coords.longitude}`//await getNameFromCoord(position.coords.latitude, position.coords.longitude) // this is mine not from tutorial.
    };
    

    setLocationObject(currentLoc, myCoordsObj);
    updateDataAndDisplay(currentLoc);
    //console.log(myCoordsObj.name);
};

const loadWeather = (event) =>{
    const savedLocation = getHomeLocation();
    if (!savedLocation && !event) return getGeoWeather();
    if (!savedLocation && (event.type === "click")){ //no saved location and first load, button wasn't pushed.
        displayErr(
            "No home location saved",
            "Sorry, Please save a home location first."
        );
    } else if (savedLocation && !event){ //everytime it loads and there is a saved location no push
        displayHomeLocationWeather(savedLocation);
    } else { //button was pushed
        const homeIcon = document.querySelector(".fa-home");
        addSpinner(homeIcon);
        displayHomeLocationWeather(savedLocation);
    }
}

const displayHomeLocationWeather= (home) =>{
    if (typeof home === "string"){
        const locationJson = JSON.parse(home);
        const myCoordsObj = {
            lat: locationJson.lat,
            lon: locationJson.lon,
            name:  locationJson.name,
            unit: locationJson.unit
        };
        setLocationObject(currentLoc, myCoordsObj);
            updateDataAndDisplay(currentLoc);
    }
}

const saveLocation = () =>{
    if (currentLoc.getLat() && currentLoc.getLon()){
        const saveIcon = document.querySelector(".fa-save");
        addSpinner(saveIcon);
        const location = {
            name: currentLoc.getName(),
            lat: currentLoc.getLat(),
            lon: currentLoc.getLon(),
            unit: currentLoc.getUnit()
        };
        localStorage.setItem("defaultHomeLocation", JSON.stringify(location))
        updateScreenReaderConfirmation(`Saved ${currentLoc.getName} as home location.`);

        // stopped here
    }
}

const setUnitPref = () => {
    const unitIcon = document.querySelector(".fa-chart-bar");
    addSpinner(unitIcon);

    currentLoc.toggleUnit();
    updateDataAndDisplay(currentLoc);
}

const refreshWeather = ()=>{
    const refreshIcon = document.querySelector(".fa-sync-alt");
    addSpinner(refreshIcon);
    updateDataAndDisplay(currentLoc);
}

const submitNewLocation = async (event) =>{
    event.preventDefault(); //stops the page from reloading by default from the submit form.
    const text = document.getElementById("searchBar__text").value; 
    const entryText = cleanText(text);
    if (!entryText.length) return;
    const locationIcon = document.querySelector(".fa-magnifying-glass-location");
    addSpinner(locationIcon);
    const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());
    
   if (coordsData){
        if (coordsData.cod === 200){
           
            const myCoordsObj = {
                lat: coordsData.coord.lat,
                lon: coordsData.coord.lon,
                name: (coordsData.sys.country) ? `${coordsData.name}, ${coordsData.sys.country}` : coordsData.name
            };
            //console.log(myCoordsObj); //
            setLocationObject(currentLoc, myCoordsObj);
            updateDataAndDisplay(currentLoc);

        }
        else {
            displayApiError(coordsData);
        }
     } else {
    displayErr("Connection Error", "Connection Error");
     }

}

const updateDataAndDisplay = async (locationObj) =>{
    const weatherJson = await getWeatherFromCoords(locationObj);
    //console.log(weatherJson);
    if (weatherJson) updateDisplay(weatherJson, locationObj);
}