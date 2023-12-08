document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.getElementById('question-text');
    const answerType = document.getElementById('answer-type');
    const answerOptions = document.getElementById('answer-options');
    const matchQuestions = document.getElementById('match-questions');
    const quizContainer = document.getElementById('quiz-container');
    const fileInput = document.getElementById('file-input');

    let questionCount = 0;
    let currentAnswerType = 'radio';

    const submitButton = document.getElementById('submit-quiz');
    if (submitButton) {
        submitButton.addEventListener('click', submitQuiz);
    }
    const saveButton = document.getElementById('save');
    if (saveButton) {
        saveButton.addEventListener('click', saveQuestions);
    }
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    function addQuestion() {
        if (questionText.value.trim() === '') {
            alert('Please enter a question');
            return;
        }

        questionCount++;
        const questionHtml = `
            <div class="question-container">
                <div class="question-header">
                    <span class="question-number">Question ${questionCount}</span>
                </div>
                <div class="question-body">
                    <div class="question-text">${questionText.value}</div>
                    <div class="question-options">
                        ${currentAnswerType === 'match' ? generateMatchingHTML() : generateOptionsHTML()}
                    </div>
                </div>
            </div>
        `;

        quizContainer.innerHTML += questionHtml;
        clearAnswerInputs();
    }

    function addAnswerInput() {
        const answerHtml = `
            <div class="answer-option">
                <input type="text" placeholder="Answer">
                <input type="checkbox"> Mark as correct
            </div>
        `;
        answerOptions.innerHTML += answerHtml;
    }

    function addMatchQuestion() {
        const matchHtml = `
            <div class="match-question">
                <input type="text" placeholder="Term">
                <select class="match-select">
                    <!-- Options will be added dynamically -->
                </select>
            </div>
        `;
        matchQuestions.innerHTML += matchHtml;
    }

    function generateOptionsHTML() {
        let optionsHtml = '';
        document.querySelectorAll('.answer-option').forEach((option, index) => {
            optionsHtml += `
                <label>
                    <input type="${currentAnswerType}" name="question${questionCount}" value="${index}">
                    ${option.querySelector('input[type="text"]').value}
                </label>
            `;
        });
        return optionsHtml;
    }

    function generateMatchingHTML() {
        let matchingHtml = '';
        document.querySelectorAll('.match-question').forEach((match) => {
            matchingHtml += `
                <div class="match-item">
                    <span class="match-term">${match.querySelector('input[type="text"]').value}</span>
                    <div class="match-select-container">
                        <select class="match-select">
                            <!-- Options will be added dynamically -->
                        </select>
                    </div>
                </div>
            `;
        });
        return matchingHtml;
    }

    function clearAnswerInputs() {
        answerOptions.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            addAnswerInput();
        }
    }

    function clearMatchQuestions() {
        matchQuestions.innerHTML = '';
    }

    function handleAnswerTypeChange() {
        currentAnswerType = answerType.value;
        if (currentAnswerType === 'match') {
            clearMatchQuestions();
            addMatchQuestion();
        } else {
            clearAnswerInputs();
        }
    }

    function submitQuiz() {
        let score = 0;
        const questions = document.querySelectorAll('.question-container');
    
        questions.forEach(question => {
            const questionType = question.querySelector('.question-options input')?.type;
            let isCorrect = false;
    
            if (questionType === 'radio' || questionType === 'checkbox') {
                isCorrect = checkOptions(question, questionType);
            } else {
                isCorrect = checkMatches(question);
            }
    
            if (isCorrect) {
                score++;
                question.style.backgroundColor = '#ccffcc'; // Green for correct
            } else {
                question.style.backgroundColor = '#ffcccc'; // Red for incorrect
            }
        });
    
        alert(`Your score is ${score} out of ${questions.length}`);
    }
    
    function checkOptions(question, questionType) {
        const options = question.querySelectorAll(`input[type="${questionType}"]`);
    
        for (let option of options) {
            const isCorrect = option.getAttribute('iscorrect') === 'true';
    
            // For radio buttons: if an incorrect option is selected or a correct one is not, return false
            if (questionType === 'radio') {
                if ((isCorrect && !option.checked) || (!isCorrect && option.checked)) {
                    return false;
                }
            }
    
            // For checkboxes: if the checked state doesn't match its correctness, return false
            if (questionType === 'checkbox' && ((isCorrect && !option.checked) || (!isCorrect && option.checked))) {
                return false;
            }
        }
    
        // If all conditions are met, return true
        return true;
    }
    
    
    
    function checkMatches(question) {
        const matchItems = question.querySelectorAll('.match-item');
    
        for (let matchItem of matchItems) {
            const term = matchItem.querySelector('.match-term').textContent.trim();
            const selectedValue = matchItem.querySelector('.match-select').value;
    
            // Compare the term with the selected value
            if (term !== selectedValue) {
                return false;
            }
        }
    
        return true;
    }
    
    

    function saveQuestions() {
        console.log('saveQuestions');
        const questions = document.querySelectorAll('.question-container');
        const quizData = [];
    
        questions.forEach(question => {
            const questionText = question.querySelector('.question-text').textContent;
            const questionType = question.querySelector('.question-options input').type;
            const answers = [];
    
            if (questionType === 'radio' || questionType === 'checkbox') {
                const options = question.querySelectorAll('.question-options input');
                options.forEach((option, index) => {
                    answers.push({
                        answerValue: option.nextSibling.textContent.trim(),
                        isCorrect: option.nextElementSibling.textContent.trim() === 'Mark as correct'
                    });
                });
            } else if (questionType === 'select-one') {
                const matches = question.querySelectorAll('.match-item');
                matches.forEach(match => {
                    answers.push({
                        term: match.querySelector('.match-term').textContent.trim(),
                        correctValue: match.querySelector('.match-select').value
                    });
                });
            }
    
            quizData.push({
                questionText: questionText,
                answers: answers,
                type: questionType === 'select-one' ? 'match' : questionType
            });
        });
    
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quizData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "quiz_data.json");
        document.body.appendChild(downloadAnchorNode); // Required for Firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
    
    function loadQuestions(event) {
        const file = event.target.files[0];
    
        if (!file) {
            return;
        }
    
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            let questions;
    
            try {
                questions = JSON.parse(content);
                if (!Array.isArray(questions)) {
                    throw new Error('Invalid format');
                }
            } catch (err) {
                alert('Error reading file: ' + err.message);
                return;
            }
    
            loadQuestionsToDOM(questions);
        };
    
        reader.readAsText(file);
    }

    function loadQuestionsToDOM(questions) {
        shuffleArray(questions);
        const quizContainer = document.getElementById('quiz-container');
        quizContainer.innerHTML = ''; // Clear existing questions
    
        questions.forEach((question, index) => {
            let optionsHTML = '';
            const formattedQuestionText = question.questionText.replace(/\n/g, '<br>');
            if (question.type === 'radio' || question.type === 'checkbox') {
                shuffleArray(question.answers);
                question.answers.forEach((answer, answerIndex) => {
                    optionsHTML += `
                        <label>
                            <input type="${question.type}" name="question${index}" value="${answerIndex}", isCorrect="${answer.isCorrect}">
                            ${answer.answerValue}
                        </label>
                    `;
                });
            } else if (question.type === 'match') {
                question.answers.forEach((answer) => {
                    optionsHTML += `
                        <div class="match-item">
                            <span class="match-term">${answer.term}</span>
                            <div class="match-select-container">
                                <select class="match-select">
                                    ${question.answers.map(a => `<option value="${a.term}">${a.correctValue}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    `;
                });
            }
    
            const questionHtml = `
                <div class="question-container">
                    <div class="question-header">
                        <span class="question-number">Question ${index + 1}</span>
                    </div>
                    <div class="question-body">
                        <div class="question-text">${formattedQuestionText}</div>
                        <div class="question-options">${optionsHTML}</div>
                    </div>
                </div>
            `;
    
            quizContainer.innerHTML += questionHtml;
        });
    }
    

    answerType.addEventListener('change', handleAnswerTypeChange);
    fileInput.addEventListener('change', loadQuestions);

    // Initialize the application
    handleAnswerTypeChange();
});
