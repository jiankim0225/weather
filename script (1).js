
const API_KEY = 'e86c71f70f9447efaee24601250708';
const BASE_URL = 'https://api.weatherapi.com/v1';

// DOM 요소들
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherInfo = document.getElementById('weatherInfo');

// 날씨 정보 요소들
const cityName = document.getElementById('cityName');
const currentTemp = document.getElementById('currentTemp');
const weatherDesc = document.getElementById('weatherDesc');
const weatherIcon = document.getElementById('weatherIcon');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const visibility = document.getElementById('visibility');
const forecast = document.getElementById('forecast');

// 이벤트 리스너
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// 검색 처리 함수
async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('도시명을 입력해주세요.');
        return;
    }
    
    await getWeatherData(city);
}

// 날씨 데이터 가져오기
async function getWeatherData(city) {
    showLoading();
    hideError();
    hideWeatherInfo();
    
    try {
        // 현재 날씨와 예보 데이터를 동시에 가져오기
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}&aqi=no`),
            fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=5&aqi=no&alerts=no`)
        ]);
        
        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('도시를 찾을 수 없습니다. 다른 도시명을 시도해보세요.');
        }
        
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        displayWeatherData(currentData, forecastData);
        
    } catch (err) {
        console.error('Error fetching weather data:', err);
        showError(err.message || '날씨 정보를 가져오는데 실패했습니다.');
    } finally {
        hideLoading();
    }
}

// 날씨 데이터 표시
function displayWeatherData(currentData, forecastData) {
    const { location, current } = currentData;
    
    // 현재 날씨 정보 표시
    cityName.textContent = `${location.name}, ${location.country}`;
    currentTemp.textContent = Math.round(current.temp_c);
    weatherDesc.textContent = current.condition.text;
    weatherIcon.src = `https:${current.condition.icon}`;
    weatherIcon.alt = current.condition.text;
    
    feelsLike.textContent = Math.round(current.feelslike_c);
    humidity.textContent = current.humidity;
    windSpeed.textContent = Math.round(current.wind_kph);
    visibility.textContent = current.vis_km;
    
    // 예보 정보 표시
    displayForecast(forecastData.forecast.forecastday);
    
    showWeatherInfo();
}

// 예보 정보 표시
function displayForecast(forecastDays) {
    forecast.innerHTML = '';
    
    forecastDays.forEach((day, index) => {
        const date = new Date(day.date);
        const dayName = index === 0 ? '오늘' : 
                       index === 1 ? '내일' : 
                       date.toLocaleDateString('ko-KR', { weekday: 'short' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        forecastItem.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
            <div class="forecast-condition">${day.day.condition.text}</div>
            <div class="forecast-temps">
                <div class="forecast-high">${Math.round(day.day.maxtemp_c)}°</div>
                <div class="forecast-low">${Math.round(day.day.mintemp_c)}°</div>
            </div>
        `;
        
        forecast.appendChild(forecastItem);
    });
}

// UI 상태 관리 함수들
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

function showWeatherInfo() {
    weatherInfo.classList.remove('hidden');
}

function hideWeatherInfo() {
    weatherInfo.classList.add('hidden');
}

// 페이지 로드 시 기본 도시 날씨 표시
window.addEventListener('load', () => {
    cityInput.value = 'Seoul';
    getWeatherData('Seoul');
});
