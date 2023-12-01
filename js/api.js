const apiKey = 'b6718994cffc023d611d664e123509b8';

export const fetchWeatherData = async (latitude, longitude) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

export const fetchWeatherDataByCity = async (city) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error', error);
        throw error;
    }
};

export const fetchWeatherForecast = async (latitude, longitude) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
};
