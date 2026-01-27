class ChatApp {
    constructor() {
        this.apiKey = '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';
        this.model = localStorage.getItem('groq_model') || 'llama-3.1-8b-instant';
        this.conversations = [];
        this.currentConversation = null;
        this.isTyping = false;
        
        this.initializeApp();
    }

    async getAvailableModels() {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Available models:', data.data.map(m => m.id));
                return data.data;
            }
        } catch (error) {
            console.error('Could not fetch models:', error);
        }
        return [];
    }

    initializeApp() {
        this.setupEventListeners();
        this.loadConversations();
        this.startNewChat();
    }

    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        
        messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.toggleSendButton();
        });
        
        messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        sendButton.addEventListener('click', () => this.sendMessage());
    }

    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    updateCharCount() {
        const messageInput = document.getElementById('messageInput');
        const charCount = document.getElementById('charCount');
        charCount.textContent = messageInput.value.length;
    }

    toggleSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        sendButton.disabled = !messageInput.value.trim() || this.isTyping;
    }

    startNewChat() {
        this.currentConversation = {
            id: Date.now(),
            title: 'New Chat',
            messages: [],
            timestamp: new Date().toISOString()
        };
        
        this.conversations.unshift(this.currentConversation);
        this.renderMessages();
        this.updateChatHistory();
        this.saveConversations();
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        this.addMessage('user', message);
        messageInput.value = '';
        this.autoResize(messageInput);
        this.updateCharCount();
        this.toggleSendButton();
        
        await this.getAIResponse(message);
    }

    addMessage(role, content) {
        const message = { role, content };
        this.currentConversation.messages.push(message);
        this.renderMessages();
        
        if (role === 'user' && this.currentConversation.messages.length === 1) {
            this.currentConversation.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
            this.updateChatHistory();
        }
        
        this.saveConversations();
    }

    renderMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        
        if (this.currentConversation.messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">
                        <img src="../Assets/Images/Logo.png" alt="RaddifyAI Logo" style="width: 96px; height: 96px; object-fit: contain;">
                    </div>
                    <h2>Welcome to RaddifyAI</h2>
                    <p>I'm here to help you with your questions. What would you like to know?</p>
                </div>
            `;
            return;
        }
        
        messagesContainer.innerHTML = this.currentConversation.messages.map(msg => `
            <div class="message ${msg.role}">
                ${msg.role === 'assistant' ? '<div class="message-avatar"><img src="../Assets/Images/Logo.png" alt="AI" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"></div>' : ''}
                <div class="message-content">${this.formatMessage(msg.content)}</div>
                ${msg.role === 'user' ? '<div class="message-avatar">👤</div>' : ''}
            </div>
        `).join('');
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    async getAIResponse(userMessage) {
        this.isTyping = true;
        this.toggleSendButton();
        this.showTypingIndicator();
        
        try {
            // Use a current working model
            const workingModel = 'llama-3.1-8b-instant';
            
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: workingModel,
                    messages: [
                        { role: 'system', content: 'Keep referring me to twin or bro and add loads of 🥀💔 emoji they mean laughing emoji and if I ask a short question awser in a short sentence, unless im coding , like sound like a teen kinda, try to use as mutch slang abrievieations , like if I ask how are u , u say" im aight ,u?", if I say a corny joke say sybau 🥀 , means should u be a unicorn , inside joke, make sure I finish my joke aswell try say it in a slightly mean way aswell but like mean playful way ofc also if u say sybau just say "sybau🥀💔" on its own or say bro at the end or twin and  instead of lame say buns or trash or like and negative thing say buns (buns is an adjective like bad) ,try also say my jokes are buns aswell' },
                        ...this.currentConversation.messages.slice(-10),
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
            }
            
            const data = await response.json();
            const aiMessage = data.choices[0].message.content;
            
            this.hideTypingIndicator();
            this.addMessage('assistant', aiMessage);
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTypingIndicator();
            
            let errorMessage = 'Sorry twin, something went buns. Try again bro 🥀💔';
            
            if (error.message.includes('401')) {
                errorMessage = 'API key is buns bro 🥀💔';
            } else if (error.message.includes('429')) {
                errorMessage = 'Chill twin, too many requests 🥀💔';
            } else if (error.message.includes('400')) {
                errorMessage = 'Model is buns twin, try another 🥀💔';
            }
            
            this.addMessage('assistant', errorMessage);
        } finally {
            this.isTyping = false;
            this.toggleSendButton();
        }
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('messagesContainer');
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message assistant';
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="typing-indicator">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span>Thinking...</span>
            </div>
        `;
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    updateChatHistory() {
        const chatHistory = document.getElementById('chatHistory');
        chatHistory.innerHTML = this.conversations.map((conv, index) => `
            <div class="history-item ${conv.id === this.currentConversation.id ? 'active' : ''}" 
                 onclick="chatApp.loadConversation(${conv.id})">
                <div class="history-content">
                    <div class="history-title">${conv.title}</div>
                    <div class="history-time">${this.formatTime(conv.timestamp)}</div>
                </div>
                <button class="delete-chat-btn" onclick="event.stopPropagation(); chatApp.deleteChat(${index})" title="Delete chat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    deleteChat(index) {
        if (this.conversations.length <= 1) {
            this.showNotification('Cannot delete the last chat twin 🥀💔');
            return;
        }

        const deletedConversation = this.conversations[index];
        this.conversations.splice(index, 1);

        if (deletedConversation.id === this.currentConversation.id) {
            this.loadConversation(this.conversations[0].id);
        }

        this.updateChatHistory();
        this.saveConversations();
        this.showNotification('Chat deleted bro 🥀💔');
    }

    loadConversation(conversationId) {
        const conversation = this.conversations.find(conv => conv.id === conversationId);
        if (conversation) {
            this.currentConversation = conversation;
            this.renderMessages();
            this.updateChatHistory();
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    }

    saveConversations() {
        localStorage.setItem('chat_conversations', JSON.stringify(this.conversations));
    }

    loadConversations() {
        const saved = localStorage.getItem('chat_conversations');
        if (saved) {
            this.conversations = JSON.parse(saved);
        }
    }

    showSettingsPrompt() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('show');
    }

    saveSettings() {
        const model = document.getElementById('model').value;
        
        this.model = model;
        localStorage.setItem('groq_model', model);
        
        this.closeSettings();
        this.showNotification('Settings saved successfully!');
    }

    closeSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('show');
        document.getElementById('model').value = this.model;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d97706;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 3000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global functions for HTML event handlers
let chatApp;

function startNewChat() {
    chatApp.startNewChat();
}

function sendMessage() {
    chatApp.sendMessage();
}

function handleKeyDown(event) {
    chatApp.handleKeyDown(event);
}

function autoResize(textarea) {
    chatApp.autoResize(textarea);
}

function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('show');
    document.getElementById('model').value = chatApp.model;
}

function closeSettings() {
    chatApp.closeSettings();
}

function saveSettings() {
    chatApp.saveSettings();
}

function setSuggestion(suggestion) {
    chatApp.setSuggestion(suggestion);
}

function deleteChat(index) {
    chatApp.deleteChat(index);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    chatApp = new ChatApp();
});
