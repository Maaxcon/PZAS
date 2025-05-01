// Виносимо функцію addMessage за межі DOMContentLoaded
function addMessage(text, className) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return; // Перевірка на існування елемента
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className);
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener("DOMContentLoaded", function () {
    // Запобігаємо стандартним діям для кнопок у чаті - додаємо перевірку на існування
    const chatBot = document.querySelector("#chatBot");
    if (chatBot) { // Перевірка на існування елемента перед додаванням обробника
        chatBot.addEventListener("click", function(e) {
            if (e.target.id === "sendMessage") {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }
    
    setTimeout(() => {
        const chat_widget = document.querySelector(".chat-widget");
        const closeChat = document.getElementById("closeChat");
        
        if (chat_widget) {
            chat_widget.style.right = "30px";
        }
        
        if (closeChat && chat_widget) {
            closeChat.addEventListener("click", (e) => {
                e.preventDefault();
                chat_widget.style.right = "-300px";
            });
        }
        
        const sendMessage = document.getElementById('sendMessage');
        const userInput = document.getElementById('userInput');
        
        // Перевірка на існування елементів
        if (!sendMessage || !userInput) {
            console.error("Елементи sendMessage або userInput не знайдені");
            return; // Виходимо з функції, якщо елементи не знайдені
        }
        
        function handleSendMessage() {
            const message = userInput.value.trim();
            if (message) {
                addMessage(message, 'user-message');
                
                try {
                    saveMessageToServer(message, 'user')
                        .then(() => {
                            setTimeout(() => {
                                botResponse(message);
                            }, 600);
                        })
                        .catch(error => {
                            console.error("Помилка при збереженні:", error);
                            setTimeout(() => {
                                botResponse(message);
                            }, 600);
                        });
                } catch (error) {
                    console.error("Помилка:", error);
                    setTimeout(() => {
                        botResponse(message);
                    }, 600);
                }
                
                userInput.value = '';
            }
            return false;
        }
        
   
        sendMessage.onclick = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            return handleSendMessage();
        };
        
    
        userInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                return handleSendMessage();
            }
        };
        
        function botResponse(userText) {
            const response = "Дякую за ваше повідомлення! Ми відповімо найближчим часом.";
            addMessage(response, 'bot-message');
            try {
                saveMessageToServer(response, 'bot');
            } catch (error) {
                console.error("Помилка збереження відповіді бота:", error);
            }
        }
        
  
        loadChatHistory();
        
    }, 2000);
});


function saveMessageToServer(text, sender = 'user') {
    return new Promise((resolve, reject) => {
        fetch('http://localhost:3001/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender: sender,
                text: text,
                timestamp: new Date().toISOString()
            })
        })
        .then(response => {
            if (!response.ok) {
                console.error("Помилка збереження:", response.statusText);
                reject(response.statusText);
            } else {
                resolve(response);
            }
        })
        .catch(error => {
            console.error("Помилка мережі:", error);
            reject(error);
        });
    });
}

function loadChatHistory() {
    fetch('http://localhost:3001/messages')
        .then(res => res.json())
        .then(data => {
            data.forEach(msg => {
                const className = msg.sender === 'user' ? 'user-message' : 'bot-message';
                addMessage(msg.text, className);
            });
        })
        .catch(error => {
            console.error("Помилка завантаження історії:", error);
            // Можемо додати повідомлення користувачу про помилку, якщо потрібно
        });
}