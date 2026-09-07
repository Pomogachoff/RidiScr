let input = document.querySelector(`#input`);
let imgDiv = document.querySelector(`.images`);
const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', function(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const text = e.target.result;

    // 1. Ищем маркер "text": " (без начальной кавычки)
    let valueSplit = text.split('text": "');
    if (valueSplit.length < 2) {
      console.error('Не найден маркер "text": "');
      return;
    }

    // 2. Берём вторую часть – это и есть JSON-строка
    let value = valueSplit[1];

    // 3. Убираем завершающую кавычку, если есть
    if (value.endsWith('"')) {
      value = value.slice(0, -1);
    }

    // 4. Удаляем все обратные слеши (как делали вы)
    value = value.replaceAll("\\", "");

    // 5. Находим массив pages (после "pages":[)
    let pagesSplit = value.split('"pages":[');
    if (pagesSplit.length < 2) {
      console.error('Не найден "pages":[');
      return;
    }

    // 6. Берём часть с объектами страниц
    let pagesPart = pagesSplit[1];

    // 7. Разбиваем по {"src":
    let srcParts = pagesPart.split('{"src":');

    imgDiv.innerHTML = ''; // очищаем перед добавлением
    for (let i = 0; i < srcParts.length; i++) {
      let part = srcParts[i];
      if (part === "") continue;

      // Удаляем все кавычки и берём первую часть до запятой
      let cleaned = part.replaceAll('"', '');
      let Splitting = cleaned.split(',');
      let src = Splitting[0]; // это и есть URL

      imgDiv.innerHTML += `<img src="${src}">`;
    }

    console.log(text); // для отладки
  };

  reader.onerror = function(e) {
    console.error('File reading error', e);
  };

  reader.readAsText(file);
});
