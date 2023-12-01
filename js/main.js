import { fetchWeatherData, fetchWeatherDataByCity, fetchWeatherForecast } from "./api.js";

export const domElements = () => {
  const cityField = document.querySelector('.city');
  const tempField = document.querySelector('.temp');
  const windField = document.querySelector('.wind');
  const humidField = document.querySelector('.humid');
  const iconImg = document.createElement('img');
  const forecastHolder = document.querySelector('.forecast-holder');
  const loader = document.querySelector('.loader');
  const errorMessage = document.querySelector('.error-message');
  const cityInput = document.getElementById('city-input');
  const getWeatherBtn = document.getElementById('get-weather-btn');
  const addMoreBtn = document.getElementById('add-more');
  const oneDayBtn = document.getElementById('one-day');

  return {
    city: cityField,
    temp: tempField,
    wind: windField,
    humid: humidField,
    iconImg: iconImg,
    forecastHolder: forecastHolder,
    loader: loader,
    errorMessage: errorMessage,
    cityInput: cityInput,
    getWeatherBtn: getWeatherBtn,
    addMoreBtn: addMoreBtn,
    oneDayBtn: oneDayBtn
  };
}

const updateCity = (element, cityName) => {
  element.textContent = cityName;
};

const updateTemp = (element, tempInKelvin, weatherMain) => {
  const tempInCelsius = tempInKelvin - 273.15;
  const temperatureText = `${tempInCelsius.toFixed()} °C`;
  const weatherMainText = weatherMain ? ` | ${weatherMain}` : '';
  element.textContent = `${temperatureText}${weatherMainText}`;
};

const updateWind = (element, windInfo) => {
  element.textContent = `${windInfo} m/s`;
};

const updateHumid = (element, humidInfo) => {
  element.textContent = `${humidInfo} %`;
};

const updateIcon = (element, iconCode) => {
  element.src = `https://api.openweathermap.org/img/w/${iconCode}.png`;
};

const createForecastBlock = (forecastData, showCity = true) => {
  const forecastItem = document.createElement('div');
  forecastItem.classList.add('forecast-item');

  if (showCity && forecastData.city && forecastData.city.name) {
    const cityHolder = document.createElement('div');
    cityHolder.classList.add('city-holder');
    const citySpan = document.createElement('span');
    citySpan.classList.add('city');
    cityHolder.appendChild(citySpan);
    forecastItem.appendChild(cityHolder);
    updateCity(citySpan, forecastData.name);
  }

  const weatherIcon = document.createElement('div');
  weatherIcon.classList.add('weather-icon');
  forecastItem.appendChild(weatherIcon);

  const weatherInfo = document.createElement('div');
  weatherInfo.classList.add('weather-info');
  const tempSpan = document.createElement('span');
  tempSpan.classList.add('temp');
  weatherInfo.appendChild(tempSpan);
  const windSpan = document.createElement('span');
  windSpan.classList.add('wind');
  weatherInfo.appendChild(windSpan);
  const humidSpan = document.createElement('span');
  humidSpan.classList.add('humid');
  weatherInfo.appendChild(humidSpan);
  forecastItem.appendChild(weatherInfo);

  updateTemp(tempSpan, forecastData.main.temp, forecastData.weather[0].main);
  updateWind(windSpan, forecastData.wind.speed);
  updateHumid(humidSpan, forecastData.main.humidity);
  updateIcon(weatherIcon, forecastData.weather[0].icon);

  return forecastItem;
};

const app = async () => {
  const {
    city,
    temp,
    humid,
    wind,
    iconImg,
    forecastHolder,
    loader,
    errorMessage,
    cityInput,
    getWeatherBtn,
    addMoreBtn,
    oneDayBtn
  } = domElements();
  const weatherIconContainer = document.querySelector('.weather-icon');

  loader.style.display = 'block';
  errorMessage.style.display = 'none';

  const getDefaultWeather = async () => {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const weather = await fetchWeatherData(latitude, longitude);
      forecastHolder.classList.add('loaded');
      updateCity(city, weather.name);
      updateTemp(temp, weather.main.temp, weather.weather[0].main);
      updateWind(wind, weather.wind.speed);
      updateHumid(humid, weather.main.humidity);
      updateIcon(iconImg, weather.weather[0].icon);
      weatherIconContainer.textContent = '';
      weatherIconContainer.appendChild(iconImg);
      loader.style.display = 'none';
      errorMessage.style.display = 'none';
    } catch (error) {
      loader.style.display = 'none';
      errorMessage.style.display = 'block';
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject(new Error('Geolocation is not supported by your browser'));
      }
    });
  };

  const updateForecast = async () => {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const forecastData = await fetchWeatherForecast(latitude, longitude);

      if (forecastData && forecastData.list && forecastData.list.length > 0) {
        // forecastHolder.innerHTML = '';
        const firstForecastBlock = createForecastBlock(forecastData.list[0], true);
        forecastHolder.appendChild(firstForecastBlock);

        forecastData.list.slice(2, 5).forEach((forecast) => {
          const forecastBlock = createForecastBlock(forecast);
          forecastHolder.appendChild(forecastBlock);
        });

        forecastHolder.style.display = 'flex';
        addMoreBtn.style.display = 'none';
        loader.style.display = 'none';
        errorMessage.style.display = 'none';
      } else {
        throw new Error('Invalid forecast data');
      }
    } catch (error) {
      loader.style.display = 'none';
      forecastHolder.style.display = 'none';
      errorMessage.style.display = 'block';
      console.error('Error receiving geolocation!', error);
    }
  };

  addMoreBtn.addEventListener('click', () => {
    updateForecast();
  });

  oneDayBtn.addEventListener('click', () => {
    const allForecastHolders = document.querySelectorAll('.forecast-item');
    for (let i = 1; i < allForecastHolders.length; i++) {
      allForecastHolders[i].style.display = 'none';
    }
    addMoreBtn.style.display = 'block';
  });

  getWeatherBtn.addEventListener('click', async () => {
    const cityValue = cityInput.value;

    if (cityValue) {
      loader.style.display = 'block';
      try {
        const weather = await fetchWeatherDataByCity(cityValue);
        updateCity(city, weather.name);
        updateTemp(temp, weather.main.temp, weather.weather[0].main);
        updateWind(wind, weather.wind.speed);
        updateHumid(humid, weather.main.humidity);
        updateIcon(iconImg, weather.weather[0].icon);
        weatherIconContainer.textContent = '';
        weatherIconContainer.appendChild(iconImg);
        loader.style.display = 'none';
        errorMessage.style.display = 'none';
      } catch (error) {
        loader.style.display = 'none';
        errorMessage.style.display = 'block';
      }
    } else {
      getDefaultWeather();
    }
  });

  cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      getWeatherBtn.click();
    }
  });

  getDefaultWeather();
}

app();
