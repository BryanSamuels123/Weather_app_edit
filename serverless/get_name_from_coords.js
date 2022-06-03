const fetch = require('node-fetch');

const { WEATHER_API_KEY } = process.env;

exports.handler = async (event) =>{
    const params = JSON.parse(event.body);
    const { lat, lon } = params;
    const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=2&appid=${WEATHER_API_KEY}`;

    try{
        const nameStream = await fetch(url);
        const nameJson = await nameStream.json();

        return{
            statusCode: 200,
            body: JSON.stringify(nameJson)
        };
    } catch(err){
        return {
            statusCode: 442,
            body: err.stack
        };
    }
};