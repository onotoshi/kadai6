var totalReports = 0;

function updateReportCounts() {
    document.getElementById('totalReports').innerText = totalReports;
}

function updateDateTime() {
    var now = new Date();
    var datetimeString = now.toLocaleString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric' 
    });
    document.getElementById('datetime').innerText = datetimeString;
}

function loadMapScenario() {
    var map;
    var locations = {
        hiratsuka: { center: new Microsoft.Maps.Location(35.3273, 139.3522), zoom: 12 },
        oiso: { center: new Microsoft.Maps.Location(35.3038, 139.3151), zoom: 12 }
    };

    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        center: locations.hiratsuka.center,
        zoom: locations.hiratsuka.zoom,
        traffic: { flow: 'none', incidents: true }
    });

    updateReportCounts();
    updateDateTime();
    setInterval(updateDateTime, 1000);

    document.getElementById('regionSelect').addEventListener('change', function() {
        var selectedRegion = this.value;
        map.setView({
            center: locations[selectedRegion].center,
            zoom: locations[selectedRegion].zoom
        });
    });

    // 自分の位置情報を表示
    navigator.geolocation.getCurrentPosition(function(position) {
        var userLocation = new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude);
        var userPin = new Microsoft.Maps.Pushpin(userLocation, {
            title: 'あなたの位置',
            color: 'green'
        });
        map.entities.push(userPin);
        map.setView({ center: userLocation, zoom: 14 });
        
        // 天気情報を取得
        updateWeather(position.coords.latitude, position.coords.longitude);
    });
}

function updateWeather(lat, lon) {
    var apiKey = 'dc43fd11dd0f9bcb6e11044ac467012c'; // ここにあなたのAPIキーを入力します
    var url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${apiKey}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            var weatherDescription = data.weather[0].description;
            var temperature = data.main.temp;
            var weatherString = `現在の天気: ${weatherDescription}, 気温: ${temperature}°C`;
            document.getElementById('weather').innerText = weatherString;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            document.getElementById('weather').innerText = '天気情報を取得できませんでした。';
        });
}

function registerShare() {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var shareInfo = {
            latitude: lat,
            longitude: lon,
            time: new Date().toLocaleString()
        };

        // シェア情報を保存するロジック（ここでは仮に配列に保存）
        shares.push(shareInfo);
        totalReports++;
        updateReportCounts();

        // シェア情報を表示
        var map = new Microsoft.Maps.Map(document.getElementById('myMap'));
        var loc = new Microsoft.Maps.Location(lat, lon);
        var pin = new Microsoft.Maps.Pushpin(loc, {
            title: 'フードシェアリング',
            color: 'orange'
        });
        pin.metadata = {
            time: shareInfo.time
        };
        Microsoft.Maps.Events.addHandler(pin, 'click', function () {
            showShareNotification(pin.metadata.time);
        });
        map.entities.push(pin);
    });
}

function showShareNotification(time) {
    var notification = document.createElement('div');
    notification.className = 'share-notification';
    notification.innerHTML = `
        <div>フードシェアリング</div>
        <div>${time}</div>
    `;

    document.getElementById('myMap').appendChild(notification);

    setTimeout(function() {
        notification.classList.add('show');
    }, 100);

    setTimeout(function() {
        notification.classList.remove('show');
        setTimeout(function() {
            document.getElementById('myMap').removeChild(notification);
        }, 500);
    }, 3000);
}
