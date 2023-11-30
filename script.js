let lat;
let long;

//Request cash variables
let currentData;
let hourlyData;
let nearbyCitiesData;

//DOM cash
let nameField = document.getElementById("srch");
let $form = $("#form");
let $buttonToday = $(".today:first");
let $button5day = $(".5-day:first");
let $main = $("main:first");

const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const fullDaysNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

//tableBuilder variables
let hourlyTime = "";
let hourlyIcons = "";
let pop = "";
let hourlyForecast = "";
let hourlyTemp = "";
let hourlyFeelsLike = "";
let hourlyWindSpeed = "";

//events
$buttonToday.click(request);
$button5day.click(day5);
$form.submit(function (event) {
    event.preventDefault();

    $.ajax({
        url: `http://api.openweathermap.org/data/2.5/weather?q=${nameField.value}&units=metric&appid=09891c98eb0c33d597458f2a63d6dc81`,
        type: "GET",
        success: function (data) {
            console.log(data);

            $button5day.css("border-bottom", "none");
            $buttonToday.css("border-bottom", "2px solid #21cda4");

            currentData = data;
            long = data.coord.lon;
            lat = data.coord.lat;

            nameField.value = data.name;

            $.ajax({
                url: `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely,current,daily,alerts&units=metric&appid=09891c98eb0c33d597458f2a63d6dc81`,
                type: "GET",
                async: false,
                success: function (data) {
                    hourlyData = data;
                },
                error: requestError
            });

            $.ajax({
                url: `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${long}&cnt=5&units=metric&appid=09891c98eb0c33d597458f2a63d6dc81`,
                type: "GET",
                async: false,
                success: function (data) {
                    nearbyCitiesData = data;
                    today();
                },
                error: requestError
            });
        },
        error: requestError
    });

});

//Main thread
getLocation();
$main.html("<h1 class=\"wait\">Please Wait...</h1>");

////////functions

//Location request
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position, positonError);
    } else {
        alert("Geolocation is not supported by this browser.");
        positonError();
    }
}

function position(position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;
    request();
}

//if location is not defined
function positonError() {

    //Pavlovskaya
    lat = 46.1328;
    long = 39.7856;

    request();
}

//getting data, first load and today button click
function request() {

    $button5day.css("border-bottom", "none");
    $buttonToday.css("border-bottom", "2px solid #21cda4");

    $.ajax({
        url: `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=09891c98eb0c33d597458f2a63d6dc81`,
        type: "GET",
        async: false,
        success: function (data) {
            console.log(data);
            currentData = data;

            nameField.value = data.name;
        },
        error: requestError
    });

    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely,current,daily,alerts&units=metric&appid=09891c98eb0c33d597458f2a63d6dc81`,
        type: "GET",
        async: false,
        success: function (data) {
            console.log(data);
            hourlyData = data;
        },
        error: requestError
    });

    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${long}&cnt=5&units=metric&appid=09891c98eb0c33d597458f2a63d6dc81`,
        type: "GET",
        async: false,
        success: function (data) {
            console.log(data);
            nearbyCitiesData = data;
            today();
        },
        error: requestError
    });
}


