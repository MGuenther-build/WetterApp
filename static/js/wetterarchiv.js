
function initWetterarchiv() {
    const wetterForm = document.getElementById("wetterForm");
    if (!wetterForm)
        return;
    if (wetterForm.dataset.initialized === "1") 
        return;
    wetterForm.dataset.initialized = "1";
    const chartWrapper = document.getElementById("chartContainer");
    const stationenScript = document.getElementById("stationen-data");
    const stationenListe = stationenScript ? JSON.parse(stationenScript.textContent) : [];

    wetterForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        document.getElementById("chartInfo").innerHTML = "";
        
        const stationInputRaw = document.getElementById("stationInput").value;
        const stationInput = stationInputRaw.trim().toUpperCase();
        const matchedStation = stationenListe.find(s => s.STANAME_CLEAN === stationInput);
        if (!matchedStation) {
            alert("⚠️ Kein Ort mit diesem Namen gefunden!");
            return;
        }
        const stationId = matchedStation.STAID;
        const stationName = matchedStation.STANAME;
        const dateInput = document.getElementById("date").value;
        const parts = dateInput.split(".");
        if (parts.length !== 3) {
            alert("⚠️ Ungültiges Datum. Bitte im Format TT.MM.JJJJ eingeben.");
            return;
        }

        const [day, month, year] = parts;
        const dateFormatted = `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
        const apiURL = `/api/v1/${stationId}/${dateFormatted}`;

        try {
            const response = await fetch(apiURL);
            const data = await response.json();

            const temperatureDisplay =
                typeof data.temperature === "number"
                    ? `${data.temperature}°C`
                    : data.temperature;

            document.getElementById("chartInfo").innerHTML = `
                <p>📍 ${stationName}</p>
                <p>📅 Datum: ${data.date}</p>
                <p>🌡️ Temperatur: ${temperatureDisplay}</p>
            `;
            
            const chartResponse = await fetch(`/api/v1/yearinput/${stationId}/${year}`);
            const chartData = await chartResponse.json();
            const labels = [];
            const temps = [];

            chartData.forEach(entry => {
                const dateStr = entry["    DATE"];
                const temp = entry["   TG"];
                if (temp > -800) {
                    const day = dateStr.slice(6, 8);
                    const month = dateStr.slice(4, 6);
                    labels.push(`${day}.${month}`);
                    temps.push(temp / 10);
                }
            });

            if (window.chartInstance) {
                window.chartInstance.destroy();
            }

            const ctx = document.getElementById("chart").getContext("2d");
            window.chartInstance = new Chart(ctx, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        data: temps,
                        borderColor: "#2B1B04",
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: "#FF9900",
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: (context) => `${context.parsed.y}°C am ${context.label}`
                            }
                        },
                        legend: { display: false }
                    },
                    animation: { 
                        duration: 1500,
                        easing: "linear",
                        onProgress: function(animation) {
                            const chart = animation.chart;
                            chart.data.datasets.forEach((dataset) => {
                                dataset._meta = dataset._meta || {};
                                dataset._meta.hidden = false;
                            });
                        },
                        onComplete: () => {
                            chartWrapper.classList.add("visible");
                            chartWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
                        } 
                    },
                    scales: {
                        y: { title: { display: true, text: "Temperatur in Celsius" } },
                        x: { ticks: { maxTicksLimit: 12 } }
                    }
                }
            });
            history.replaceState(null, "", "/Wetterarchiv");

        } catch (error) {
            alert("❌ Fehler bei der Abfrage!");
        }
    });
}
