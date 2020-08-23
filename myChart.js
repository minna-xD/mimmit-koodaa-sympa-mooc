var currentChart;
var currentCountry;

document.getElementById('renderBtn').addEventListener('click', fetchData);

// FETCHING DATA
async function fetchData() {
    var countryCode = document.getElementById('country').value;
    const indicatorCode = 'SP.POP.TOTL';
    const baseUrl = 'https://api.worldbank.org/v2/country/';
    const url = baseUrl + countryCode + '/indicator/' + indicatorCode + '?format=json&per_page=60';
    console.log('Fetching data from URL: ' + url);

    var response = await fetch(url);

    if (response.status == 200) {
        var fetchedData = await response.json();
        console.log(fetchedData);

        var data = getValues(fetchedData);
        var labels = getLabels(fetchedData);
        var countryName = getCountryName(fetchedData);
        var indicatorName = getIndicatorName(fetchedData);
        renderChart(data, labels, countryName);
        renderInfobox(countryName, countryCode, indicatorName);
    }
}

// HELPER FUNCTIONS
function getValues(data) {
    var vals = data[1].sort((a, b) => a.date - b.date).map(item => item.value);
    return vals;
}

function getLabels(data) {
    var labels = data[1].sort((a, b) => a.date - b.date).map(item => item.date);
    return labels;
}

function getCountryName(data) {
    var countryName = data[1][0].country.value;
    currentCountry = countryName;
    return countryName;
}

function getIndicatorName(data) {
    var indicatorName = data[1][0].indicator.value;
    return indicatorName;
}

// RENDERING CHART

function renderChart(data, labels, countryName) {
    var ctx = document.getElementById('myChart').getContext('2d');

    if (currentChart) {
        // Clear the previous chart if it exists
        currentChart.destroy();
    }

    // Draw new chart
    currentChart = new Chart(ctx, {
        type: 'line', // I prefer line chart for this data (instructions suggested changing this to bar chart)
        data: {
            labels: labels,
            datasets: [{
                label: 'Population, ' + countryName,
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

var infobox = document.querySelector('.info');

function renderInfobox(countryName, countryCode, indicatorName) {
    infobox.innerHTML = '';
    var infoheader = document.createElement('h2');
    infoheader.textContent = countryName + ' (' + indicatorName + ')';
    infobox.appendChild(infoheader);
    fetchCountryData(countryName, infobox);
}

async function fetchCountryData(countryName, output) {
    const baseUrl = 'https://restcountries.eu/rest/v2/name/';
    const url = baseUrl + countryName;
    console.log('Fetching data from URL: ' + url);
    var response = await fetch(url);

    if (response.status == 200) {
        var fetchedData = await response.json();
        console.log(fetchedData);

        var capital = fetchedData[0].capital;
        var area = fetchedData[0].area;
        var flag = fetchedData[0].flag;

        var countryInfo = document.createElement('ul');
        var flagImageLI = document.createElement('li');
        var flagImage = document.createElement('img');
        flagImage.classList.add("flag");
        flagImage.src = flag;
        flagImageLI.appendChild(flagImage);
        countryInfo.appendChild(flagImageLI);
        var countryCapital = document.createElement('li');
        countryCapital.textContent = "Capital: " + capital;
        countryInfo.appendChild(countryCapital);
        var countryArea = document.createElement('li');
        var squareSup = document.createElement('sup');
        squareSup.textContent = ("2");
        // The language nerd me wanted to format the number to show thousands separator
        countryArea.textContent = "Area: " + area.toLocaleString('en') + "km";
        countryArea.appendChild(squareSup);
        countryInfo.appendChild(countryArea);
        output.appendChild(countryInfo);

    } else {
        var error = document.createElement('p');
        error.textContent = "Data not found";
        output.appendChild(error);
    }
}

