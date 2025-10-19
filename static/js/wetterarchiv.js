
document.addEventListener("DOMContentLoaded", () => {
    const wetterForm = document.getElementById("wetterForm");
    const chartContainer = document.getElementById("chartContainer");
    const stationenScript = document.getElementById("stationen-data");
    const stationenListe = stationenScript ? JSON.parse(stationenScript.textContent) : [];


    wetterForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const station = document.getElementById("station").value;
        const stationName =
            stationenListe.find(s => s.STAID == station)?.STANAME || station;
        const dateInput = document.getElementById("date").value;
        const parts = dateInput.split(".");

        if (parts.length !== 3) {
            document.getElementById("result").innerHTML =
                `<p>❌ Ungültiges Datum. Bitte im Format TT.MM.JJJJ eingeben.</p>`;
            return;
        }

        const [day, month, year] = parts;
        const dateFormatted = `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
        const apiURL = `/api/v1/${station}/${dateFormatted}`;

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

            const chartResponse = await fetch(`/api/v1/yearinput/${station}/${year}`);
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

            chartContainer.classList.add("visible");

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
                    plugins: {
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: (context) => `${context.parsed.y}°C am ${context.label}`
                            }
                        },
                        legend: { display: false }
                    },
                    responsive: true,
                    animation: { duration: 3000, easing: "easeInOutCubic" },
                    scales: {
                        y: { title: { display: true, text: "Temperatur in Celsius" } },
                        x: { ticks: { maxTicksLimit: 12 } }
                    }
                }
            });
            setTimeout(() => {
                chartContainer.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);

        } catch (error) {
            console.error(error);
            document.getElementById("result").innerHTML =
                `<p>❌ Fehler bei der Abfrage.</p>`;
        }
    });
});
