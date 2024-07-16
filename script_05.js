const apiKey = 'abf854b53c774aa6a00111321241507'; 

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    let currentIndex = 0;
    let intervalId = null;

    function showNextSlide() {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }

    slides.forEach((slide, index) => {
        const bgUrl = slide.getAttribute('data-bg');
        slide.style.backgroundImage = bgUrl;
        if (index === currentIndex) {
            slide.classList.add('active');
        }
    });

    // Function to start slideshow
    function startSlideshow() {
        intervalId = setInterval(showNextSlide, 3000); // Changes slide every 3 secs
    }

    
    startSlideshow();
    document.getElementById('search-input').value = '';
});


async function fetchWeatherData(city, country = '') {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city},${country}`);
        if (!response.ok) {
            throw new Error('City not found or API request failed.');
        }
        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        displayError(error.message);
    }
}

function displayWeatherData(data) {
    document.getElementById('temperature').textContent = `${data.current.temp_c}°C`;
    document.getElementById('weather-condition').textContent = data.current.condition.text;
    document.getElementById('feels-like').textContent = `${data.current.feelslike_c}°C`;
    document.getElementById('humidity').textContent = `${data.current.humidity}%`;
    document.getElementById('precipitation').textContent = data.current.precip_mm || 'N/A'; 
    document.getElementById('wind-speed').textContent = `${data.current.wind_kph} km/h`;
    document.getElementById('visibility').textContent = `${data.current.vis_km} km`;
}


async function fetchSuggestions(query) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`);
        const data = await response.json();
        const uniqueSuggestions = [];
        const seen = new Set();

        data.forEach(result => {
            const suggestion = `${result.name}, ${result.country}`;
            if (!seen.has(suggestion)) {
                uniqueSuggestions.push(suggestion);
                seen.add(suggestion);
            }
        });

        return uniqueSuggestions;
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
}

function showSuggestions() {
    const query = document.getElementById('search-input').value;
    if (query.length < 1) {
        document.getElementById('suggestions').innerHTML = '';
        return;
    }

    fetchSuggestions(query).then(suggestions => {
        const suggestionsList = document.getElementById('suggestions');
        suggestionsList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const listItem = document.createElement('li');
            listItem.textContent = suggestion;
            listItem.addEventListener('click', () => {
                const [city, country] = suggestion.split(', ');
                document.getElementById('search-input').value = city;
                document.getElementById('suggestions').innerHTML = '';
                fetchWeatherData(city, country);
            });
            suggestionsList.appendChild(listItem);
        });
    });
}

function displayError(message) {
    const alertBox = document.querySelector('.alert');
    const alertOverlay = document.querySelector('.alert-overlay');

    alertBox.textContent = message;
    alertBox.style.display = 'block';
    alertOverlay.style.display = 'block';

    setTimeout(() => {
        alertBox.style.display = 'none';
        alertOverlay.style.display = 'none';
    }, 5000); // Hiding after 5 secs
}

document.getElementById('search-input').addEventListener('input', showSuggestions);

document.getElementById('search-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const city = document.getElementById('search-input').value;
        fetchWeatherData(city);
        document.getElementById('suggestions').innerHTML = '';
    }
});
