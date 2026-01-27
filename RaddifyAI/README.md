# RaddifyAI - Claude-style AI Chat Interface

A modern, dark-themed chat interface inspired by Claude's design, powered by the Groq API to provide ChatGPT-like functionality with a sleek, professional appearance.

## ✨ Features

- **Claude-inspired Dark UI** - Clean, minimalist design with orange accent colors
- **Multiple AI Models** - Support for various Groq models (Llama 3, Mixtral, Gemma)
- **Chat History** - Persistent conversation history stored locally
- **Suggestion Chips** - Quick-start prompts for common queries
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Typing Indicators** - Shows when the AI is thinking
- **Settings Management** - Easy API key and model configuration
- **Message Formatting** - Support for basic markdown formatting
- **Professional Layout** - Sidebar navigation with chat history

## 🎨 Design Highlights

- **Dark Theme**: Easy on the eyes with carefully chosen dark colors
- **Orange Accents**: Vibrant orange (#d97706) for interactive elements
- **Clean Typography**: Inter font for optimal readability
- **Smooth Animations**: Subtle transitions and hover effects
- **Claude-style Layout**: Familiar sidebar and message interface

## 🚀 Setup

1. **Get a Groq API Key**:
   - Visit [Groq Console](https://console.groq.com)
   - Sign up or log in
   - Generate an API key

2. **Configure the Application**:
   - Open `RaddifyAI/index.html` in your browser
   - Click the settings button (⚙️) in the bottom-right corner
   - Enter your Groq API key
   - Select your preferred model
   - Click "Save Settings"

3. **Start Chatting**:
   - Click on suggestion chips or type your own message
   - Press Enter or click the send button
   - Enjoy your conversation!

## 🤖 Available Models

- **Llama 3 8B** (`llama3-8b-8192`) - Fast and efficient
- **Llama 3 70B** (`llama3-70b-8192`) - More capable, larger model
- **Mixtral 8x7B** (`mixtral-8x7b-32768`) - Excellent for complex tasks
- **Gemma 7B** (`gemma-7b-it`) - Google's lightweight model

## 📁 File Structure

```
RaddifyAI/
├── index.html      # Main HTML structure with Claude-style layout
├── styles.css      # Complete dark theme styling and animations
├── script.js       # Application logic and Groq API integration
└── README.md       # This documentation
```

## 🔧 Technical Details

### API Integration

The application uses the Groq OpenAI-compatible API endpoint:
```
https://api.groq.com/openai/v1/chat/completions
```

### Design System

- **Primary Colors**: 
  - Background: `#1a1a1a`
  - Surface: `#2d2d2d`
  - Sidebar: `#252525`
  - Accent: `#d97706` (orange)
- **Typography**: Inter font family
- **Spacing**: Consistent 0.75rem/1rem spacing system
- **Border Radius**: 0.375rem for buttons, 0.5rem for inputs

### Data Storage

- **API Keys**: Stored in localStorage (client-side only)
- **Chat History**: Saved in localStorage as JSON
- **Settings**: Model preferences and configuration

### Key Features

- **Conversation Management**: Multiple conversations with automatic title generation
- **Message Formatting**: Basic markdown support (bold, italic, code)
- **Error Handling**: Graceful handling of API errors and rate limits
- **Responsive Design**: Mobile-friendly with adaptive layouts
- **Suggestion System**: Pre-defined prompts for quick engagement

## 📱 Browser Compatibility

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🔒 Security Notes

- API keys are stored locally in the browser
- No server-side storage or processing
- All API calls are made directly from the browser
- Consider using environment variables for production deployments

## 🎯 Customization

### Changing the Theme

Edit the CSS variables in `styles.css`:

```css
body {
    background: #1a1a1a; /* Main background */
}

.new-chat-btn {
    background: #d97706; /* Accent color */
}
```

### Adding New Models

Update the model selection in `index.html` and add the corresponding model ID to the options.

### Customizing the AI Persona

Modify the system prompt in `script.js`:

```javascript
messages: [
    { role: 'system', content: 'You are a helpful AI assistant. Be concise and accurate in your responses.' },
    // ...
]
```

### Customizing Suggestions

Edit the suggestion chips in `index.html`:

```html
<div class="suggestion-chips">
    <button class="chip" onclick="setSuggestion('Your custom suggestion')">Your custom suggestion</button>
</div>
```

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid API key" error**:
   - Check that your API key is correct
   - Ensure you have sufficient credits in your Groq account

2. **"Rate limit exceeded" error**:
   - Wait a few moments and try again
   - Consider upgrading your Groq plan for higher limits

3. **Messages not saving**:
   - Check that localStorage is enabled in your browser
   - Clear browser cache and try again

4. **Styling issues**:
   - Ensure you're using a modern browser
   - Check that CSS loads properly

### Debug Mode

Open the browser developer console to see:
- API request/response logs
- Error messages
- Application state information

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy your Claude-style AI chat experience! 🤖**