function requestError(data) {
    console.log(data);

    if (data.status == 404) {
        $main.html(`<div class=\"error-404\">
        <img src="images/404.png" alt="404 Not Found">
        <p>${nameField.value} could not be found</p>
        <p>Please enter a diffirent location</p>
        </div>`);
    } else {
        $main.html(`<p class = "error">${data.statusText}</p>`);
    }
}
// today tab rendering
function today() {

    let sunrise = new Date(currentData.sys.sunrise * 1000);
    let sunset = new Date(currentData.sys.sunset * 1000);
    let duration = new Date((sunset - sunrise));

    hourlyTime = "";
    hourlyIcons = "";
    pop = "";
    hourlyForecast = "";
    hourlyTemp = "";
    hourlyFeelsLike = "";
    hourlyWindSpeed = "";

    //Getting table data
    for (let i = 0;; i++) {

        let time = new Date(hourlyData.hourly[i].dt * 1000);

        hourlyTime += `<th>${time.getHours()}:00</th>`;

        hourlyIcons += `<td class="img-td"><img src=" http://openweathermap.org/img/wn/${hourlyData.hourly[i].weather[0].icon}@2x.png" alt="Weather Icon"></td>`

        hourlyForecast += `<td>${hourlyData.hourly[i].weather[0].main}</td>`
        pop += `<td>${Math.round(hourlyData.hourly[i].pop * 100)}%;</td>`
        hourlyTemp += `<td>${hourlyData.hourly[i].temp}&deg;</td>`
        hourlyFeelsLike += `<td>${hourlyData.hourly[i].feels_like}&deg;</td>`
        hourlyWindSpeed += `<td>${hourlyData.hourly[i].wind_speed}</td>`

        if (i > 0 && new Date(hourlyData.hourly[i].dt * 1000).getHours() == 0)
            break;
    }

    //html code
    $main.html(
        `<div class="main">
         <div class="current">
             <div class="top">
                 <p>CURRENT WEATHER</p>
                 <p>${sunrise.toDateString()}</p>
             </div>
             <div class="current-main">
                 <div class="current-el">
                     <img src=" http://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png" alt="Weather Icon">                    
                 </div>
                 <div class="current-el">
                     <h1>${currentData.main.temp}&#176;C</h1>
                     <p class="real-feel">Real Feel ${currentData.main.feels_like}&#176;</p>
                 </div>
                 <div class="current-el">
                     <p class="time">Sunrise:&emsp;&ensp; ${sunrise.getHours()}&nbsp;:&nbsp;${sunrise.getMinutes() > 9 ? sunrise.getMinutes() : "0" + sunrise.getMinutes()}&nbsp;&emsp;&ensp;</p>
                     <p class="time">Sunset:&emsp;&ensp;&ensp;${sunset.getHours()}&nbsp;:&nbsp;${sunset.getMinutes() > 9 ? sunset.getMinutes() : "0" + sunset.getMinutes()}&nbsp;&emsp;</p>
                     <p class="time">Duration:&emsp; ${duration.getUTCHours()}&nbsp;:&nbsp;${duration.getUTCMinutes() > 9 ? duration.getUTCMinutes() : "0" + duration.getUTCMinutes()}&nbsp;hr</p>
                 </div>                
             </div>
             <p class="icon-desc">${currentData.weather[0].description}</p>
         </div>
     </div>
     <div class="tbl">
         <h4>HOURLY</h4>
         <table>
             <thead>
                 <th>TODAY</th>
                 ${hourlyTime}
             </thead>
             <tbody>
                 <tr>
                     <td></td>
                     ${hourlyIcons}
                 </tr>
                 <tr>
                     <td class = pop><span>Probability of Precipitation</span></td>
                     ${pop}
                 </tr>
                 <tr>
                     <td><span>Forecast</span></td>
                     ${hourlyForecast}
                 </tr>
                 <tr class = "temp">
                     <td><span>Temp(&deg;C)</span></td>
                     ${hourlyTemp}
                 </tr>
                 <tr>
                     <td><span>RealFeel</span></td>
                     ${hourlyFeelsLike}
                 </tr>
                 <tr>
                     <td><span>Wind&nbsp;(m/s)</span></td>
                     ${hourlyWindSpeed}
                 </tr>
             </tbody>
         </table>
     </div>
     <div class="nearby">
         <h4>NEARBY PLACES</h4>
         <div class="city-line">
             <div class="city-rect">
                 <p>${nearbyCitiesData.list[1].name}</p>
                 <div><img src=" http://openweathermap.org/img/wn/${nearbyCitiesData.list[1].weather[0].icon}@2x.png" alt="Weather Icon"> ${nearbyCitiesData.list[1].main.temp}&deg;C</div>
             </div>
             <div class="city-rect">
             <p>${nearbyCitiesData.list[2].name}</p>
             <div><img src=" http://openweathermap.org/img/wn/${nearbyCitiesData.list[2].weather[0].icon}@2x.png" alt="Weather Icon"> ${nearbyCitiesData.list[2].main.temp}&deg;C</div>
             </div>
         </div>
         <div class="city-line">
             <div class="city-rect">
             <p>${nearbyCitiesData.list[3].name}</p>
             <div><img src=" http://openweathermap.org/img/wn/${nearbyCitiesData.list[3].weather[0].icon}@2x.png" alt="Weather Icon"> ${nearbyCitiesData.list[3].main.temp}&deg;C</div>
             </div>
             <div class="city-rect">
             <p>${nearbyCitiesData.list[4].name}</p>
             <div><img src=" http://openweathermap.org/img/wn/${nearbyCitiesData.list[4].weather[0].icon}@2x.png" alt="Weather Icon"> ${nearbyCitiesData.list[4].main.temp}&deg;C</div>
             </div>
         </div>
     </div>`
    )
}

