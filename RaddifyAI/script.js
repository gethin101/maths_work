class ChatApp {
    constructor() {
        this.apiKey = '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';
        this.model = localStorage.getItem('groq_model') || 'llama-3.1-8b-instant';
        this.currentMode = localStorage.getItem('ai_mode') || 'smart';
        this.conversations = [];
        this.currentConversation = null;
        this.isTyping = false;
        
        this.systemMessages = {
            smart: 'You are a highly intelligent AI assistant. Take your time to think deeply about questions and provide comprehensive, well-reasoned responses. Consider multiple perspectives, provide detailed explanations, and ensure your answers are thorough and accurate. Think step-by-step before responding.',
            fast: '',
            fella: 'Keep referring me to twin or bro and add loads of 🥀💔 emoji they mean laughing emoji and if I ask a short question awser in a short sentence, unless im coding , like sound like a teen kinda, try to use as mutch slang abrievieations , like if I ask how are u , u say" im aight ,u?", if I say a corny joke say sybau 🥀 , means should u be a unicorn , inside joke, make sure I finish my joke aswell try say it in a slightly mean way aswell but like mean playful way ofc also if u say sybau just say "sybau🥀💔" on its own or say bro at the end or twin and  instead of lame say buns or trash or like and negative thing say buns (buns is an adjective like bad) ,try also say my jokes are buns aswell'
        };
        
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
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('modeDropdown');
            const modeSelector = document.querySelector('.model-selector');
            if (!modeSelector.contains(e.target) && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });
        
        // Update UI with current mode
        this.updateModeDisplay();
        
        const micButton = document.querySelector('.mic-btn');
        if (micButton) {
            micButton.addEventListener('click', () => this.toggleVoiceMode());
        }
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
        if (charCount) {
            charCount.textContent = messageInput.value.length;
        }
    }

    toggleSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const micButton = document.querySelector('.mic-btn');
        
        const hasText = messageInput.value.trim().length > 0;
        
        if (hasText) {
            sendButton.style.display = 'flex';
            sendButton.disabled = false;
            if (micButton && !this.isVoiceMode) micButton.style.display = 'none';
        } else {
            sendButton.style.display = 'none';
            if (micButton) micButton.style.display = 'flex';
        }
        
        if (this.isTyping) {
            sendButton.disabled = true;
        }
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
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #9ca3af; gap: 1rem;">
                    <img src="../Assets/Images/Logo.png" alt="RaddifyAI Logo" style="width: 200px; height: auto; border-radius: 16px; object-fit: contain;">
                    <h2 style="font-size: 1.5rem; font-weight: 600; color: #e5e7eb;">How can I help you today?</h2>
                </div>
            `;
            return;
        }
        
        messagesContainer.innerHTML = this.currentConversation.messages.map((msg, index) => `
            <div class="message-row ${msg.role}">
                ${msg.role === 'user' ? `
                    <div class="user-content">
                        ${this.formatMessage(msg.content)}
                        <div class="message-actions user-actions" style="margin-top: 0.5rem; justify-content: flex-end;">
                             <button class="action-btn" title="Edit" onclick="chatApp.editMessage(${index})">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                             <button class="action-btn" title="Delete" onclick="chatApp.deleteMessage(${index})">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                ` : `
                    <div class="assistant-content">
                        <div class="message-text">${this.formatMessage(msg.content)}</div>
                        <div class="message-actions">
                            <button class="action-btn" title="Like" onclick="chatApp.handleLike(this)">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-6 0v4H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v4a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-3z"></path></svg>
                            </button>
                            <button class="action-btn" title="Dislike" onclick="chatApp.handleDislike(this)">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 6 0v-4h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3z"></path></svg>
                            </button>
                            <button class="action-btn" title="Copy" onclick="chatApp.copyMessage(this)">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                            <button class="action-btn" title="Retry" onclick="chatApp.regenerateResponse()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 5.36A9 9 0 0 0 20.49 15"></path></svg>
                            </button>
                             <button class="action-btn" title="Delete" onclick="chatApp.deleteMessage(${index})">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                `}
            </div>
        `).join('');
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        // 1. Extract code blocks to avoid formatting conflicts
        const codeBlocks = [];
        const contentWithPlaceholders = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push({ lang: lang || 'plaintext', code: code });
            return placeholder;
        });
        
        // 2. Format the rest of the text
        let formatted = contentWithPlaceholders
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');

        // 3. Reinsert code blocks with proper HTML structure
        codeBlocks.forEach((block, index) => {
            // Escape HTML in the code content
            const escapedCode = block.code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
                
            const html = `
                <div class="code-block">
                    <div class="code-header">
                        <span class="code-language">${block.lang}</span>
                        <button class="copy-code-btn" onclick="copyCode(this)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copy
                        </button>
                    </div>
                    <pre><code class="language-${block.lang}">${escapedCode}</code></pre>
                </div>
            `;
            formatted = formatted.replace(`__CODE_BLOCK_${index}__`, html);
        });
        
        return formatted;
    }

    async getAIResponse(userMessage) {
        this.isTyping = true;
        this.toggleSendButton();
        this.showTypingIndicator();
        
        try {
            const workingModel = this.model;
            
            const systemMessage = this.systemMessages[this.currentMode];
            const messages = systemMessage ? 
                [{ role: 'system', content: systemMessage }, ...this.currentConversation.messages.slice(-10), { role: 'user', content: userMessage }] :
                [...this.currentConversation.messages.slice(-10), { role: 'user', content: userMessage }];
            
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: workingModel,
                    messages: messages,
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
            await this.animateAssistantMessage(aiMessage);
            if (this.isVoiceMode) {
                this.speakAI(aiMessage);
            }
            
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
        typingIndicator.className = 'message-row assistant';
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <div class="assistant-content">
                <div class="message-text">Thinking...</div>
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
    
    async animateAssistantMessage(text) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        const tempRow = document.createElement('div');
        tempRow.className = 'message-row assistant';
        tempRow.id = 'animatedMessage';
        tempRow.innerHTML = `
            <div class="assistant-content">
                <div class="message-text"></div>
            </div>
        `;
        messagesContainer.appendChild(tempRow);
        const messageTextEl = tempRow.querySelector('.message-text');
        
        const tokens = text.match(/(\s+|\S+)/g) || [text];
        let index = 0;
        
        await new Promise((resolve) => {
            const revealNext = () => {
                if (index >= tokens.length) {
                    return resolve();
                }
                const token = tokens[index++];
                const span = document.createElement('span');
                span.className = 'fade-word';
                span.textContent = token;
                messageTextEl.appendChild(span);
                requestAnimationFrame(() => span.classList.add('visible'));
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                setTimeout(revealNext, 15);
            };
            revealNext();
        });
        
        tempRow.remove();
        this.addMessage('assistant', text);
    }
    
    toggleVoiceMode() {
        if (this.isVoiceMode) {
            this.stopVoice();
        } else {
            this.startVoice();
        }
    }
    
    startVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showNotification('Voice not supported in this browser');
            return;
        }
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!this.recognition) {
            this.recognition = new Recognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.onresult = (event) => {
                let finalText = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const res = event.results[i];
                    if (res.isFinal) {
                        finalText += res[0].transcript;
                    }
                }
                if (finalText.trim().length > 0 && !this.isTyping) {
                    this.addMessage('user', finalText.trim());
                    this.getAIResponse(finalText.trim());
                }
            };
            this.recognition.onend = () => {
                if (this.isVoiceMode) {
                    try { this.recognition.start(); } catch {}
                }
            };
        }
        const inputContainer = document.querySelector('.input-container');
        const micButton = document.querySelector('.mic-btn');
        this.isVoiceMode = true;
        if (inputContainer) inputContainer.classList.add('voice-active');
        if (micButton) micButton.classList.add('listening');
        try { this.recognition.start(); } catch {}
        this.showNotification('Voice mode on: listening');
    }
    
    stopVoice() {
        this.isVoiceMode = false;
        const inputContainer = document.querySelector('.input-container');
        const micButton = document.querySelector('.mic-btn');
        if (inputContainer) inputContainer.classList.remove('voice-active');
        if (micButton) micButton.classList.remove('listening');
        if (this.recognition) {
            try { this.recognition.stop(); } catch {}
        }
        window.speechSynthesis.cancel();
        this.showNotification('Voice mode off');
    }
    
    speakAI(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1;
        utter.pitch = 1;
        utter.volume = 1;
        window.speechSynthesis.speak(utter);
    }

    updateChatHistory() {
        const chatHistory = document.getElementById('chatHistory');
        if (!chatHistory) return;

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

    updateModeDisplay() {
        const currentModeElement = document.getElementById('currentMode');
        if (currentModeElement) {
            const modeNames = {
                'smart': 'Smart',
                'fast': 'Fast', 
                'fella': 'Fella'
            };
            currentModeElement.textContent = modeNames[this.currentMode];
        }
    }

    setMode(mode) {
        this.currentMode = mode;
        localStorage.setItem('ai_mode', mode);
        this.updateModeDisplay();
        
        // Close dropdown
        const dropdown = document.getElementById('modeDropdown');
        dropdown.classList.remove('show');
        
        // Show notification
        const modeNames = {
            'smart': 'Smart',
            'fast': 'Fast',
            'fella': 'Fella'
        };
        this.showNotification(`Mode changed to ${modeNames[mode]}`);
    }

    toggleModeDropdown() {
        const dropdown = document.getElementById('modeDropdown');
        dropdown.classList.toggle('show');
    }

    showSettingsPrompt() {
        const modal = document.getElementById('settingsModal');
        const modelSelect = document.getElementById('model');
        
        if (modal) {
            modal.classList.add('show');
        }
        
        if (modelSelect) {
            modelSelect.value = this.model;
        }
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

    handleLike(button) {
        button.classList.toggle('active');
        if (button.classList.contains('active')) {
            button.style.color = '#4ade80';
            const dislikeBtn = button.nextElementSibling;
            if (dislikeBtn && dislikeBtn.title === 'Dislike') {
                dislikeBtn.classList.remove('active');
                dislikeBtn.style.color = '';
            }
        } else {
            button.style.color = '';
        }
    }

    handleDislike(button) {
        button.classList.toggle('active');
        if (button.classList.contains('active')) {
            button.style.color = '#ef4444';
            const likeBtn = button.previousElementSibling;
            if (likeBtn && likeBtn.title === 'Like') {
                likeBtn.classList.remove('active');
                likeBtn.style.color = '';
            }
        } else {
            button.style.color = '';
        }
    }

    copyMessage(button) {
        const messageText = button.closest('.assistant-content').querySelector('.message-text').innerText;
        navigator.clipboard.writeText(messageText).then(() => {
            this.showNotification('Message copied!');
        });
    }

    deleteMessage(index) {
        if (confirm('Delete this message?')) {
            this.currentConversation.messages.splice(index, 1);
            this.saveConversations();
            this.renderMessages();
        }
    }

    regenerateResponse() {
        const messages = this.currentConversation.messages;
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'assistant') {
            messages.pop(); // Remove assistant message
            this.saveConversations();
            this.renderMessages();
            
            // Find last user message
            const lastUserMessage = messages[messages.length - 1];
            if (lastUserMessage && lastUserMessage.role === 'user') {
                this.getAIResponse(lastUserMessage.content);
            }
        }
    }

    editMessage(index) {
        const messageRow = document.querySelectorAll('.message-row')[index];
        const isUser = this.currentConversation.messages[index].role === 'user';
        const contentDiv = isUser ? messageRow.querySelector('.user-content') : messageRow.querySelector('.assistant-content');
        
        const originalText = this.currentConversation.messages[index].content;
        
        const container = document.createElement('div');
        container.style.width = '100%';
        
        const textarea = document.createElement('textarea');
        textarea.value = originalText;
        textarea.style.width = '100%';
        textarea.style.minHeight = '100px';
        textarea.style.background = '#1e2026';
        textarea.style.color = '#e5e7eb';
        textarea.style.border = '1px solid #3f3f46';
        textarea.style.borderRadius = '0.5rem';
        textarea.style.padding = '0.5rem';
        textarea.style.marginBottom = '0.5rem';
        textarea.style.resize = 'vertical';
        textarea.style.fontFamily = 'inherit';
        
        const actionsDiv = document.createElement('div');
        actionsDiv.style.display = 'flex';
        actionsDiv.style.gap = '0.5rem';
        actionsDiv.style.justifyContent = 'flex-end';
        
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.className = 'action-btn';
        saveBtn.style.background = '#d97706';
        saveBtn.style.color = 'white';
        saveBtn.style.width = 'auto';
        saveBtn.style.padding = '0.25rem 0.75rem';
        saveBtn.onclick = () => {
            this.currentConversation.messages[index].content = textarea.value;
            this.saveConversations();
            this.renderMessages();
        };
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'action-btn';
        cancelBtn.style.width = 'auto';
        cancelBtn.style.padding = '0.25rem 0.75rem';
        cancelBtn.onclick = () => {
            this.renderMessages();
        };
        
        actionsDiv.appendChild(cancelBtn);
        actionsDiv.appendChild(saveBtn);
        container.appendChild(textarea);
        container.appendChild(actionsDiv);
        
        contentDiv.innerHTML = '';
        contentDiv.appendChild(container);
        textarea.focus();
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
    chatApp.showSettingsPrompt();
}

function closeSettings() {
    chatApp.closeSettings();
}

function saveSettings() {
    chatApp.saveSettings();
}

function toggleModeDropdown() {
    chatApp.toggleModeDropdown();
}

function setMode(mode) {
    chatApp.setMode(mode);
}



function deleteChat(index) {
    chatApp.deleteChat(index);
}

function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalHtml = button.innerHTML;
        button.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Copied!
        `;
        button.style.color = '#4ade80'; // Green color for success
        
        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
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
