// Stałe
const API_KEY = '6afc309d1dmsh7a026746a911e83p1b43ecjsndd277c6ce187';
const API_HOST = 'youtube-v31.p.rapidapi.com';

// Opcje dla zapytania fetch
const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
    }
};

// Kategorie
const categories = [
    { icon: './utilities/newIcon.png', name: 'New' },
    { icon: './utilities/codingIcon.png', name: 'Coding' },
    { icon: './utilities/educationIcon.png', name: 'Education' },
    { icon: './utilities/filmIcon.png', name: 'Movie' },
    { icon: './utilities/gamingIcon.png', name: 'Gaming' },
    { icon: './utilities/musicIcon.png', name: 'Music' },
    { icon: './utilities/sportIcon.png', name: 'Sport' }
];

// Adres URL dla zapytania fetch
let fetchApi = `https://${API_HOST}/search?relatedToVideoId=7ghhRHRP6t4&part=id%2Csnippet&type=video&maxResults=50`;

// Funkcja do tworzenia zawartości strony
function createBody(fetchApi) {
    fetch(fetchApi, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(response => {
            let content = '';
            for (let video of response.items) {
                content += `
                <div onClick="displayVideoModal('${video.id.videoId}'); saveVideoData('https://www.youtube.com/watch?v=${video.id.videoId}', '${video.snippet.title}');" class="video">
                    <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}" />
                    <p>${video.snippet.title}</p>
                </div>
            `;
            }
            document.getElementById('page-content-wrapper').innerHTML = content;
        })
        .catch(err => console.error(err));
    createSidebar();
}

function createHeader(name) {
    document.getElementById("contentHeader").textContent = name + " " + "videos";
}

// Tworzenie bocznego panelu
function createSidebar() {
    categories.forEach(function (category, index) {
        let classes = "list-group-item sidebarElement";

        if (index === 0) {
            classes += " selected";
        }

        document.getElementById("sideBar").innerHTML += `
            <button id="${category.name}" onClick="filterContent('${category.name}')" class="${classes}">
                <img src="${category.icon}" class="sidebarIcon"/>${category.name}
            </button>
        `;
    });
    createHeader("New");
}

// Funkcja do wyszukiwania treści
function searchContent() {
    const searchInput = document.getElementById("searchInput").value;
    filterContent(searchInput);
}

// Funkcja do filtrowania treści
function filterContent(name) {
    // Usunięcie klasy "selected" z wszystkich przycisków
    document.querySelectorAll('.sidebarElement').forEach(button => {
        button.classList.remove("selected");
    });

    // Dodanie klasy "selected" do wybranego przycisku
    let btnId = document.getElementById(name);
    if (btnId == null) { }
    else {
        btnId.classList.add("selected");
    }

    // Ustalenie adresu URL dla zapytania fetch w zależności od wybranej kategorii
    fetchApi = '';
    if (name === 'New' || name === '') {
        fetchApi = `https://youtube-v31.p.rapidapi.com/search?relatedToVideoId=7ghhRHRP6t4&part=id%2Csnippet&type=video&maxResults=50`;
        name = 'New';
    }
    else {
        fetchApi = `https://youtube-v31.p.rapidapi.com/search?part=snippet&q=${name}&maxResults=50`;
    }

    // Wywołanie zapytania fetch i aktualizacja zawartości strony
    fetch(fetchApi, options)
        .then(response => response.json())
        .then(response => {
            if (!response || !response.items) {
                alert('No videos found.');
            } else {
                createHeader(name);
            }
            let content = '';
            for (let video of Object.values(response.items)) {
                content += `
                <div onClick="displayVideoModal('${video.id.videoId}'); saveVideoData('https://www.youtube.com/watch?v=${video.id.videoId}', '${video.snippet.title}');" class="video">
                    <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}" />
                    <p>${video.snippet.title}</p>
                </div>
                `;
            }
            document.getElementById('page-content-wrapper').innerHTML = content;
        })
        .catch(err => console.error(err));
}

const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");

// Obsługa zdarzenia kliknięcia przycisku wyszukiwania
searchButton.addEventListener("click", function () {
    filterContent(searchInput.value);
});

// Obsługa zdarzenia wciśnięcia klawisza Enter w polu wyszukiwania
searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        filterContent(searchInput.value);
    }
});

