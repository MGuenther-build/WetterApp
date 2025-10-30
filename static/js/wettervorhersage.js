
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('wetterFormVorhersage');
    const output = document.getElementById('forecast-output');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        list.innerHTML = "";

        const stadt = document.getElementById('stadt').value.trim();
        if (!stadt) 
            return;

        showSpinner();

        try {
            const response = await fetch(`/vorhersage/${stadt}`);
            const daten = await response.json();

            if (daten.error) {
                output.innerHTML = `<h2>${daten.error}</h2>`;
                hideSpinner();
                return;
            }
            const tage = {};
            const timezone_offset = daten.timezone;
            daten.list.forEach(e => {
                const tag = e.drei_tage;
                if (!tage[tag]) tage[tag] = [];
                tage[tag].push(e);
            });

            let html = '<div class="forecast-grid" id="scroll-forecast">';
            Object.keys(tage).forEach(tag => {
                const temps = tage[tag].map(e => e.main.temp);
                const max_temp = Math.round(Math.max(...temps));
                const min_temp = Math.round(Math.min(...temps));
                const tempClass = t => {
                    if (t < -10) 
                        return 'temp-sehrkalt';
                    if (t <= 0) 
                        return 'temp-kalt';
                    if (t < 10) 
                        return 'temp-kuehl';
                    if (t < 15) 
                        return 'temp-maessig';
                    if (t < 20) 
                        return 'temp-mild';
                    if (t < 25) 
                        return 'temp-warm';
                    if (t < 30) 
                        return 'temp-sehrwarm';
                    if (t < 40) 
                        return 'temp-heiss';
                    return 'temp-sehrheiss';
                };

                html += `<div class="forecast-columns">
                            <h3>
                                <img src="${window.location.origin}/static/Vorhersage.png" 
                                     alt="Wettericon" class="symbol">
                                ${tag}
                            </h3>
                            <p class="${tempClass(max_temp)}">${max_temp}°C</p>
                            <div class="trennstrich"></div>
                            <p class="${tempClass(min_temp)}">${min_temp}°C</p>
                            <canvas id="tempChart-${tag}" width="300" height="150"></canvas>
                            <div class="weather-timeline">`;

                tage[tag].forEach(e => {
                    html += `<div class="weather-point">
                                <img src="https://openweathermap.org/img/wn/${e.weather[0].icon}.png" 
                                     alt="${e.weather[0].description}" 
                                     title="${e.weather[0].description}">
                                <span class="weather-time">${e.local_time.substring(11,16)}</span>
                             </div>`;
                });

                html += `</div></div>`;
            });
            html += '</div>';
            output.innerHTML = html;

            window.charts = window.charts || {};
            Object.keys(tage).forEach(tag => {
                const canvasId = `tempChart-${tag}`;
                const canvas = document.getElementById(canvasId);
                if (!canvas) return;
                const ctx = canvas.getContext('2d');

                if (window.charts[canvasId]) window.charts[canvasId].destroy();
                
                window.charts[canvasId] = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: tage[tag].map(e => e.local_time.substring(11,16)),
                        datasets: [{
                            label: 'Temperatur (°C)',
                            data: tage[tag].map(e => Math.round(e.main.temp)),
                            borderColor: '#FF9900',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            tension: 0.3,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBackgroundColor: '#2B1B04'
                        }]
                    },
                    options: {
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                            const index = context.dataIndex;
                                            const e = tage[tag][index];
                                        function beaufort(ms) {
                                            const bft = [0.3, 1.5, 3.3, 5.4, 7.9, 10.7, 13.8, 17.1, 20.7, 24.4, 28.4, 32.6];
                                            for (let i = 0; i < bft.length; i++) {
                                                if (ms <= bft[i]) return i;
                                            }
                                            return 12;
                                        }
                                        return [
                                            `Temperatur: ${Math.round(e.main.temp)}°C`,
                                            `Luftfeuchtigkeit: ${e.main.humidity}%`,
                                            `Gefühlte Temperatur: ${Math.round(e.main.feels_like)}°C`,
                                            `Windstärke (Bft): ${beaufort(e.wind?.speed)}`,e.wind?.gust ? `Böen: ${Math.round(e.wind.gust * 3.6)} km/h` : null
                                        ].filter(Boolean);
                                    }
                                }
                            }
                        },
                        scales: {
                            x: { 
                                title: { display: true, text: 'Uhrzeit (Ortszeit)' } },
                            y: { 
                                title: { display: true, text: 'Temperatur (°C)' },
                                ticks: { stepSize: 1 }
                            }
                        }
                    }
                });
            });
            hideSpinner();

            const forecastSection = document.getElementById('scroll-forecast');
            if (forecastSection) forecastSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (err) {
            console.error(err);
            hideSpinner();
            output.innerHTML = '<p>Fehler beim Laden der Daten</p>';
            hideSpinner();
        }
    });

  const input = document.getElementById("stadt");
  const wrapper = document.querySelector(".autocomplete-wrapper");
  const list = document.createElement("ul");
  list.id = "autocomplete-list";
  list.className = "autocomplete-list";
  wrapper.appendChild(list);
  
  let timeout = null;
  
  form.addEventListener("submit", () => {
    list.innerHTML = "";
    list.style.display = "none";
  });
  
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      list.innerHTML = "";
      list.style.display = "none";
    }
  });

  input.addEventListener("input", () => {
    clearTimeout(timeout);
    const query = input.value.trim();
    if (query.length < 2) {
      list.innerHTML = "";
      list.style.display = "none";
      return;
    }

    list.style.display = "block";

    timeout = setTimeout(() => {
      fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          list.innerHTML = "";
          data.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.name}, ${item.country}`;
            li.addEventListener("click", () => {
              input.value = item.name;
              list.innerHTML = "";
              list.style.display = "none";
            });
            list.appendChild(li);
          });
        });
    }, 100);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".wettervorhersage-container")) {
      list.innerHTML = "";
    }
  });
});
