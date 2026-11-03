
/* =========================================
   RYOEHOCK — WORLD CLOCK
   Main application
========================================= */


/* ---------- TRANSLATIONS ---------- */

const translations = {
    en: {
        worldClocks: "WORLD CLOCKS",
        liveSystem: "LIVE SYSTEM",
        globalTime: "GLOBAL TIME",
        search: "SEARCH",
        searchPlaceholder: "Search any city...",
        currentlyViewing: "CURRENTLY VIEWING",
        localTime: "LOCAL TIME",
        timezone: "TIME ZONE",
        utcOffset: "UTC OFFSET",
        dayStatus: "DAY STATUS",
        localTimeFormat: "TIME FORMAT",
        updatedLive: "TIME SYNCHRONIZED IN REAL TIME",
        footerText: "TIME IS RELATIVE. EXPLORE THE WORLD.",
        sameDay: "SAME DAY",
        differentDay: "DIFFERENT DAY",
        hours24: "24 HOURS",
        hours12: "12 HOURS",
        noResults: "No cities found. Try another search.",
        enterCity: "Enter a city name.",
        searching: "SEARCHING LOCATIONS...",
        searchError: "Unable to search. Check your connection.",
        selectCity: "Select a city to view its local time.",
        cityNotFound: "No matching city found.",
        resultsFound: "SEARCH RESULTS",
        themeDark: "Switch to dark theme",
        themeLight: "Switch to light theme",
        unknownRegion: "Region unavailable"
    },

    it: {
        worldClocks: "OROLOGI MONDIALI",
        liveSystem: "SISTEMA ATTIVO",
        globalTime: "ORA MONDIALE",
        search: "CERCA",
        searchPlaceholder: "Cerca qualsiasi città...",
        currentlyViewing: "CITTÀ SELEZIONATA",
        localTime: "ORA LOCALE",
        timezone: "FUSO ORARIO",
        utcOffset: "DIFFERENZA UTC",
        dayStatus: "GIORNO",
        localTimeFormat: "FORMATO ORARIO",
        updatedLive: "ORA SINCRONIZZATA IN TEMPO REALE",
        footerText: "IL TEMPO È RELATIVO. ESPLORA IL MONDO.",
        sameDay: "STESSO GIORNO",
        differentDay: "GIORNO DIVERSO",
        hours24: "24 ORE",
        hours12: "12 ORE",
        noResults: "Nessuna città trovata. Prova un'altra ricerca.",
        enterCity: "Inserisci il nome di una città.",
        searching: "RICERCA DELLE LOCALITÀ...",
        searchError: "Impossibile effettuare la ricerca. Controlla la connessione.",
        selectCity: "Seleziona una città per visualizzare l'ora locale.",
        cityNotFound: "Nessuna città corrispondente trovata.",
        resultsFound: "RISULTATI DELLA RICERCA",
        themeDark: "Passa al tema scuro",
        themeLight: "Passa al tema chiaro",
        unknownRegion: "Regione non disponibile"
    }
};


/* ---------- DEFAULT CITIES ---------- */

const defaultCities = [
    {
        name: "Rome",
        country: "Italy",
        countryCode: "IT",
        region: "Lazio",
        timezone: "Europe/Rome",
        latitude: 41.9028,
        longitude: 12.4964
    },
    {
        name: "Tokyo",
        country: "Japan",
        countryCode: "JP",
        region: "Tokyo",
        timezone: "Asia/Tokyo",
        latitude: 35.6762,
        longitude: 139.6503
    },
    {
        name: "New York",
        country: "United States",
        countryCode: "US",
        region: "New York",
        timezone: "America/New_York",
        latitude: 40.7128,
        longitude: -74.0060
    }
];


/* ---------- APPLICATION STATE ---------- */

const STORAGE_KEYS = {
    cities: "ryoehock-cities",
    selected: "ryoehock-selected",
    theme: "ryoehock-theme",
    language: "ryoehock-language",
    format: "ryoehock-format"
};

function loadStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch {
        return fallback;
    }
}

function saveStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage may be unavailable.
    }
}

