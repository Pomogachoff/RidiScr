const fileInput = document.getElementById('fileInput');
const imgDiv = document.querySelector('.images');

fileInput.addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const rawText = e.target.result; // содержимое файла

    // 1. Найти начало JSON – после `text": "`
    const startMarker = 'text": "';
    const startIndex = rawText.indexOf(startMarker);
    if (startIndex === -1) {
      console.error('Не найден маркер "text": "');
      return;
    }

    // 2. Взять всё после маркера, убрать завершающую кавычку и возможный мусор
    let jsonPart = rawText.substring(startIndex + startMarker.length);
    // Удаляем последнюю кавычку, если она есть (закрывает строку)
    if (jsonPart.endsWith('"')) {
      jsonPart = jsonPart.slice(0, -1);
    }

    // 3. Преобразовать экранированные кавычки в обычные (заменяем \" на ")
    //    и убираем лишние обратные слеши, если есть (но они только перед кавычками)
    const cleanJson = jsonPart.replace(/\\"/g, '"');

    // 4. Распарсить JSON
    let data;
    try {
      data = JSON.parse(cleanJson);
    } catch (err) {
      console.error('Ошибка парсинга JSON:', err);
      return;
    }

    // 5. Проверить структуру и вывести изображения
    if (data && data.data && Array.isArray(data.data.pages)) {
      imgDiv.innerHTML = ''; // очищаем
      data.data.pages.forEach(page => {
        if (page.src) {
          const img = document.createElement('img');
          img.src = page.src;
          imgDiv.appendChild(img);
        }
      });
    } else {
      console.error('Неверная структура данных');
    }
  };

  reader.onerror = function(e) {
    console.error('Ошибка чтения файла', e);
  };

  reader.readAsText(file);
});