// Funkcja do wyświetlania modalu z informacjami o wideo
function displayVideoModal(videoId) {
    const modalOptions = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': API_HOST
        }
    };

    // Wywołanie zapytania fetch dla informacji o wideo
    fetch(`https://${API_HOST}/videos?part=contentDetails%2Csnippet%2Cstatistics&id=${videoId}`, modalOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(response => changeVideoModalData(response.items, videoId))
        .catch(err => console.error(err));

    // Wyświetlenie modala
    const videoModal = new bootstrap.Modal("#videoModal", {
        keyboard: false
    });

    videoModal.show();

    // Obsługa zdarzenia ukrycia modala
    videoModal._element.addEventListener('hidden.bs.modal', function () {
        const iframe = document.getElementById("widget2");
        if (iframe) {
            iframe.src = "";
        }
    });
}


// Funkcja do zmiany danych w modalu wideo
function changeVideoModalData(videoData, id) {
    const modalHeader = document.getElementById("videoHeader");
    modalHeader.innerHTML = videoData[0].snippet.title;
    const modalBody = document.getElementById("videoModalBody");

    modalBody.innerHTML =
        `<iframe style="height: 400px;" frameborder="0" allowfullscreen="1" allow="accelerometer; autoplay;
     clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      title="Umieszczanie filmów i&nbsp;playlist" width="640" height="400"
    src="https://www.youtube.com/embed/${id}?autoplay=1&amp;cc_load_policy=1&amp;controls=2&amp;hl=pl&amp;rel=0&amp;enablejsapi=1&amp;origin=https%3A%2F%2Fsupport.google.com&amp;widgetid=1" id="widget2"></iframe>
    <div class="d-flex flex-column">
    <p class="mb-1">Channel: ${videoData[0].snippet.channelTitle}</p>
    <p class="mb-1">Views: ${videoData[0].statistics.viewCount}</p>
    </div>`;

    $("#videoModal").on("hidden.bs.modal", function () {
        const iframe = document.getElementById("widget2");
        if (iframe) {
            const iframeSrc = iframe.src;
            iframe.src = iframeSrc;
        }
    });
}

// Funkcja do zapisywania danych wideo
function saveVideoData(url, title) {
    const currentTime = new Date().toLocaleString();
    let videoData = localStorage.getItem("videoData") ? JSON.parse(localStorage.getItem("videoData")) : [];
    const videoEntry = { time: currentTime, title, url };
    videoData.push(videoEntry);
    localStorage.setItem("videoData", JSON.stringify(videoData));
    console.log(currentTime);
}

// Funkcja do wyświetlania zapisanych wideo
function displaySavedVideos() {
    let videoData = localStorage.getItem("videoData") ? JSON.parse(localStorage.getItem("videoData")) : [];

    const historyModal = new bootstrap.Modal("#historyModal", {
        keyboard: false
    });

    const modalHeader = document.getElementById("historyHeader");
    modalHeader.innerHTML = "History of watching";

    const modalBody = document.getElementById("historyModalBody");
    let content = '';

    for (let video of videoData) {
        content += `
        <div class="d-flex" style="font-size: 12px;">
          <p class="mb-1">${video.time}</p>
          <p class="mb-1"> ${video.title}</p>
          <a class="mb-1" href="${video.url}">${video.url}</a>
        </div>
      `;
    }

    modalBody.innerHTML = content;
    historyModal.show();
}

window.onload = function () {
    createBody(fetchApi);
};