function getSavedCities() {
    const saved = loadStorage(STORAGE_KEYS.cities, null);

    if (!Array.isArray(saved)) {
        return [...defaultCities];
    }

    return saved.filter(city =>
        city &&
        typeof city.name === "string" &&
        typeof city.country === "string" &&
        typeof city.timezone === "string"
    );
}

let cities = getSavedCities();

let selectedCity =
    cities.find(city =>
        city.timezone === loadStorage(
            STORAGE_KEYS.selected,
            "Europe/Rome"
        )
    ) || defaultCities[0];

let language = loadStorage(STORAGE_KEYS.language, "en");

if (!["en", "it"].includes(language)) {
    language = "en";
}

let use24Hour = loadStorage(STORAGE_KEYS.format, true);

if (typeof use24Hour !== "boolean") {
    use24Hour = true;
}

let theme = loadStorage(STORAGE_KEYS.theme, "dark");

if (!["dark", "light"].includes(theme)) {
    theme = "dark";
}

let searchResults = [];
let searchController = null;


/* ---------- DOM ELEMENTS ---------- */

const cityList = document.getElementById("city-list");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("city-search");
const searchResultsContainer =
    document.getElementById("search-results");

const themeToggle = document.getElementById("theme-toggle");
const languageToggle = document.getElementById("language-toggle");
const formatToggle = document.getElementById("format-toggle");

const cityNameElement = document.getElementById("city-name");
const cityCountryElement = document.getElementById("city-country");
const cityDetailsElement = document.getElementById("city-details");

const mainTimeElement = document.getElementById("main-time");
const mainDateElement = document.getElementById("main-date");

const locationCodeElement = document.getElementById("location-code");
const timezoneElement = document.getElementById("timezone-name");
const utcOffsetElement = document.getElementById("utc-offset");
const dayStatusElement = document.getElementById("day-status");
const timeFormatElement = document.getElementById("time-format");


/* ---------- TRANSLATION HELPER ---------- */

function t(key) {
    return translations[language][key] || key;
}


/* ---------- LOCALIZATION ---------- */

function updateLanguage() {

    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach(element => {

        const key = element.dataset.i18n;

        element.textContent = t(key);
    });

    searchInput.placeholder = t("searchPlaceholder");

    languageToggle.textContent =
        language === "en" ? "IT" : "EN";

    updateThemeButton();

    renderMainClock();
    renderSidebar();
    updateFormatButton();
}


/* ---------- THEME ---------- */

function applyTheme() {

    document.body.classList.toggle(
        "light-theme",
        theme === "light"
    );

    updateThemeButton();

    saveStorage(STORAGE_KEYS.theme, theme);
}

function updateThemeButton() {

    themeToggle.textContent =
        theme === "dark" ? "☼" : "◐";

    themeToggle.title = theme === "dark"
        ? t("themeLight")
        : t("themeDark");

    themeToggle.setAttribute(
        "aria-label",
        themeToggle.title
    );
}

function toggleTheme() {

    theme = theme === "dark" ? "light" : "dark";

    applyTheme();
}


/* ---------- LANGUAGE TOGGLE ---------- */

function toggleLanguage() {

    language = language === "en" ? "it" : "en";

    saveStorage(STORAGE_KEYS.language, language);

    updateLanguage();
}


/* ---------- TIMEZONE UTILITIES ---------- */

function getUTCOffset(timezone, date = new Date()) {

    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    }).formatToParts(date);

    const values = {};

    parts.forEach(part => {

        if (part.type !== "literal") {
            values[part.type] = Number(part.value);
        }
    });

    const localTime = Date.UTC(
        values.year,
        values.month - 1,
        values.day,
        values.hour,
        values.minute,
        values.second
    );

    const utcTime = Math.floor(date.getTime() / 1000) * 1000;

    const offset = Math.round(
        (localTime - utcTime) / 60000
    );

    const sign = offset >= 0 ? "+" : "-";
    const absolute = Math.abs(offset);

    const hours = String(
        Math.floor(absolute / 60)
    ).padStart(2, "0");

    const minutes = String(
        absolute % 60
    ).padStart(2, "0");

    return `UTC${sign}${hours}:${minutes}`;
}


/* ---------- TIME FORMATTING ---------- */

function getTimeParts(timezone, date = new Date()) {

    return new Intl.DateTimeFormat(
        language === "it" ? "it-IT" : "en-GB",
        {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: use24Hour ? "h23" : "h12"
        }
    ).formatToParts(date);
}

