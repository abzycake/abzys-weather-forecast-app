$(document).ready(function () {
  const apiKey = 'cf15e5388b6435eaa7f2ad75376a4f5e';
  const apiUrl = 'https://api.openweathermap.org/data/2.5';

  const searchForm = $('#search-form');
  const cityInput = $('#search-input');
  const currentWeatherContainer = $('#current-weather');
  const forecastContainer = $('#forecast');
  const searchHistoryContainer = $('#search-history');

  searchForm.on('submit', function (e) {
    e.preventDefault();
    const cityName = cityInput.val().trim();
    if (cityName) {
      getWeatherData(cityName);
      cityInput.val('');
    }
  });

  function getWeatherData(cityName) {
    fetch(`${apiUrl}/weather?q=${cityName}&appid=${apiKey}&units=metric`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching current weather data');
        }
        return response.json();
      })
      .then(data => {
        displayCurrentWeather(data);
        addCityToHistory(data.name);

        // fetches forecast data from the API
        return fetch(`${apiUrl}/forecast?q=${cityName}&appid=${apiKey}&units=metric`);
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching forecast data');
        }
        return response.json();
      })
      .then(data => {
        displayForecast(data);
      })
      .catch(error => {
        console.error('Error:', error.message);
        // error handling
        alert('An error occurred while fetching weather data. Please try again later.');
      });
  }

  function displayCurrentWeather(data) {
    const { name, main, weather, wind } = data;
    const weatherDescription = weather[0].description;
    currentWeatherContainer.html(`
      <div class="weather-box">
        <h2>${name}</h2>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <p>Temperature: ${main.temp}°C</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Weather: ${weatherDescription}</p>
        <p>Wind Speed: ${wind.speed} m/s</p>
      </div>
    `);
  }

  function addCityToHistory(cityName) {
    const historyItem = $('<div class="history-item"></div>');
    historyItem.text(cityName);
    historyItem.on('click', function () {
      getWeatherData(cityName);
    });
    searchHistoryContainer.append(historyItem);
  }

function displayForecast(data) {
  forecastContainer.empty(); // clears previous forecast
  const forecastData = data.list;
  const uniqueDates = new Set();

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  forecastData.forEach(item => {
    const { dt, main, weather } = item;
    const date = new Date(dt * 1000);
    const formattedDate = formatDate(date);

    // makes sure the forecast begins tomorrow rather than having duplicate cards for today
    if (date.getDate() !== today.getDate() && date >= tomorrow && uniqueDates.size < 5) {
      if (!uniqueDates.has(formattedDate)) {
        const weatherDescription = weather[0].description;

        // creates new cards per day
        const forecastItem = $('<div class="forecast-card"></div>');
        forecastItem.html(`
          <h2>${formattedDate}</h2>
          <p>Temperature: ${main.temp}°C</p>
          <p>Humidity: ${main.humidity}%</p>
          <p>Weather: ${weatherDescription}</p>
        `);
        forecastContainer.append(forecastItem);

        uniqueDates.add(formattedDate);
      }
    }
  });
}

  function formatDate(date) {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }
});