//5-day forecast button click
function day5() {

    let fiveDaysData;

    $buttonToday.css("border-bottom", "none");
    $button5day.css("border-bottom", "2px solid #21cda4");

    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=metric&appid=09891c98eb0c33d597458f2a63d6dc81`,
        type: "GET",
        success: function (data) {
            console.log(data);
            nameField.value = data.city.name;
            fiveDaysData = data;
        },
        error: requestError
    });

    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely,current,alerts&units=metric&appid=09891c98eb0c33d597458f2a63d6dc81`,
        type: "GET",
        async: false,
        success: function (data) {
            console.log(data);

            hourlyData = data;
            let fiveDays = [];
            let fiveDaysCode = "";

            for (let i = 0; i < 5; i++) {
                fiveDays.push(new Date(data.daily[i].dt * 1000))
            }

            for (let i = 0; i < 5; i++) {
                fiveDaysCode +=
                    `<div class="day">
                <h4>${i == 0 ? "TONIGHT" : dayNames[fiveDays[i].getDay()]}</h4>
                <p>${months[fiveDays[i].getMonth()]} ${fiveDays[i].getDate()}</p>
                <img src=" http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png" alt="Weather Icon">
                <h5 class="day-deg">${data.daily[i].temp.max}&deg;C</h5>
                <p>${data.daily[i].weather[0].description}</p>
            </div>`
            }

            hourlyTime = "";
            hourlyIcons = "";
            pop = "";
            hourlyForecast = "";
            hourlyTemp = "";
            hourlyFeelsLike = "";
            hourlyWindSpeed = "";

            //Table
            for (let i = 0;; i++) {

                let time = new Date(data.hourly[i].dt * 1000);

                hourlyTime += `<th>${time.getHours()}:00</th>`;

                hourlyIcons += `<td class="img-td"><img src=" http://openweathermap.org/img/wn/${data.hourly[i].weather[0].icon}@2x.png" alt="Weather Icon"></td>`

                hourlyForecast += `<td>${data.hourly[i].weather[0].main}</td>`
                pop += `<td>${Math.round(hourlyData.hourly[i].pop * 100)}%;</td>`
                hourlyTemp += `<td>${data.hourly[i].temp}&deg;</td>`
                hourlyFeelsLike += `<td>${data.hourly[i].feels_like}&deg;</td>`
                hourlyWindSpeed += `<td>${data.hourly[i].wind_speed}</td>`

                if (i > 0 && new Date(data.hourly[i].dt * 1000).getHours() == 0)
                    break;
            }

            //html code
            $main.html(
                `<div class="days">${fiveDaysCode}</div>
        <div class="tbl">
            <h4>HOURLY</h4>
            <table>
             <thead>
                 <th id = "DoW">TODAY</th>
                 ${hourlyTime}
             </thead>
             <tbody>
                 <tr>
                     <td></td>
                     ${hourlyIcons}
                 </tr>
                 <tr>
                     <td class = pop><span>Probability of Precipitation</span></td>
                     ${pop}
                 </tr>
                 <tr>
                     <td><span>Forecast</span></td>
                     ${hourlyForecast}
                 </tr>
                 <tr class = temp>
                     <td><span>Temp(&deg;C)</span></td>
                     ${hourlyTemp}
                 </tr>
                 <tr>
                     <td><span>RealFeel</span></td>
                     ${hourlyFeelsLike}
                 </tr>
                 <tr>
                     <td><span>Wind&nbsp;(m/s)</span></td>
                     ${hourlyWindSpeed}
                 </tr>
             </tbody>
         </table>
        </div>`
            )
        },
        error: requestError
    });


    $(".day").click(dayClick);
    let temp = document.getElementsByClassName("day")[0];
    temp.style.backgroundColor = "rgb(222 222 227)";

    function dayClick(event) {

        temp.style.backgroundColor = "white";

        if (event.target.classList.contains("day")) {
            event.target.style.backgroundColor = "rgb(222 222 227)";
            temp = event.target;

            oneOfFiveDays();

        } else {
            event.target.parentNode.style.backgroundColor = "rgb(222 222 227)";
            temp = event.target.parentNode;

            oneOfFiveDays();
        }
    }

    //Table rendering
    function oneOfFiveDays() {
        let dayName = temp.firstElementChild.innerText;
        let date = new Date();

        if (dayName == "TONIGHT")
            tonight(hourlyData);

        //If today is saturday
        else if (date.getDay() == 6 && dayName == "SUN")
            tomorrow(hourlyData, dayName);

        //to show tomorrow with hourly interval 
        else if (dayName == dayNames[date.getDay() + 1])
            tomorrow(hourlyData, dayName);

        //the rest of days are with 3-hours interval
        else {
            let day5Time = [];

            for (let time of fiveDaysData.list) {

                let tempDate = new Date(time.dt * 1000);

                if (tempDate.getDay() == dayNames.indexOf(dayName)) {

                    for (let i = fiveDaysData.list.indexOf(time); i < fiveDaysData.list.indexOf(time) + 9; i++)
                        day5Time.push(fiveDaysData.list[i]);
                    break;
                }
            }

            //Table
            hourlyTime = "";
            hourlyIcons = "";
            pop = "";
            hourlyForecast = "";
            hourlyTemp = "";
            hourlyFeelsLike = "";
            hourlyWindSpeed = "";

            for (let obj of day5Time) {

                let time = new Date(obj.dt * 1000);
                hourlyTime += `<th>${time.getHours()}:00</th>`;

                hourlyIcons += `<td class="img-td"><img src=" http://openweathermap.org/img/wn/${obj.weather[0].icon}@2x.png" alt="Weather Icon"></td>`

                hourlyForecast += `<td>${obj.weather[0].main}</td>`
                pop += `<td>${Math.round(obj.pop * 100)}%;</td>`
                hourlyTemp += `<td>${obj.main.temp}&deg;</td>`
                hourlyFeelsLike += `<td>${obj.main.feels_like}&deg;</td>`
                hourlyWindSpeed += `<td>${obj.wind.speed}</td>`
            }

            $(".tbl").html(
                `<h4>HOURLY</h4>
        <table>
         <thead>
             <th id = "DoW">${fullDaysNames[dayNames.indexOf(dayName)]}</th>
             ${hourlyTime}
         </thead>
         <tbody>
             <tr>
                 <td></td>
                 ${hourlyIcons}
             </tr>
             <tr>
                     <td class = pop><span>Probability of Precipitation</span></td>
                     ${pop}
                 </tr>
             <tr>
                 <td><span>Forecast</span></td>
                 ${hourlyForecast}
             </tr>
             <tr class = temp>
                 <td><span>Temp(&deg;C)</span></td>
                 ${hourlyTemp}
             </tr>
             <tr>
                 <td><span>RealFeel</span></td>
                 ${hourlyFeelsLike}
             </tr>
             <tr>
                 <td><span>Wind&nbsp;(m/s)</span></td>
                 ${hourlyWindSpeed}
             </tr>
         </tbody>
     </table>`
            )
        }
    }

    //today's forecast, hourly interval
    function tonight(data) {
        hourlyTime = "";
        hourlyIcons = "";
        pop = "";
        hourlyForecast = "";
        hourlyTemp = "";
        hourlyFeelsLike = "";
        hourlyWindSpeed = "";

        //Table
        for (let i = 0; i < 48; i++) {

            let time = new Date(data.hourly[i].dt * 1000);

            hourlyTime += `<th>${time.getHours()}:00</th>`;

            hourlyIcons += `<td class="img-td"><img src=" http://openweathermap.org/img/wn/${data.hourly[i].weather[0].icon}@2x.png" alt="Weather Icon"></td>`

            hourlyForecast += `<td>${data.hourly[i].weather[0].main}</td>`;
            pop += `<td>${Math.round(data.hourly[i].pop * 100)}%;</td>`;
            hourlyTemp += `<td>${data.hourly[i].temp}&deg;</td>`;
            hourlyFeelsLike += `<td>${data.hourly[i].feels_like}&deg;</td>`;
            hourlyWindSpeed += `<td>${data.hourly[i].wind_speed}</td>`;

            if (i > 0 && time.getHours() == 0)
                break;
        }

        $(".tbl").html(`<h4>HOURLY</h4>
        <table>
         <thead>
             <th id = "DoW">TODAY</th>
             ${hourlyTime}
         </thead>
         <tbody>
             <tr>
                 <td></td>
                 ${hourlyIcons}
             </tr>
            <tr>
                     <td class = pop><span>Probability of Precipitation</span></td>
                     ${pop}
                 </tr>
             <tr>
                 <td><span>Forecast</span></td>
                 ${hourlyForecast}
             </tr>
             <tr class = "temp">
                 <td><span>Temp(&deg;C)</span></td>
                 ${hourlyTemp}
             </tr>
             <tr>
                 <td><span>RealFeel</span></td>
                 ${hourlyFeelsLike}
             </tr>
             <tr>
                 <td><span>Wind&nbsp;(m/s)</span></td>
                 ${hourlyWindSpeed}
             </tr>
         </tbody>
     </table>
    </div>`)
    }

    //If tomorrow clicked to show hourly data instead of 3-hours interval
    function tomorrow(data, dayName) {
        hourlyTime = "";
        hourlyIcons = "";
        pop = "";
        hourlyForecast = "";
        hourlyTemp = "";
        hourlyFeelsLike = "";
        hourlyWindSpeed = "";

        let checkDate = new Date();
        let twelveCount = 0;

        //Table
        for (let i = 0; i < 48; i++) {

            let time = new Date(data.hourly[i].dt * 1000);

            if (time.getDay() != checkDate.getDay()) {

                if (time.getHours() == 0)
                    twelveCount++;

                hourlyTime += `<th>${time.getHours()}:00</th>`;

                hourlyIcons += `<td class="img-td"><img src=" http://openweathermap.org/img/wn/${data.hourly[i].weather[0].icon}@2x.png" alt="Weather Icon"></td>`

                hourlyForecast += `<td>${data.hourly[i].weather[0].main}</td>`;
                pop += `<td>${Math.round(data.hourly[i].pop * 100)}%;</td>`;
                hourlyTemp += `<td>${data.hourly[i].temp}&deg;</td>`;
                hourlyFeelsLike += `<td>${data.hourly[i].feels_like}&deg;</td>`;
                hourlyWindSpeed += `<td>${data.hourly[i].wind_speed}</td>`;

                if (twelveCount == 2 && time.getHours() == 0)
                    break;
            }
        }

        $(".tbl").html(`<h4>HOURLY</h4>
        <table>
         <thead>
             <th id = "DoW">${fullDaysNames[dayNames.indexOf(dayName)]}</th>
             ${hourlyTime}
         </thead>
         <tbody>
             <tr>
                 <td></td>
                 ${hourlyIcons}
             </tr>
            <tr>
                     <td class = pop><span>Probability of Precipitation</span></td>
                     ${pop}
                 </tr>
             <tr>
                 <td><span>Forecast</span></td>
                 ${hourlyForecast}
             </tr>
             <tr class = "temp">
                 <td><span>Temp(&deg;C)</span></td>
                 ${hourlyTemp}
             </tr>
             <tr>
                 <td><span>RealFeel</span></td>
                 ${hourlyFeelsLike}
             </tr>
             <tr>
                 <td><span>Wind&nbsp;(m/s)</span></td>
                 ${hourlyWindSpeed}
             </tr>
         </tbody>
     </table>
    </div>`)
    }
}