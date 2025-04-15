const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const messagesBox = document.getElementById('messages');

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

function initChat() {
  const saved = localStorage.getItem('chatMessages');
  if (saved) {
    renderMessages(JSON.parse(saved));
  } else {
    fetch('data.json')
      .then(res => res.json())
      .then(data => {
        const texts = data.map(item => item.text);
        localStorage.setItem('chatMessages', JSON.stringify(texts));
        renderMessages(texts);
      });
  }
}

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

document.getElementById('clear-btn').addEventListener('click', () => {
  localStorage.removeItem('chatMessages');
  messagesBox.innerHTML = '';
  initChat();
});

initChat();