function formatTime(timezone, date = new Date()) {

    const parts = getTimeParts(timezone, date);

    const values = {};

    parts.forEach(part => {
        values[part.type] = part.value;
    });

    const main = `${values.hour}:${values.minute}`;
    const seconds = values.second;

    const period = values.dayPeriod
        ? ` ${values.dayPeriod}`
        : "";

    return {
        main,
        seconds,
        period
    };
}


/* ---------- DATE FORMATTING ---------- */

function formatDate(timezone, date = new Date()) {

    return new Intl.DateTimeFormat(
        language === "it" ? "it-IT" : "en-GB",
        {
            timeZone: timezone,
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ).format(date);
}


/* ---------- DAY COMPARISON ---------- */

function getLocalDate(timezone, date = new Date()) {

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
}

function isDifferentDay(timezone, date = new Date()) {

    const currentTimezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        getLocalDate(timezone, date) !==
        getLocalDate(currentTimezone, date)
    );
}


/* ---------- MAIN CLOCK ---------- */

function renderMainClock() {

    if (!selectedCity) return;

    const city = selectedCity;
    const now = new Date();

    const time = formatTime(city.timezone, now);

    // City name

    cityNameElement.replaceChildren();

    const nameText = document.createTextNode(city.name);

    const dot = document.createElement("span");
    dot.className = "title-dot";
    dot.textContent = ".";

    cityNameElement.append(nameText, dot);

    // Country

    cityCountryElement.textContent =
        city.country.toUpperCase();

    // Region and country

    cityDetailsElement.textContent = [
        city.region,
        city.country
    ].filter(Boolean).join(", ");

    // Time

    mainTimeElement.replaceChildren();

    const main = document.createElement("span");
    main.textContent = time.main;

    const seconds = document.createElement("span");
    seconds.className = "time-seconds";
    seconds.textContent = `:${time.seconds}${time.period}`;

    mainTimeElement.append(main, seconds);

    // Date

    mainDateElement.textContent = formatDate(
        city.timezone,
        now
    );

    // Timezone

    timezoneElement.textContent = city.timezone;

    // UTC offset

    utcOffsetElement.textContent = getUTCOffset(
        city.timezone,
        now
    );

    // Day status

    dayStatusElement.textContent = isDifferentDay(
        city.timezone,
        now
    ) ? t("differentDay") : t("sameDay");

    // Location code

    locationCodeElement.textContent =
        `${city.countryCode || "--"} / ${city.timezone.split("/")[0].toUpperCase()}`;

    // Time format

    timeFormatElement.textContent = use24Hour
        ? t("hours24")
        : t("hours12");
}


/* ---------- SIDEBAR ---------- */

function renderSidebar() {

    cityList.replaceChildren();

    cities.forEach(city => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "city-item";

        if (selectedCity &&
            city.timezone === selectedCity.timezone) {

            button.classList.add("active");
            button.setAttribute("aria-current", "true");
        }

        const main = document.createElement("span");
        main.className = "city-item-main";

        const dot = document.createElement("span");
        dot.className = "city-item-dot";

        const name = document.createElement("span");
        name.className = "city-item-name";
        name.textContent = city.name;

        main.append(dot, name);

        const time = document.createElement("span");
        time.className = "city-item-time";

        time.textContent = formatSidebarTime(city.timezone);

        button.append(main, time);

        button.addEventListener("click", () => {
            selectCity(city);
        });

        cityList.appendChild(button);
    });
}

function formatSidebarTime(timezone) {

    const date = new Date();

    return new Intl.DateTimeFormat(
        language === "it" ? "it-IT" : "en-GB",
        {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: use24Hour ? "h23" : "h12"
        }
    ).format(date);
}


/* ---------- CITY SELECTION ---------- */

function selectCity(city) {

    selectedCity = city;

    // Add the city to the sidebar if necessary.

    const alreadyTracked = cities.some(
        item => item.timezone === city.timezone
    );

    if (!alreadyTracked) {
        cities.push(city);
    }

    saveStorage(STORAGE_KEYS.cities, cities);
    saveStorage(STORAGE_KEYS.selected, city.timezone);

    renderMainClock();
    renderSidebar();

    closeSearchResults();
}


