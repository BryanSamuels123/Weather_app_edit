
export const setLocationObject = (locationObj, coordsObj) =>{
    const {lat, lon, name, unit} = coordsObj;
    locationObj.setLat(lat);
    locationObj.setLon(lon);
    locationObj.setName(name);

    if (unit){
        locationObj.setUnit(unit);
    }
    
};

export const getHomeLocation = () => {
    return localStorage.getItem("defaultHomeLocation");
};

export const getWeatherFromCoords = async (locationObj)=>{
    // const lat = locationObj.getLat();
    // const lon = locationObj.getLon();
    // const units = locationObj.getUnit();
    // const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${WEATHER_API_KEY}`;
    // try{
    //     const weatherStream = await fetch(url);
    //     const weatherJson = await weatherStream.json();
    //     return weatherJson;
    // }catch (err){
    //     console.error(err);
    // }


    const urlDataObject = {
        lat: locationObj.getLat(),
        lon: locationObj.getLon(),
        units: locationObj.getUnit()
    };
    try {
        const weatherStream = await fetch('./.netlify/functions/get_weather', {
            method: "POST",
            body: JSON.stringify(urlDataObject)
        });
        const weatherJson = await weatherStream.json();
        return weatherJson;
    }catch(err){
        //console.log(err);
    }

}   

export const getCoordsFromApi = async (entryText, units) =>{
    // const regex = /^\d+$/g;
    // const flag = regex.test(entryText) ? "zip" : "q";
    // const url=`https://api.openweathermap.org/data/2.5/weather?${flag}=${entryText}&units=${units}&appid=${WEATHER_API_KEY}`;
    // const encodedUrl = encodeURI(url);
    // try {
    //     const dataStream = await fetch(encodedUrl);
    //     const jsonData = await dataStream.json();
    //     //console.log(jsonData);
    //     return jsonData;
        
    // } catch (err){
    //     console.error(err.stack);
    // }

    const urlDataObj = {
        text: entryText,
        units: units
    };
    try {
        const dataStream = await fetch('./.netlify/functions/get_coords', {
            method: "POST",
            body: JSON.stringify(urlDataObj)
        });
        const jsonData = await dataStream.json();
        return jsonData;
    } catch (err) {
        console.error(err);
    }
};

export const cleanText = (text) =>{
    const regex = / {2,}/g;
    const entryText = text.replaceAll(regex, " ").trim();
    return entryText;
}

export const getNameFromCoord = async (lat, lon) =>{

    const urlDataObj = {
        lat: lat,
        lon: lon
    };
    try{
        const nameStream = await fetch('./.netlify/functions/get_name_from_coords', {
            method: "POST",
            body: JSON.stringify(urlDataObj)
        });
        const nameJson = await nameStream.json();
        if (nameJson[0].country === "US"){
            return `${nameJson[0].name}, ${nameJson[0].state}`
                }
                return `${nameJson[0].name}, ${nameJson[0].country}`; 
    } catch(err){
        console.error(err);
    }

//     const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=2&appid=${WEATHER_API_KEY}`;

//     try{
//         const locNameStream = await fetch(url);
//         const locNameJson = await locNameStream.json();
//         if (locNameJson[0].country === "US"){
//             return `${locNameJson[0].name}, ${locNameJson[0].state}`
//         }
//         return `${locNameJson[0].name}, ${locNameJson[0].country}`; 
//     }
//     catch (err){
//         console.log(err.stack);
//         return `Lat: ${lat}, Lon: ${lon}`;
//     }
}
