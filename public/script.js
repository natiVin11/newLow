let apartmentsData = [];  // נתונים של הדירות

// פונקציה לטעינת הדירות
function loadApartments() {
    fetch('2025.json')  // יש לוודא שהקובץ קיים בשרת המקומי או בשרת נתיב תקין
        .then(response => response.json())
        .then(data => {
            apartmentsData = data;
            renderBuildings(data);  // מציג את הבניינים בלבד בהתחלה
            updateStatusSummary(data);
        })
        .catch(error => {
            console.error('שגיאה בטעינת הדירות:', error);
        });
}

// פונקציה להצגת הבניינים
function renderBuildings(data) {
    const apartmentsListDiv = document.getElementById('apartments-list');
    apartmentsListDiv.innerHTML = '';  // איפוס התוכן הקודם

    // יצירת כותרת לכל בניין
    for (const building in data) {
        const buildingDiv = document.createElement('div');
        const buildingTitle = document.createElement('h3');
        buildingTitle.textContent = building;
        buildingDiv.appendChild(buildingTitle);

        // הוספת כפתור לבחירת בניין
        const viewButton = document.createElement('button');
        viewButton.textContent = 'הצג דיירים';
        viewButton.onclick = function() {
            toggleApartmentsView(building, data[building], buildingDiv);
        };
        buildingDiv.appendChild(viewButton);

        apartmentsListDiv.appendChild(buildingDiv);
    }
}

// פונקציה להציג או להסתיר את הדיירים בבניין
function toggleApartmentsView(building, apartments, buildingDiv) {
    let existingApartmentsDiv = buildingDiv.querySelector('.apartments-list');

    if (existingApartmentsDiv) {
        existingApartmentsDiv.remove();
    } else {
        const apartmentsDiv = document.createElement('div');
        apartmentsDiv.classList.add('apartments-list');

        apartments.forEach(apartment => {
            const apartmentDiv = document.createElement('div');
            apartmentDiv.classList.add('apartment');

            apartmentDiv.innerHTML = `
                <p>דירה: ${apartment.דירה}</p>
                <p>שם מלא: ${apartment["שם מלא"]}</p>
                <p>טלפון: ${apartment.טלפון || 'לא הוזן'}</p>
                <p>סטטוס: 
                  <select onchange="updateApartmentStatus('${building}', '${apartment.דירה}', this.value)">
                    <option value="">בחר סטטוס</option>
                    <option value="חתם" ${apartment.סטטוס === 'חתם' ? 'selected' : ''}>חתם</option>
                    <option value="ללא מענה" ${apartment.סטטוס === 'ללא מענה' ? 'selected' : ''}>ללא מענה</option>
                    <option value="סרבן" ${apartment.סטטוס === 'סרבן' ? 'selected' : ''}>סרבן</option>
                  </select>
                </p>
            `;
            apartmentsDiv.appendChild(apartmentDiv);
        });

        buildingDiv.appendChild(apartmentsDiv);
    }
}

// פונקציה לעדכון הסטטוס של דירה
function updateApartmentStatus(building, apartment, status) {
    apartmentsData[building] = apartmentsData[building].map(a => {
        if (a.דירה === apartment) {
            a.סטטוס = status;
        }
        return a;
    });

    // שמירה בשרת (כדי להימנע משגיאה, יש לוודא שכתובת ה-URL נכונה)
    fetch('2025.json', {  // אם אתה רוצה להשתמש בקובץ JSON בצורה מקומית, ייתכן שתצטרך להתקין שרת
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            building: building,
            apartment: apartment,
            status: status,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(() => {
        loadApartments();  // טוען מחדש את הדירות לאחר העדכון
    })
    .catch(error => {
        console.error('שגיאה בעדכון הסטטוס:', error);
    });
}

// פונקציה לעדכון הסיכום של הסטטוסים
function updateStatusSummary(data) {
    let signedCount = 0;
    let noResponseCount = 0;
    let refusedCount = 0;

    for (const building in data) {
        data[building].forEach(apartment => {
            if (apartment.סטטוס === 'חתם') {
                signedCount++;
            } else if (apartment.סטטוס === 'ללא מענה') {
                noResponseCount++;
            } else if (apartment.סטטוס === 'סרבן') {
                refusedCount++;
            }
        });
    }

    document.getElementById('signed-count').textContent = signedCount;
    document.getElementById('no-response-count').textContent = noResponseCount;
    document.getElementById('refused-count').textContent = refusedCount;
}

// פונקציה לחיפוש דירות
function searchApartments() {
    const query = document.getElementById('search-input').value.toLowerCase();

    const filteredApartments = apartmentsData.filter(building => {
        return building.some(apartment =>
            apartment.דירה.toLowerCase().includes(query) ||
            apartment["שם מלא"].toLowerCase().includes(query) ||
            apartment.טלפון.toLowerCase().includes(query)
        );
    });

    renderBuildings(filteredApartments);
    updateStatusSummary(filteredApartments);
}

// טוען את הדירות כאשר הדף נטען
window.onload = loadApartments;
