const fileInput = document.getElementById('fileInput');
const imgDiv = document.querySelector('.images');

fileInput.addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      // 1. Парсим HAR как JSON
      const har = JSON.parse(e.target.result);
      
      // 2. Ищем запись, в которой содержится нужный ответ
      //    Обычно это запрос с URL, содержащим "/web-viewer/generate"
      //    или с mimeType = "application/json"
      const entries = har.log.entries || [];
      let targetEntry = null;

      for (const entry of entries) {
        const url = entry.request.url || '';
        // Ищем запрос к API, который возвращает данные страниц
        if (url.includes('/web-viewer/generate') || url.includes('/api/web-viewer/generate')) {
          targetEntry = entry;
          break;
        }
      }

      // Если не нашли по URL, пробуем найти запись с JSON-ответом, содержащим "pages"
      if (!targetEntry) {
        for (const entry of entries) {
          const contentType = entry.response.content.mimeType || '';
          if (contentType.includes('json')) {
            const text = entry.response.content.text || '';
            if (text.includes('"pages"')) {
              targetEntry = entry;
              break;
            }
          }
        }
      }

      if (!targetEntry) {
        console.error('Не найдена подходящая запись в HAR');
        return;
      }

      // 3. Извлекаем текст ответа (это JSON-строка)
      const responseText = targetEntry.response.content.text || '';
      
      // 4. Парсим JSON-ответ
      const data = JSON.parse(responseText);
      
      // 5. Проверяем структуру и выводим изображения
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
        console.error('Неверная структура данных в ответе');
      }
    } catch (err) {
      console.error('Ошибка обработки файла:', err);
    }
  };

  reader.onerror = function(e) {
    console.error('Ошибка чтения файла', e);
  };

  reader.readAsText(file);
});
