const searchHistory = $('#search-history');
const searchCity = $('#search-city');
const searchCityButton = $('#search-city-button');
const clearHistoryButton = $('#clear-history-button');

const currentCity = $('#current-city');
const currentTemp = $('#current-temp');
const currentHumidity = $('#current-humidity');
const currentWindSpeed = $('#current-wind-speed');
const UvIndex = $('#uv-index');

const weatherData = $('#weather-data');

const ApiKey = '01fd5d8189ab77f3ab67722bb586d264';

const citiesList = [];

const currentDate = moment().format('L');
$('#current-date').text('(' + currentDate + ')');


initializeHistory();
showClear();




// GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history

$(document).on('submit', function(){
    Event.preventDefault();
    let searchValue = searchCity.val().trim();
    currentCondition(searchValue);
    searchHistory(searchValue);
    searchCity.val('');
});

searchCityButton.on('click', function(Event){
    Event.preventDefault();
    let searchValue = searchCity.val().trim();
    currentCondition(searchValue);
    searchCity.val('');
});

clearHistoryButton.on('click', function(){
    citiesList = [];
    listArray();
    $(this).addClass('hide');
});

searchHistory.on('click', 'li.city-btn', function(){
    let value = $(this).data('value');
    currentCondition(value);
    searchHistory(value);
});


// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index

function currentCondition(searchValue){
    let queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + '&units=imperial&appid=' + ApiKey;
    $.ajax({
        url: queryUrl,
        method: 'GET'
    }).then(function(response){
        currentCity.text(response.name);
        currentCity.append("<small class='text-muted' id='current-date'>");
        $('#current-date').text('(' + currentDate + ')');
        currentCity.append("<img src='https://openweathermap.org/img/w/" + response.weather[0].icon + ".png' alt='" + response.weather[0].main + "' />");
        currentTemp.text(response.main.temp);
        currentTemp.append('&deg;F');
        currentHumidity.text(response.main.humidity + '%');
        currentWindSpeed.text(response.wind.speed + 'mph');
        
        let lat = response.coord.lat;
        let lon = response.coord.lon;
        
        // WHEN I view the UV index
        // THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
        
        let UvUrl = 'https://api.openweathermap.org/data/2.5/uvi?lat=' + lat + '&lon=' + lon + '&appid=' + ApiKey;
        
        $.ajax({
            url: UvUrl,
            method: 'GET'
        }).then(function(response){
            UvIndex.text(response.value);
        });
        
        // WHEN I view future weather conditions for that city
        // THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity

        let forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast?&units=imperial&appid=' + ApiKey + '&lat=' + lat +  '&lon=' + lon;
        
        $.ajax({
            url: forecastUrl,
            method: 'GET'
        }).then(function(response){
            $('#five-day-forecast').empty();
            for(let i = 1; i < response.list.length; i += 8){
                let forecastDateStr = moment(response.list[i].dt_txt).format('L');
                let forecastColumn = $("<div class='col-12 col-md-6 col-lg forecast-day mb-3'>");
                let forecastCard = $("<div class='card'>");
                let forecastCardBody = $("<div class='card-body'>");
                let forecastDate = $("<h5 class='card-title'>");
                let forecastIcon = $('<img>');
                let forecastTemp = $("<p class='card-text mb-0'>");
                let forecastHumidity = $("<p class='card-text mb-0'>");
                
                $('#five-day-forecast').append(forecastColumn);
                forecastColumn.append(forecastCard);
                forecastCard.append(forecastCardBody);
                forecastCardBody.append(forecastDate);
                forecastCardBody.append(forecastIcon);
                forecastCardBody.append(forecastTemp);
                forecastCardBody.append(forecastHumidity);
                
                forecastIcon.attr('src', 'https://openweathermap.org/img/w/' + response.list[i].weather[0].icon + '.png');
                forecastIcon.attr('alt', response.list[i].weather[0].main)
                forecastDate.text(forecastDateStr);
                forecastTemp.text(response.list[i].main.temp);
                forecastTemp.prepend('Temp: ');
                forecastTemp.append('&deg;F');
                forecastHumidity.text(response.list[i].main.humidity);
                forecastHumidity.prepend('Humidity: ');
                forecastHumidity.append('%');
            }
        });
    });
};

// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city

function searchHistoryList(){
    let searchValue = searchCity.val().trim();
    if (searchValue){
        if (citiesList,indexOf(searchValue) === -1){
            citiesList.push(searchValue);
            listArray();
        } else {
            let removeIndex = citiesList.indexOf(searchValue);
            citiesList.splice(removeIndex, 1);
            citiesList.push(searchValue);
            listArray();  
        }
    }
}

function listArray() {
    searchHistory.empty();
    citiesList.forEach(function(city) {
        let searchHistoryItem = $("<li class='list-group-item city-btn'>");
        searchHistoryItem.attr("data-value", city);
        searchHistoryItem.text(city);
        searchHistory.prepend(searchHistoryItem);
    });
    localStorage.setItem('cities', JSON.stringify(citiesList));
}

function initializeHistory() {
    if (localStorage.getItem("cities")) {
        citiesList = JSON.parse(localStorage.getItem("cities"));
        var lastIndex = citiesList.length - 1;
        listArray();
        if (citiesList.length !== 0) {
            currentCondition(citiesList[lastIndex]);
            weatherContent.removeClass("hide");
        }
    }
}

function showClear() {
    if (searchHistory.text() !== "") {
        clearHistoryButton.removeClass("hide");
    }
}