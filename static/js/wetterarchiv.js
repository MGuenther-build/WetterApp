let stationenListe = [];

async function initWetterarchiv() {
    const wetterForm = document.getElementById("wetterForm");
    const chartContainer = document.getElementById("chartContainer");
    const chartWrapper = document.getElementById("chartWrapper");

    if (!wetterForm) 
        return;
    if (wetterForm.dataset.initialized === "1") {
        return;
    }

    try {
        const response = await fetch("/api/v1/stationen");
        stationenListe = await response.json();
    } catch (err) {
        return;
    }

    wetterForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const rawInput = document.getElementById("stationInput").value.trim().toUpperCase();
        const stationInput = rawInput.normalize("NFD").replace(/\p{Diacritic}/gu, "");

        const matchedStation = stationenListe.find(s =>
            s.STANAME_CLEAN.normalize("NFD").replace(/\p{Diacritic}/gu, "") === stationInput
        );

        if (!matchedStation) {
            alert("⚠️ Kein Ort mit diesem Namen gefunden!");
            return;
        }

        const stationId = matchedStation.STAID;
        const stationName = matchedStation.STANAME;

        const dateInput = document.getElementById("date").value;
        const parts = dateInput.split(".");
        if (parts.length !== 3) {
            alert("⚠️ Ungültiges Datum! Format: TT.MM.JJJJ");
            return;
        }

        const [day, month, year] = parts;
        const dateFormatted = `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
        document.getElementById("yearLabel").textContent = year;

        try {
            const response = await fetch(`/api/v1/${stationId}/${dateFormatted}`);
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
                    labels.push(`${dateStr.slice(6, 8)}.${dateStr.slice(4, 6)}.`);
                    temps.push(temp / 10);
                }
            });

            chartContainer.style.display = "block";
            const ctx = document.getElementById("chart").getContext("2d");
            if (window.chartInstance) 
                window.chartInstance.destroy();
            window.chartInstance = new Chart(ctx, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        data: temps,
                        borderColor: "#2B1B04",
                        pointRadius: 6,
                        pointHoverRadius: 8,
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
                                label: (context) => `${context.parsed.y}°C`
                            }
                        },
                        legend: { display: false }
                    },
                    animation: { 
                        duration: 500,
                        easing: "linear",
                        onComplete: () => {
                            chartWrapper.classList.add("visible");
                            chartWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
                        } 
                    },
                    scales: {
                        y: { title: { display: true, text: "Temperatur in C°" } },
                        x: { ticks: { maxTicksLimit: 12 } }
                    }
                }
        });
            history.replaceState(null, "", "/Wetterarchiv");
            document.getElementById("scrollTopBtn").addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        } catch (error) {
            alert("❌ Fehler bei der Abfrage!");
        }
    });
}