/* ---------- CITY SEARCH ---------- */

async function searchCity(query) {

    const search = query.trim();

    if (search.length < 2) {

        showSearchMessage(t("enterCity"));
        return;
    }

    if (searchController) {
        searchController.abort();
    }

    searchController = new AbortController();

    showSearchMessage(t("searching"));

    try {

        const params = new URLSearchParams({
            name: search,
            count: "10",
            language: language,
            format: "json"
        });

        const url =
            `https://geocoding-api.open-meteo.com/v1/search?${params}`;

        const response = await fetch(url, {
            signal: searchController.signal
        });

        if (!response.ok) {
            throw new Error("Geocoding request failed");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {

            showSearchMessage(t("noResults"));
            return;
        }

        searchResults = data.results
            .filter(result =>
                result.timezone &&
                Number.isFinite(result.latitude) &&
                Number.isFinite(result.longitude)
            )
            .map(result => ({

                name: result.name,
                country: result.country || "",
                countryCode: result.country_code || "",
                region: result.admin1 || "",
                timezone: result.timezone,
                latitude: result.latitude,
                longitude: result.longitude

            }));

        if (searchResults.length === 0) {
            showSearchMessage(t("noResults"));
            return;
        }

        renderSearchResults();

    } catch (error) {

        if (error.name === "AbortError") {
            return;
        }

        console.error("Search error:", error);

        showSearchMessage(t("searchError"));
    }
}


/* ---------- SEARCH RESULTS ---------- */

function renderSearchResults() {

    searchResultsContainer.replaceChildren();

    const heading = document.createElement("div");
    heading.className = "search-feedback";
    heading.textContent = t("resultsFound");

    searchResultsContainer.appendChild(heading);

    searchResults.forEach(city => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "search-result";
        button.setAttribute("role", "option");

        const name = document.createElement("span");
        name.className = "result-name";
        name.textContent = city.name;

        const details = document.createElement("span");
        details.className = "result-details";

        details.textContent = [
            city.region,
            city.country,
            city.timezone
        ].filter(Boolean).join(" · ");

        button.append(name, details);

        button.addEventListener("click", () => {

            selectCity(city);

            searchInput.value = "";

        });

        searchResultsContainer.appendChild(button);
    });

    searchResultsContainer.classList.add("visible");

    searchInput.setAttribute("aria-expanded", "true");
}

function showSearchMessage(message) {

    searchResultsContainer.replaceChildren();

    const feedback = document.createElement("div");
    feedback.className = "search-feedback";
    feedback.textContent = message;

    searchResultsContainer.appendChild(feedback);

    searchResultsContainer.classList.add("visible");

    searchInput.setAttribute("aria-expanded", "true");
}

function closeSearchResults() {

    searchResultsContainer.classList.remove("visible");

    searchInput.setAttribute("aria-expanded", "false");
}


/* ---------- TIME FORMAT ---------- */

function toggleTimeFormat() {

    use24Hour = !use24Hour;

    saveStorage(STORAGE_KEYS.format, use24Hour);

    updateFormatButton();

    renderMainClock();
    renderSidebar();
}

function updateFormatButton() {

    formatToggle.textContent = use24Hour
        ? "24H"
        : "12H";
}


/* ---------- EVENT LISTENERS ---------- */

// Search submission

searchForm.addEventListener("submit", event => {

    event.preventDefault();

    searchCity(searchInput.value);
});

// Theme

themeToggle.addEventListener("click", toggleTheme);

// Language

languageToggle.addEventListener("click", toggleLanguage);

// Time format

formatToggle.addEventListener("click", toggleTimeFormat);

// Close search when clicking outside

document.addEventListener("click", event => {

    if (!searchForm.contains(event.target)) {
        closeSearchResults();
    }
});

// Keyboard support

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeSearchResults();
    }
});


/* ---------- LIVE CLOCK ---------- */

function updateClocks() {

    renderMainClock();
    renderSidebar();
}

// Update every second.

setInterval(updateClocks, 1000);


/* ---------- INITIALIZATION ---------- */

function initializeApp() {

    applyTheme();

    updateLanguage();

    updateFormatButton();

    selectCity(selectedCity);
}

// Start application.

initializeApp();