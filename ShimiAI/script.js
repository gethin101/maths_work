class TestMaker {
    constructor() {
        this.currentTest = null;
        this.currentPage = 1;
        this.totalPages = 1; // Changed to 1 page for 5 questions
        this.userAnswers = {};
        this.apiKey = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadApiKey();
    }

    initializeElements() {
        this.subjectInput = document.getElementById('subjectInput');
        this.gradeInput = document.getElementById('gradeInput');
        this.pageCountSelect = document.getElementById('pageCountSelect');
        this.generateBtn = document.getElementById('generateBtn');
        this.checkBtn = document.getElementById('checkBtn');
        this.setupScreen = document.getElementById('setupScreen');
        this.testScreen = document.getElementById('testScreen');
        this.resultsScreen = document.getElementById('resultsScreen');
        this.questionsContainer = document.getElementById('questionsContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.currentPageSpan = document.getElementById('currentPage');
        this.totalPagesSpan = document.getElementById('totalPages');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.submitBtn = document.getElementById('submitBtn');
        this.newTestBtn = document.getElementById('newTestBtn');
        this.exportPdfBtn = document.getElementById('exportPdfBtn');
        this.markSchemeFile = document.getElementById('markSchemeFile');
        this.loadMarkSchemeBtn = document.getElementById('loadMarkSchemeBtn');
        this.exportMarkSchemeBtn = document.getElementById('exportMarkSchemeBtn');
        this.testFile = document.getElementById('testFile');
        this.saveTestBtn = document.getElementById('saveTestBtn');
        this.loadTestBtn = document.getElementById('loadTestBtn');
        this.editQuestionsBtn = document.getElementById('editQuestionsBtn');
        this.editMarksBtn = document.getElementById('editMarksBtn');
        this.editQuestionsModal = document.getElementById('editQuestionsModal');
        this.editMarksModal = document.getElementById('editMarksModal');
        this.editQuestionsContainer = document.getElementById('editQuestionsContainer');
        this.editMarksContainer = document.getElementById('editMarksContainer');
        this.totalMarksSpan = document.getElementById('totalMarks');
        this.drawingModal = document.getElementById('drawingModal');
        this.drawingCanvas = document.getElementById('drawingCanvas');
        this.colorPicker = document.getElementById('colorPicker');
        this.sizePicker = document.getElementById('sizePicker');
        this.sizeValue = document.getElementById('sizeValue');
        this.textInput = document.getElementById('textInput');
        this.aiHelperModal = document.getElementById('aiHelperModal');
        this.aiHelperContent = document.getElementById('aiHelperContent');
        this.getHintBtn = document.getElementById('getHintBtn');
        this.nextStepBtn = document.getElementById('nextStepBtn');
        this.resetHintBtn = document.getElementById('resetHintBtn');
        this.currentAIQuestion = null;
        this.currentHintStep = 0;
        this.allHintSteps = [];
        this.aiAssistant = document.getElementById('aiAssistant');
        this.aiAssistantHeader = document.getElementById('aiAssistantHeader');
        this.aiAssistantBody = document.getElementById('aiAssistantBody');
        this.aiAssistantChat = document.getElementById('aiAssistantChat');
        this.aiInput = document.getElementById('aiInput');
        this.aiSendBtn = document.getElementById('aiSendBtn');
        this.aiAssistantMinimize = document.getElementById('aiAssistantMinimize');
        this.currentAIQuestion = null;
        this.drawingContext = null;
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.startX = 0;
        this.startY = 0;
        this.drawingHistory = [];
        this.currentPath = [];
        this.instructionTotalMarksSpan = document.getElementById('instructionTotalMarks');
        this.examHeader = document.getElementById('examHeader');
        this.instructions = document.getElementById('instructions');
        this.markScheme = null;
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateTest());
        this.checkBtn.addEventListener('click', () => this.checkAnswers());
        this.prevPageBtn.addEventListener('click', () => this.navigatePage(-1));
        this.nextPageBtn.addEventListener('click', () => this.navigatePage(1));
        this.submitBtn.addEventListener('click', () => this.submitTest());
        this.newTestBtn.addEventListener('click', () => this.resetToSetup());
        this.exportPdfBtn.addEventListener('click', () => this.exportToPdf());
        this.loadMarkSchemeBtn.addEventListener('click', () => this.loadMarkScheme());
        this.exportMarkSchemeBtn.addEventListener('click', () => this.exportMarkScheme());
        this.markSchemeFile.addEventListener('change', (e) => this.handleMarkSchemeFile(e));
        this.saveTestBtn.addEventListener('click', () => this.saveTest());
        this.loadTestBtn.addEventListener('click', () => this.loadTest());
        this.testFile.addEventListener('change', (e) => this.handleTestFile(e));
        this.editQuestionsBtn.addEventListener('click', () => this.openEditQuestionsModal());
        this.editMarksBtn.addEventListener('click', () => this.openEditMarksModal());
        document.getElementById('closeEditQuestionsModal').addEventListener('click', () => this.closeEditQuestionsModal());
        document.getElementById('closeEditMarksModal').addEventListener('click', () => this.closeEditMarksModal());
        document.getElementById('saveQuestionsBtn').addEventListener('click', () => this.saveQuestions());
        document.getElementById('saveMarksBtn').addEventListener('click', () => this.saveMarks());
        document.getElementById('cancelQuestionsBtn').addEventListener('click', () => this.closeEditQuestionsModal());
        document.getElementById('cancelMarksBtn').addEventListener('click', () => this.closeEditMarksModal());
        document.getElementById('closeDrawingModal').addEventListener('click', () => this.closeDrawingModal());
        document.getElementById('clearCanvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('undoDrawing').addEventListener('click', () => this.undoDrawing());
        document.getElementById('saveDrawing').addEventListener('click', () => this.saveDrawing());
        document.getElementById('cancelDrawing').addEventListener('click', () => this.closeDrawingModal());
        document.getElementById('closeAIHelperModal').addEventListener('click', () => this.closeAIHelperModal());
        document.getElementById('getHintBtn').addEventListener('click', () => this.getHint());
        document.getElementById('nextStepBtn').addEventListener('click', () => this.getNextHintStep());
        document.getElementById('resetHintBtn').addEventListener('click', () => this.resetHint());
        document.getElementById('saveHintBtn').addEventListener('click', () => this.saveHint());
        document.getElementById('cancelHintBtn').addEventListener('click', () => this.closeAIHelperModal());
        this.sizePicker.addEventListener('input', () => this.updateSizeDisplay());
        
        // AI Assistant events
        this.aiAssistantHeader.addEventListener('click', () => this.toggleAssistant());
        this.aiAssistantMinimize.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleAssistant();
        });
        this.aiSendBtn.addEventListener('click', () => this.sendAIMessage());
        this.aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendAIMessage();
            }
        });
        
        // Drawing tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectTool(e.target.dataset.tool));
        });
        
        // Canvas events
        this.drawingCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.drawingCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.drawingCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.drawingCanvas.addEventListener('mouseout', () => this.stopDrawing());
        
        this.subjectInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateTest();
            }
        });
    }

    async loadApiKey() {
        // Set the provided Groq API key
        this.apiKey = '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';
        
        // Store it for future use
        localStorage.setItem('groq_api_key', this.apiKey);
    }

    async generateTest() {
        const subject = this.subjectInput.value.trim();
        const grade = this.gradeInput.value.trim();
        const pageCount = parseInt(this.pageCountSelect.value);
        
        if (!subject) {
            alert('Please enter a subject');
            return;
        }

        if (!grade) {
            alert('Please enter a grade level');
            return;
        }

        if (!this.apiKey) {
            alert('Please set your Groq API key');
            this.loadApiKey();
            return;
        }

        this.showLoading(true);
        
        try {
            const testQuestions = await this.generateQuestionsFromAI(subject, grade, pageCount);
            this.currentTest = this.parseTestQuestions(testQuestions, subject, grade);
            this.totalPages = pageCount;
            this.createMarkScheme();
            this.displayTest();
        } catch (error) {
            console.error('Error generating test:', error);
            alert('Failed to generate test. Please check your API key and try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async generateQuestionsFromAI(subject, grade, pageCount) {
        // First, let's try to get available models
        try {
            const modelsResponse = await fetch('https://api.groq.com/openai/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                }
            });
            
            if (modelsResponse.ok) {
                const modelsData = await modelsResponse.json();
                console.log('Available models:', modelsData.data.map(m => m.id));
            }
        } catch (error) {
            console.log('Could not fetch models:', error);
        }
        
        const questionsPerPage = 5;
        const totalQuestions = pageCount * questionsPerPage;
        
        const prompt = `You must create a test for ${subject} at ${grade} level with exactly ${totalQuestions} questions. The questions MUST progress from easy to hard.

CRITICAL: You MUST format EXACTLY as shown below. Do not include any introduction or explanation - start directly with Q1:

Q1: [EASY question text]
Type: multiple_choice
Marks: 1
Options: A) Option 1, B) Option 2, C) Option 3, D) Option 4
Answer: A
Marking: Award 1 mark for correct option A only. No marks for incorrect options.

Q2: [EASY question text]
Type: short_answer
Marks: 2
Answer: [correct answer]
Marking: Award 2 marks for correct answer. Accept equivalent forms or reasonable alternatives. Award 1 mark for partially correct answer.

Q3: [MODERATE question text]
Type: true_false
Marks: 2
Answer: True
Marking: Award 2 marks for correct response. No marks for incorrect response.

Q4: [MODERATE question text]
Type: problem_solving
Marks: 3
Answer: [correct answer]
Marking: Award 3 marks for correct final answer with working shown. Award 2 marks for correct answer with incomplete working. Award 1 mark for correct method but incorrect final answer.

Q5: [HARD question text]
Type: essay
Marks: 4
Answer: [key points and expected content]
Marking: Award 4 marks for comprehensive answer covering all key points. Award 3 marks for good answer covering most points. Award 2 marks for basic answer with some key points. Award 1 mark for minimal relevant content.

Continue this exact pattern for all ${totalQuestions} questions. Questions 1-${Math.floor(totalQuestions * 0.2)} should be easy, ${Math.floor(totalQuestions * 0.2) + 1}-${Math.floor(totalQuestions * 0.5)} moderate, ${Math.floor(totalQuestions * 0.5) + 1}-${Math.floor(totalQuestions * 0.8)} hard, and ${Math.floor(totalQuestions * 0.8) + 1}-${totalQuestions} very hard.

DO NOT write "Here's a test" or any introduction. Start immediately with Q1: and continue through Q${totalQuestions}:.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a test generator. Follow the format EXACTLY. Start with Q1: and continue through all questions. No introductions, no explanations, no "Here is a test". Only the formatted questions.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: Math.min(3000, 300 + totalQuestions * 80)
            })
        });

        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', response.headers);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`API request failed: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    parseTestQuestions(testText, subject, grade) {
        const questions = [];
        const questionBlocks = testText.split(/Q\d+:/).filter(block => block.trim());
        
        questionBlocks.forEach((block, index) => {
            const lines = block.trim().split('\n');
            const questionText = lines[0]?.trim() || '';
            
            const typeMatch = block.match(/Type:\s*(\w+)/);
            const marksMatch = block.match(/Marks:\s*(\d+)/);
            const optionsMatch = block.match(/Options:\s*(.+)/);
            const answerMatch = block.match(/Answer:\s*(.+)/);
            const markingMatch = block.match(/Marking:\s*(.+)/);
            
            questions.push({
                id: index + 1,
                text: questionText,
                type: typeMatch ? typeMatch[1] : 'short_answer',
                marks: marksMatch ? parseInt(marksMatch[1]) : 1,
                options: optionsMatch ? optionsMatch[1].split(',').map(opt => opt.trim()) : [],
                correctAnswer: answerMatch ? answerMatch[1].trim() : '',
                marking: markingMatch ? markingMatch[1].trim() : ''
            });
        });

        return {
            title: `${subject} Test - ${grade}`,
            questions: questions,
            subject: subject,
            grade: grade
        };
    }

    displayTest() {
        this.setupScreen.style.display = 'none';
        this.resultsScreen.style.display = 'none';
        this.testScreen.style.display = 'block';
        
        document.getElementById('testTitle').textContent = this.currentTest.title.toUpperCase();
        this.totalPagesSpan.textContent = this.totalPages;
        
        // Calculate and display total marks
        const totalMarks = this.currentTest.questions.reduce((sum, question) => sum + question.marks, 0);
        this.totalMarksSpan.textContent = totalMarks;
        this.instructionTotalMarksSpan.textContent = totalMarks;
        
        this.userAnswers = {};
        this.currentPage = 1;
        this.displayCurrentPage();
    }

    displayCurrentPage() {
        const startIndex = (this.currentPage - 1) * 5;
        const endIndex = Math.min(startIndex + 5, this.currentTest.questions.length);
        const pageQuestions = this.currentTest.questions.slice(startIndex, endIndex);
        
        this.currentPageSpan.textContent = this.currentPage;
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage >= Math.ceil(this.currentTest.questions.length / 5);
        
        // Show/hide header and instructions based on page
        if (this.currentPage === 1) {
            this.examHeader.style.display = 'block';
            this.instructions.style.display = 'block';
        } else {
            this.examHeader.style.display = 'none';
            this.instructions.style.display = 'none';
        }
        
        this.questionsContainer.innerHTML = '';
        
        pageQuestions.forEach(question => {
            const questionDiv = this.createQuestionElement(question);
            this.questionsContainer.appendChild(questionDiv);
        });
        
        // Auto-resize all textareas after rendering
        setTimeout(() => {
            const textareas = this.questionsContainer.querySelectorAll('textarea');
            textareas.forEach(textarea => {
                this.autoResizeTextarea(textarea);
            });
        }, 100);
    }

    createQuestionElement(question) {
        const div = document.createElement('div');
        div.className = 'question';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'question-header';
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'question-number';
        numberSpan.textContent = `Question ${question.id}`;
        
        const marksSpan = document.createElement('span');
        marksSpan.className = 'question-marks';
        marksSpan.textContent = `${question.marks} mark${question.marks > 1 ? 's' : ''}`;
        
        headerDiv.appendChild(numberSpan);
        headerDiv.appendChild(marksSpan);
        
        const textDiv = document.createElement('div');
        textDiv.className = 'question-text';
        textDiv.textContent = question.text;
        
        div.appendChild(headerDiv);
        div.appendChild(textDiv);
        
        if (question.type === 'multiple_choice') {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options-container';
            
            question.options.forEach((option, index) => {
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.marginBottom = '8px';
                
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `question_${question.id}`;
                input.value = option;
                input.addEventListener('change', () => {
                    this.userAnswers[question.id] = option;
                });
                
                label.appendChild(input);
                label.appendChild(document.createTextNode(` ${option}`));
                optionsDiv.appendChild(label);
            });
            
            div.appendChild(optionsDiv);
        } else if (question.type === 'true_false') {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options-container';
            
            ['True', 'False'].forEach(option => {
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.marginBottom = '8px';
                
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `question_${question.id}`;
                input.value = option;
                input.addEventListener('change', () => {
                    this.userAnswers[question.id] = option;
                });
                
                label.appendChild(input);
                label.appendChild(document.createTextNode(` ${option}`));
                optionsDiv.appendChild(label);
            });
            
            div.appendChild(optionsDiv);
        } else {
            const answerDiv = document.createElement('div');
            answerDiv.className = 'answer-input';
            
            const label = document.createElement('label');
            label.textContent = 'Answer:';
            
            const input = document.createElement('textarea');
            input.value = this.userAnswers[question.id] || '';
            input.addEventListener('input', () => {
                this.userAnswers[question.id] = input.value;
                this.autoResizeTextarea(input);
            });
            
            // Auto-resize on load
            setTimeout(() => this.autoResizeTextarea(input), 100);
            
            // Add drawing button
            const drawingBtn = document.createElement('button');
            drawingBtn.textContent = '🎨 Add Drawing';
            drawingBtn.className = 'drawing-btn';
            drawingBtn.style.marginTop = '10px';
            drawingBtn.style.padding = '5px 10px';
            drawingBtn.style.border = '1px solid #000';
            drawingBtn.style.background = 'white';
            drawingBtn.style.cursor = 'pointer';
            drawingBtn.addEventListener('click', () => this.openDrawingModal(question.id));
            
            // Add drawing display if exists
            const drawingDisplay = document.createElement('div');
            drawingDisplay.className = 'drawing-display';
            drawingDisplay.id = `drawing-${question.id}`;
            
            if (this.userAnswers[`drawing_${question.id}`]) {
                const img = document.createElement('img');
                img.src = this.userAnswers[`drawing_${question.id}`];
                img.className = 'drawing-image';
                img.addEventListener('click', () => this.openDrawingModal(question.id));
                drawingDisplay.appendChild(img);
            }
            
            answerDiv.appendChild(label);
            answerDiv.appendChild(input);
            answerDiv.appendChild(drawingBtn);
            answerDiv.appendChild(drawingDisplay);
            div.appendChild(answerDiv);
        }
        
        return div;
    }

    autoResizeTextarea(textarea) {
        // Reset height to auto to get the scroll height
        textarea.style.height = 'auto';
        
        // Calculate the number of lines
        const lines = textarea.value.split('\n').length;
        const lineHeight = 28; // Match the CSS line-height
        const padding = 28; // Top and bottom padding (14px each)
        const minHeight = 120; // Minimum height
        
        // Calculate new height - make it 2x larger
        const newHeight = Math.max(minHeight, ((lines * lineHeight) + padding) * 2);
        
        // Set the new height
        textarea.style.height = newHeight + 'px';
    }

    navigatePage(direction) {
        const newPage = this.currentPage + direction;
        const maxPage = Math.ceil(this.currentTest.questions.length / 5);
        if (newPage >= 1 && newPage <= maxPage) {
            this.currentPage = newPage;
            this.displayCurrentPage();
        }
    }

    submitTest() {
        if (Object.keys(this.userAnswers).length === 0) {
            alert('Please answer at least one question before submitting.');
            return;
        }
        
        if (confirm('Are you sure you want to submit your test? You cannot change your answers after submission.')) {
            this.checkAnswers();
        }
    }

    checkAnswers() {
        if (!this.currentTest) return;
        
        let totalScore = 0;
        let maxScore = 0;
        const results = [];
        
        this.currentTest.questions.forEach(question => {
            maxScore += question.marks;
            const userAnswer = this.userAnswers[question.id];
            const isCorrect = this.evaluateAnswer(question, userAnswer);
            
            if (isCorrect) {
                totalScore += question.marks;
            }
            
            results.push({
                question: question,
                userAnswer: userAnswer || 'Not answered',
                isCorrect: isCorrect,
                marks: isCorrect ? question.marks : 0
            });
        });
        
        this.displayResults(totalScore, maxScore, results);
    }

    evaluateAnswer(question, userAnswer) {
        if (!userAnswer) return false;
        
        const userAnswerNormalized = userAnswer.toString().toLowerCase().trim();
        const correctAnswerNormalized = question.correctAnswer.toLowerCase().trim();
        
        if (question.type === 'multiple_choice' || question.type === 'true_false') {
            // For multiple choice, check if the user's answer matches the correct answer
            // The correct answer should be just the option letter (A, B, C, D) or the full text
            return userAnswerNormalized === correctAnswerNormalized ||
                   userAnswerNormalized.includes(correctAnswerNormalized) ||
                   correctAnswerNormalized.includes(userAnswerNormalized);
        } else {
            // For text answers, be more flexible
            return userAnswerNormalized.includes(correctAnswerNormalized) || 
                   correctAnswerNormalized.includes(userAnswerNormalized);
        }
    }

    displayResults(totalScore, maxScore, results) {
        this.testScreen.style.display = 'none';
        this.resultsScreen.style.display = 'block';
        
        const percentage = Math.round((totalScore / maxScore) * 100);
        
        document.getElementById('totalScore').textContent = totalScore;
        document.getElementById('maxScore').textContent = maxScore;
        document.getElementById('percentage').textContent = percentage;
        
        const resultsDetails = document.getElementById('resultsDetails');
        resultsDetails.innerHTML = '';
        
        results.forEach(result => {
            const resultDiv = document.createElement('div');
            resultDiv.className = `result-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
            
            const questionDiv = document.createElement('div');
            questionDiv.className = 'result-question';
            questionDiv.textContent = `Q${result.question.id}: ${result.question.text}`;
            
            const answerDiv = document.createElement('div');
            answerDiv.className = 'result-answer';
            answerDiv.textContent = `Your answer: ${result.userAnswer}`;
            
            const correctDiv = document.createElement('div');
            correctDiv.className = result.isCorrect ? 'result-correct' : 'result-incorrect';
            correctDiv.textContent = `Correct answer: ${result.question.correctAnswer}`;
            
            const marksDiv = document.createElement('div');
            marksDiv.textContent = `Marks: ${result.marks}/${result.question.marks}`;
            
            resultDiv.appendChild(questionDiv);
            resultDiv.appendChild(answerDiv);
            resultDiv.appendChild(correctDiv);
            resultDiv.appendChild(marksDiv);
            
            resultsDetails.appendChild(resultDiv);
        });
    }

    resetToSetup() {
        this.resultsScreen.style.display = 'none';
        this.setupScreen.style.display = 'block';
        this.currentTest = null;
        this.userAnswers = {};
        this.currentPage = 1;
        this.totalPages = 5; // Reset to default
        this.subjectInput.value = '';
        this.gradeInput.value = '';
        this.pageCountSelect.value = '5';
    }

    createMarkScheme() {
        if (!this.currentTest) return;
        
        this.markScheme = {
            title: this.currentTest.title + " - Mark Scheme",
            subject: this.currentTest.subject,
            grade: this.currentTest.grade,
            totalMarks: this.currentTest.questions.reduce((sum, q) => sum + q.marks, 0),
            questions: this.currentTest.questions.map(question => ({
                id: question.id,
                text: question.text,
                type: question.type,
                marks: question.marks,
                correctAnswer: question.correctAnswer,
                options: question.options,
                marking: question.marking || this.generateMarkingNotes(question)
            })),
            generatedAt: new Date().toISOString()
        };
        
        this.exportMarkSchemeBtn.style.display = 'inline-block';
        this.saveTestBtn.style.display = 'inline-block';
    }
    
    generateMarkingNotes(question) {
        const notes = [];
        
        switch (question.type) {
            case 'multiple_choice':
                notes.push('Award full marks for correct option only');
                notes.push('No marks for incorrect options');
                break;
            case 'short_answer':
                notes.push('Award full marks for correct answer');
                notes.push('Accept equivalent forms');
                break;
            case 'true_false':
                notes.push('Award full marks for correct response');
                notes.push('No marks for incorrect response');
                break;
            case 'problem_solving':
                notes.push('Award marks for correct final answer');
                notes.push('Consider awarding method marks if working shown');
                break;
            case 'essay':
                notes.push('Award marks based on quality of response');
                notes.push('Consider clarity, accuracy, and depth');
                break;
        }
        
        return notes;
    }
    
    loadMarkScheme() {
        this.markSchemeFile.click();
    }
    
    handleMarkSchemeFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.markScheme = data;
                this.exportMarkSchemeBtn.style.display = 'inline-block';
                alert('Mark scheme loaded successfully!');
            } catch (error) {
                alert('Error loading mark scheme. Please ensure it\'s a valid JSON file.');
            }
        };
        reader.readAsText(file);
    }
    
    exportMarkScheme() {
        if (!this.markScheme) {
            alert('No mark scheme available. Please generate a test first.');
            return;
        }
        
        // Create mark scheme HTML
        const markSchemeHtml = this.createMarkSchemeHtml();
        
        // Store original content
        const originalContent = this.testScreen.innerHTML;
        
        // Replace with mark scheme content
        this.testScreen.innerHTML = markSchemeHtml;
        
        // Open print dialog
        window.print();
        
        // Restore original content
        this.testScreen.innerHTML = originalContent;
    }
    
    createMarkSchemeHtml() {
        const questionsHtml = this.markScheme.questions.map(question => `
            <div class="question">
                <div class="question-header">
                    <span class="question-number">Question ${question.id}</span>
                    <span class="question-marks">${question.marks} mark${question.marks > 1 ? 's' : ''}</span>
                </div>
                <div class="question-text">${question.text}</div>
                <div class="mark-scheme-answer">
                    <strong>Answer:</strong> ${question.correctAnswer}
                </div>
                ${question.options ? `
                    <div class="mark-scheme-options">
                        <strong>Options:</strong><br>
                        ${question.options.join('<br>')}
                    </div>
                ` : ''}
                <div class="marking-notes">
                    <strong>Marking:</strong><br>
                    ${question.marking}
                </div>
            </div>
        `).join('');
        
        return `
            <div class="screen">
                <div class="exam-header">
                    <div class="exam-title">${this.markScheme.title.toUpperCase()}</div>
                    <div class="exam-details">
                        <div>Subject: <strong>${this.markScheme.subject}</strong></div>
                        <div>Grade Level: <strong>${this.markScheme.grade}</strong></div>
                        <div>Total Marks: <strong>${this.markScheme.totalMarks}</strong></div>
                    </div>
                </div>
                <div class="test-content">
                    ${questionsHtml}
                </div>
                <div class="page-watermark"></div>
            </div>
        `;
    }

    saveTest() {
        if (!this.currentTest) {
            alert('No test available. Please generate a test first.');
            return;
        }
        
        const testData = {
            test: this.currentTest,
            markScheme: this.markScheme,
            userAnswers: this.userAnswers,
            totalPages: this.totalPages,
            savedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(testData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${this.currentTest.subject}_${this.currentTest.grade}_test.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }
    
    loadTest() {
        this.testFile.click();
    }
    
    handleTestFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.test) {
                    this.currentTest = data.test;
                    this.markScheme = data.markScheme || null;
                    this.userAnswers = data.userAnswers || {};
                    this.totalPages = data.totalPages || 5;
                    
                    // Update UI
                    this.subjectInput.value = this.currentTest.subject;
                    this.gradeInput.value = this.currentTest.grade;
                    this.pageCountSelect.value = this.totalPages;
                    
                    // Show buttons
                    this.exportMarkSchemeBtn.style.display = this.markScheme ? 'inline-block' : 'none';
                    this.saveTestBtn.style.display = 'inline-block';
                    
                    // Display the test
                    this.displayTest();
                    
                    alert('Test loaded successfully!');
                } else {
                    alert('Invalid test file format.');
                }
            } catch (error) {
                alert('Error loading test. Please ensure it\'s a valid JSON file.');
            }
        };
        reader.readAsText(file);
    }

    exportToPdf() {
        // Store current page
        const originalPage = this.currentPage;
        
        // Clone all questions for printing
        const allQuestionsHtml = this.currentTest.questions.map((question, index) => {
            const questionDiv = this.createQuestionElement(question);
            return questionDiv.outerHTML;
        }).join('');
        
        // Create complete test HTML
        const testHtml = `
            <div class="screen">
                ${this.examHeader.outerHTML}
                ${this.instructions.outerHTML}
                <div class="test-content">
                    ${allQuestionsHtml}
                </div>
                <div class="page-watermark"></div>
            </div>
        `;
        
        // Store original content
        const originalContent = this.testScreen.innerHTML;
        
        // Replace with printable content
        this.testScreen.innerHTML = testHtml;
        
        // Hide drawing buttons for printing
        const drawingButtons = this.testScreen.querySelectorAll('.drawing-btn');
        drawingButtons.forEach(btn => btn.style.display = 'none');
        
        // Show all elements for printing
        const allElements = this.testScreen.querySelectorAll('.question, .question-header, .question-text, .options-container, .answer-input, .drawing-image');
        allElements.forEach(el => el.style.display = 'block');
        
        // Trigger print dialog after a short delay
        setTimeout(() => {
            window.print();
            
            // Restore original content after print dialog closes
            setTimeout(() => {
                this.testScreen.innerHTML = originalContent;
                this.displayCurrentPage();
            }, 100);
        }, 100);
    }
    openEditQuestionsModal() {
        if (!this.currentTest) return;
        
        this.editQuestionsContainer.innerHTML = '';
        
        this.currentTest.questions.forEach(question => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'edit-question-item';
            
            questionDiv.innerHTML = `
                <h4>Question ${question.id} (${question.type})</h4>
                <textarea id="question-text-${question.id}" placeholder="Question text">${question.text}</textarea>
                ${question.type === 'multiple_choice' ? `
                    <div>
                        <label>Options (one per line):</label>
                        <textarea id="question-options-${question.id}" placeholder="A) Option 1&#10;B) Option 2&#10;C) Option 3&#10;D) Option 4">${question.options.join('\n')}</textarea>
                    </div>
                ` : ''}
                <div>
                    <label>Correct Answer:</label>
                    <input type="text" id="question-answer-${question.id}" value="${question.correctAnswer}" placeholder="Correct answer">
                </div>
            `;
            
            this.editQuestionsContainer.appendChild(questionDiv);
        });
        
        this.editQuestionsModal.style.display = 'flex';
    }
    
    openEditMarksModal() {
        if (!this.currentTest) return;
        
        this.editMarksContainer.innerHTML = '';
        
        this.currentTest.questions.forEach(question => {
            const markDiv = document.createElement('div');
            markDiv.className = 'edit-mark-item';
            
            markDiv.innerHTML = `
                <h4>Question ${question.id}</h4>
                <div class="marks-input">
                    <label>Marks:</label>
                    <input type="number" id="question-marks-${question.id}" value="${question.marks}" min="1" max="10">
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    ${question.text.substring(0, 100)}${question.text.length > 100 ? '...' : ''}
                </div>
            `;
            
            this.editMarksContainer.appendChild(markDiv);
        });
        
        this.editMarksModal.style.display = 'flex';
    }
    
    closeEditQuestionsModal() {
        this.editQuestionsModal.style.display = 'none';
    }
    
    closeEditMarksModal() {
        this.editMarksModal.style.display = 'none';
    }
    
    saveQuestions() {
        if (!this.currentTest) return;
        
        this.currentTest.questions.forEach(question => {
            const textElement = document.getElementById(`question-text-${question.id}`);
            const answerElement = document.getElementById(`question-answer-${question.id}`);
            
            if (textElement) question.text = textElement.value;
            if (answerElement) question.correctAnswer = answerElement.value;
            
            if (question.type === 'multiple_choice') {
                const optionsElement = document.getElementById(`question-options-${question.id}`);
                if (optionsElement) {
                    question.options = optionsElement.value.split('\n').filter(opt => opt.trim());
                }
            }
        });
        
        this.closeEditQuestionsModal();
        this.displayTest();
        alert('Questions updated successfully!');
    }
    
    saveMarks() {
        if (!this.currentTest) return;
        
        this.currentTest.questions.forEach(question => {
            const marksElement = document.getElementById(`question-marks-${question.id}`);
            if (marksElement) {
                const newMarks = parseInt(marksElement.value);
                if (newMarks > 0) {
                    question.marks = newMarks;
                }
            }
        });
        
        this.closeEditMarksModal();
        
        // Update total marks display
        const totalMarks = this.currentTest.questions.reduce((sum, q) => sum + q.marks, 0);
        this.totalMarksSpan.textContent = totalMarks;
        this.instructionTotalMarksSpan.textContent = totalMarks;
        
        alert('Marks updated successfully!');
    }

    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    // Drawing functions
    openDrawingModal(questionId) {
        this.currentDrawingQuestion = questionId;
        this.drawingModal.style.display = 'flex';
        
        // Initialize canvas
        this.drawingContext = this.drawingCanvas.getContext('2d');
        this.drawingContext.lineCap = 'round';
        this.drawingContext.lineJoin = 'round';
        
        // Clear canvas and load existing drawing if any
        this.clearCanvas();
        
        if (this.userAnswers[`drawing_${questionId}`]) {
            const img = new Image();
            img.onload = () => {
                this.drawingContext.drawImage(img, 0, 0);
            };
            img.src = this.userAnswers[`drawing_${questionId}`];
        }
    }

    closeDrawingModal() {
        this.drawingModal.style.display = 'none';
        this.currentDrawingQuestion = null;
    }

    selectTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        // Show/hide text input based on tool selection
        if (tool === 'text') {
            this.textInput.style.display = 'inline-block';
            this.textInput.focus();
        } else {
            this.textInput.style.display = 'none';
        }
    }

    updateSizeDisplay() {
        this.sizeValue.textContent = this.sizePicker.value;
    }

    startDrawing(e) {
        if (this.currentTool === 'text') {
            // For text tool, place text at click position
            const rect = this.drawingCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const text = this.textInput.value.trim();
            if (text) {
                this.drawingContext.fillStyle = this.colorPicker.value;
                this.drawingContext.font = `${this.sizePicker.value * 8}px Arial`;
                this.drawingContext.fillText(text, x, y);
                
                // Save to history
                this.drawingHistory.push({
                    tool: 'text',
                    color: this.colorPicker.value,
                    size: this.sizePicker.value * 8,
                    text: text,
                    x: x,
                    y: y
                });
            }
            return;
        }
        
        this.isDrawing = true;
        const rect = this.drawingCanvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        
        if (this.currentTool === 'pen' || this.currentTool === 'eraser') {
            this.currentPath = [{x: this.startX, y: this.startY}];
            this.drawingContext.beginPath();
            this.drawingContext.moveTo(this.startX, this.startY);
        }
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Set drawing properties
        if (this.currentTool === 'eraser') {
            this.drawingContext.globalCompositeOperation = 'destination-out';
            this.drawingContext.lineWidth = this.sizePicker.value * 3;
        } else {
            this.drawingContext.globalCompositeOperation = 'source-over';
            this.drawingContext.strokeStyle = this.colorPicker.value;
            this.drawingContext.lineWidth = this.sizePicker.value;
        }
        
        this.drawingContext.lineCap = 'round';
        this.drawingContext.lineJoin = 'round';
        
        switch (this.currentTool) {
            case 'pen':
                this.drawingContext.lineTo(x, y);
                this.drawingContext.stroke();
                this.currentPath.push({x, y});
                break;
                
            case 'eraser':
                this.drawingContext.lineTo(x, y);
                this.drawingContext.stroke();
                break;
                
            case 'line':
                this.redrawCanvas();
                this.drawingContext.beginPath();
                this.drawingContext.moveTo(this.startX, this.startY);
                this.drawingContext.lineTo(x, y);
                this.drawingContext.stroke();
                break;
                
            case 'rectangle':
                this.redrawCanvas();
                this.drawingContext.beginPath();
                this.drawingContext.strokeRect(this.startX, this.startY, x - this.startX, y - this.startY);
                break;
                
            case 'circle':
                this.redrawCanvas();
                const radius = Math.sqrt(Math.pow(x - this.startX, 2) + Math.pow(y - this.startY, 2));
                this.drawingContext.beginPath();
                this.drawingContext.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
                this.drawingContext.stroke();
                break;
                
            case 'triangle':
                this.redrawCanvas();
                this.drawingContext.beginPath();
                this.drawingContext.moveTo(this.startX, this.startY);
                this.drawingContext.lineTo(x, y);
                this.drawingContext.lineTo(this.startX - (x - this.startX), y);
                this.drawingContext.closePath();
                this.drawingContext.stroke();
                break;
        }
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveToHistory();
        }
    }

    redrawCanvas() {
        // Clear canvas first
        this.drawingContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        
        // Redraw all saved paths
        this.drawingHistory.forEach(item => {
            if (item.tool === 'text') {
                // Redraw text
                this.drawingContext.fillStyle = item.color;
                this.drawingContext.font = `${item.size}px Arial`;
                this.drawingContext.fillText(item.text, item.x, item.y);
            } else {
                // Redraw shapes and lines
                this.drawingContext.strokeStyle = item.color;
                this.drawingContext.lineWidth = item.size;
                this.drawingContext.lineCap = 'round';
                this.drawingContext.lineJoin = 'round';
                
                if (item.tool === 'eraser') {
                    this.drawingContext.globalCompositeOperation = 'destination-out';
                } else {
                    this.drawingContext.globalCompositeOperation = 'source-over';
                }
                
                this.drawingContext.beginPath();
                
                if (item.tool === 'line') {
                    this.drawingContext.moveTo(item.path[0].x, item.path[0].y);
                    this.drawingContext.lineTo(item.path[1].x, item.path[1].y);
                } else if (item.tool === 'rectangle') {
                    this.drawingContext.strokeRect(item.path[0].x, item.path[0].y, 
                        item.path[1].x - item.path[0].x, item.path[1].y - item.path[0].y);
                } else if (item.tool === 'circle') {
                    const radius = Math.sqrt(Math.pow(item.path[1].x - item.path[0].x, 2) + 
                        Math.pow(item.path[1].y - item.path[0].y, 2));
                    this.drawingContext.arc(item.path[0].x, item.path[0].y, radius, 0, 2 * Math.PI);
                } else if (item.tool === 'triangle') {
                    this.drawingContext.moveTo(item.path[0].x, item.path[0].y);
                    this.drawingContext.lineTo(item.path[1].x, item.path[1].y);
                    this.drawingContext.lineTo(item.path[0].x - (item.path[1].x - item.path[0].x), item.path[1].y);
                    this.drawingContext.closePath();
                } else {
                    item.path.forEach((point, index) => {
                        if (index === 0) {
                            this.drawingContext.moveTo(point.x, point.y);
                        } else {
                            this.drawingContext.lineTo(point.x, point.y);
                        }
                    });
                }
                this.drawingContext.stroke();
            }
        });
        
        // Reset composite operation
        this.drawingContext.globalCompositeOperation = 'source-over';
    }

    saveToHistory() {
        const rect = this.drawingCanvas.getBoundingClientRect();
        const endX = event.clientX - rect.left;
        const endY = event.clientY - rect.top;
        
        this.drawingHistory.push({
            tool: this.currentTool,
            color: this.colorPicker.value,
            size: this.currentTool === 'eraser' ? this.sizePicker.value * 3 : this.sizePicker.value,
            path: this.currentTool === 'pen' ? [...this.currentPath] : [{x: this.startX, y: this.startY}, {x: endX, y: endY}]
        });
    }

    clearCanvas() {
        this.drawingContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        this.drawingHistory = [];
    }

    undoDrawing() {
        if (this.drawingHistory.length > 0) {
            this.drawingHistory.pop();
            this.drawingContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
            this.redrawCanvas();
        }
    }

    saveDrawing() {
        const imageData = this.drawingCanvas.toDataURL();
        this.userAnswers[`drawing_${this.currentDrawingQuestion}`] = imageData;
        
        // Update display
        const drawingDisplay = document.getElementById(`drawing-${this.currentDrawingQuestion}`);
        drawingDisplay.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = imageData;
        img.className = 'drawing-image';
        img.addEventListener('click', () => this.openDrawingModal(this.currentDrawingQuestion));
        drawingDisplay.appendChild(img);
        
        this.closeDrawingModal();
        alert('Drawing saved successfully!');
    }

    // AI Helper functions
    openAIHelper(questionId) {
        this.currentAIQuestion = this.currentTest.questions.find(q => q.id === questionId);
        this.currentHintStep = 0;
        this.allHintSteps = [];
        this.aiHelperModal.style.display = 'flex';
        this.resetHint();
    }

    closeAIHelperModal() {
        this.aiHelperModal.style.display = 'none';
        this.currentAIQuestion = null;
    }

    async getHint() {
        if (!this.currentAIQuestion) return;
        
        this.showLoading(true);
        
        try {
            const prompt = `You are an AI tutor that helps students solve problems step-by-step WITHOUT giving away the final answer. 
            
Question: ${this.currentAIQuestion.text}
Question Type: ${this.currentAIQuestion.type}

Provide exactly 4-5 progressive hints that guide the student toward the solution. Each hint should:
1. Build on the previous hint
2. Guide thinking but not give the answer
3. Be appropriate for ${this.currentTest.grade} level
4. Focus on the process/method

Format your response exactly like this:
Step 1: [First hint - what to think about first]
Step 2: [Second hint - what to consider next]
Step 3: [Third hint - what approach to take]
Step 4: [Fourth hint - what calculation/method to use]
Step 5: [Final hint - what to check/verify]

DO NOT include the final answer. DO NOT say "the answer is". Focus only on the process.`;

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful AI tutor that provides step-by-step guidance without revealing final answers.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const hintText = data.choices[0].message.content;
            
            // Parse the steps
            this.allHintSteps = this.parseHintSteps(hintText);
            this.currentHintStep = 0;
            this.displayCurrentHint();
            
        } catch (error) {
            console.error('Error getting hint:', error);
            this.aiHelperContent.innerHTML = '<p style="color: red;">Error getting hint. Please try again.</p>';
        } finally {
            this.showLoading(false);
        }
    }

    parseHintSteps(text) {
        const steps = [];
        const lines = text.split('\n');
        
        lines.forEach(line => {
            const match = line.match(/Step \d+:\s*(.+)/);
            if (match) {
                steps.push(match[1].trim());
            }
        });
        
        return steps;
    }

    displayCurrentHint() {
        if (this.allHintSteps.length === 0) {
            this.aiHelperContent.innerHTML = '<p>No hints available. Please try again.</p>';
            return;
        }

        const currentStep = this.allHintSteps[this.currentHintStep];
        const stepNumber = this.currentHintStep + 1;
        const totalSteps = this.allHintSteps.length;
        
        this.aiHelperContent.innerHTML = `
            <div style="margin-bottom: 15px;">
                <strong>Step ${stepNumber} of ${totalSteps}:</strong>
            </div>
            <div style="margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-left: 4px solid #000;">
                ${currentStep}
            </div>
            <div style="font-size: 12px; color: #666;">
                Click "Next Step" when you're ready for the next hint.
            </div>
        `;

        // Update button visibility
        this.getHintBtn.style.display = 'none';
        this.nextStepBtn.style.display = 'inline-block';
        
        if (this.currentHintStep >= this.allHintSteps.length - 1) {
            this.nextStepBtn.textContent = 'No More Steps';
            this.nextStepBtn.disabled = true;
        } else {
            this.nextStepBtn.textContent = 'Next Step';
            this.nextStepBtn.disabled = false;
        }
    }

    getNextHintStep() {
        if (this.currentHintStep < this.allHintSteps.length - 1) {
            this.currentHintStep++;
            this.displayCurrentHint();
        }
    }

    resetHint() {
        this.currentHintStep = 0;
        this.allHintSteps = [];
        this.aiHelperContent.innerHTML = '<p>Click "Get Hint" to receive step-by-step guidance for this question.</p>';
        this.getHintBtn.style.display = 'inline-block';
        this.nextStepBtn.style.display = 'none';
    }

    saveHint() {
        if (!this.currentAIQuestion) return;
        
        const hintContent = this.aiHelperContent.innerHTML;
        this.userAnswers[`ai_helper_${this.currentAIQuestion.id}`] = hintContent;
        
        // Update display
        const aiHelperDisplay = document.getElementById(`ai-helper-${this.currentAIQuestion.id}`);
        if (aiHelperDisplay) {
            aiHelperDisplay.innerHTML = hintContent;
        }
        
        this.closeAIHelperModal();
        alert('Hint saved successfully!');
    }

    // AI Assistant functions
    toggleAssistant() {
        this.aiAssistant.classList.toggle('minimized');
        this.aiAssistantMinimize.textContent = this.aiAssistant.classList.contains('minimized') ? '+' : '−';
    }

    addAIMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${isUser ? 'user' : 'ai'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'ai-message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        this.aiAssistantChat.appendChild(messageDiv);
        
        // Scroll to bottom
        this.aiAssistantChat.scrollTop = this.aiAssistantChat.scrollHeight;
    }

    async sendAIMessage() {
        const message = this.aiInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addAIMessage(message, true);
        this.aiInput.value = '';
        this.aiSendBtn.disabled = true;
        
        // Parse question number from message
        const questionMatch = message.match(/question\s*(\d+)/i);
        const questionNumber = questionMatch ? parseInt(questionMatch[1]) : null;
        
        if (!questionNumber) {
            this.addAIMessage("I didn't catch which question you need help with. Please try saying 'help with question 3' or 'question 2'.");
            this.aiSendBtn.disabled = false;
            return;
        }
        
        // Find the question
        const question = this.currentTest?.questions.find(q => q.id === questionNumber);
        if (!question) {
            this.addAIMessage(`I can't find question ${questionNumber}. Please make sure you're asking about a question that exists in your test.`);
            this.aiSendBtn.disabled = false;
            return;
        }
        
        // Get AI help
        try {
            this.addAIMessage("Let me help you with that question step by step...");
            
            const prompt = `You are an AI tutor helping a student with a specific question. The student is asking for help with question ${questionNumber}.

Question: ${question.text}
Question Type: ${question.type}
Grade Level: ${this.currentTest.grade}

Provide step-by-step guidance to help the student solve this problem WITHOUT giving away the final answer. Focus on:
1. What to think about first
2. What approach to take
3. What methods or formulas to use
4. How to work through the problem

Keep it concise and conversational. Do NOT reveal the final answer.`;

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful AI tutor that provides step-by-step guidance without revealing final answers.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 300
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            this.addAIMessage(aiResponse);
            
        } catch (error) {
            console.error('Error getting AI help:', error);
            this.addAIMessage("Sorry, I'm having trouble helping right now. Please try again in a moment.");
        } finally {
            this.aiSendBtn.disabled = false;
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TestMaker();
});
