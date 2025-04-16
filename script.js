const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const messagesBox = document.getElementById('messages');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.querySelector('.progress-container');

// Функция для обновления прогресс-бара
function updateProgressBar(percentage) {
  progressContainer.style.display = 'block'; // Показываем прогресс-бар
  progressBar.style.width = percentage + '%'; // Обновляем ширину прогресс-бара
}

// Функция рендеринга сообщений
function renderMessages(messages) {
  messagesBox.innerHTML = '';
  messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'message';
    div.textContent = msg;
    messagesBox.appendChild(div);
  });
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

// Функция для инициализации чата
function initChat() {
  const saved = localStorage.getItem('chatMessages');
  if (saved) {
    renderMessages(JSON.parse(saved));
  } else {
    simulateDataLoading(); // Запуск симуляции прогресса
    fetch('data.json')
      .then(res => res.json())
      .then(data => {
        const texts = data.map(item => item.text);
        localStorage.setItem('chatMessages', JSON.stringify(texts));
        renderMessages(texts);
        updateProgressBar(100); // Завершаем прогресс
        setTimeout(() => {
          progressContainer.style.display = 'none'; // Скрываем прогресс-бар
        }, 500);
      });
  }
}

// Симуляция загрузки данных с прогрессом
function simulateDataLoading() {
  let progress = 0;

  const interval = setInterval(() => {
    progress += 10;
    updateProgressBar(progress);

    if (progress >= 100) {
      clearInterval(interval);
    }
  }, 300);
}

// Обработчик отправки сообщения
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
  messages.push(text);
  localStorage.setItem('chatMessages', JSON.stringify(messages));
  input.value = '';
  renderMessages(messages);
});

// Обработчик сохранения чата
document.getElementById('save-btn').addEventListener('click', () => {
  const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
  const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chat_history.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Обработчик загрузки чата из файла
document.getElementById('upload-btn').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);
      if (Array.isArray(data)) {
        localStorage.setItem('chatMessages', JSON.stringify(data));
        renderMessages(data);
      } else {
        alert("Неверный формат файла.");
      }
    } catch (err) {
      alert("Ошибка: " + err.message);
    }
  };
  reader.readAsText(file);
});

// Обработчик очистки чата
document.getElementById('clear-btn').addEventListener('click', () => {
  localStorage.removeItem('chatMessages');
  messagesBox.innerHTML = '';
  initChat();
});

initChat();
