// Get neded elements
const setSettingsDiv = document.getElementById("set-settings"),
  quizDiv = document.getElementById("quiz"),
  resultDiv = document.getElementById("result"),
  totalQuestionsNum = document.querySelectorAll(".total-questions-num"),
  currentQuestionNum = document.getElementById("current-question-num"),
  progress = document.getElementById("progress"),
  questionText = document.getElementById("question-text"),
  answerElements = document.querySelectorAll(".answer-text"),
  scoreText = document.getElementById("score-text"),
  startQuizBtn = document.getElementById("start-quiz-btn"),
  submitBtn = document.getElementById("submit-btn"),
  nextBtn = document.getElementById("next-btn"),
  resetBtn = document.getElementById("reset-btn");

// variables that need to be reassigned
let allQuestions = [], // an array that holds all the quiz questions
  score = 0,
  currentQuestion = 1,
  selectedAnswerText,
  timerText = document.getElementById("timer-text"),
  remainingTime,
  questionsTimer;

// Event listeners for buttons  
startQuizBtn.addEventListener("click", startQuiz);
submitBtn.addEventListener("click", () => {
  checkAnswers(allQuestions);
});
nextBtn.addEventListener("click", nextQuestion);
resetBtn.addEventListener("click", () => {
  window.location.reload();
});

// Get selected answer
answerElements.forEach((answer) => {
  answer.addEventListener("click", () => {
    submitBtn.removeAttribute("disabled");
    selectedAnswerText = answer.innerText;
  });
});

// function to start the quiz at the first question
function startQuiz() {
  // User selected quiz features
  const questionsNum = document.getElementById("questions-num").value,
    questionsCat = document.getElementById("questions-cat").value,
    questionsDiff = document.getElementById("questions-diff").value;
  questionsTimer = document.getElementById("questions-timer").value;
  url = `https://opentdb.com/api.php?amount=${questionsNum}&category=${questionsCat}&difficulty=${questionsDiff}&type=multiple`;
  // Use API to get the data
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      allQuestions = data.results;
      // Hide setSettingsDiv and show the quiz
      setSettingsDiv.classList.add("hidden");
      quizDiv.classList.remove("hidden");
      // Add numbers
      totalQuestionsNum.forEach((span) => {
        span.innerText = allQuestions.length;
      });
      currentQuestionNum.innerText = currentQuestion;
      timerText.innerText = questionsTimer;
      showQuestion(allQuestions[currentQuestion - 1], questionsTimer);
    }).catch()
}

// function to set the new question and it's answers
function showQuestion(question, questionsTimer) {
  startQuizTimer(questionsTimer); // Start the quiz timer
  questionText.innerText = question.question;
  // Combine incorrect and correct answers then shuffle the answer options randomly and display it
  const answers = [...question.incorrect_answers, question.correct_answer];
  answers.sort(() => Math.random() - 0.5);
  answerElements.forEach((el, index) => {
    el.innerText = answers[index];
  });
}

// function to make the user know what answer they have selected
function answersUI() {
  answerElements.forEach((answer) => {
    answer.addEventListener("click", () => {
      answerElements.forEach((answer) => {
        answer.parentElement.classList.remove(
          "bg-gray-400",
          "border-transparent",
          "selected-answer-element"
        );
      });
      answer.parentElement.classList.add(
        "bg-gray-400",
        "border-transparent",
        "selected-answer-element"
      );
    });
  });
}
answersUI();

// function to check user selected answer and ready for next question
function checkAnswers(allQuestions) {
  clearInterval(quizTimerDecrement);
  submitBtn.classList.add("hidden");
  nextBtn.classList.remove("hidden");
  let selectedAnswerElement = document.querySelector(
    ".selected-answer-element"
  );
  selectedAnswerElement.classList.remove("bg-gray-400", "border-transparent");
  let icon = document.querySelector(".selected-answer-element .fa-regular");
  answerElements.forEach((answer) => {
    answer.parentElement.classList.add("pointer-events-none");
  });
  // Handle true or false answer
  if (selectedAnswerText === allQuestions[currentQuestion - 1].correct_answer) {
    handleCorrectAnswer(selectedAnswerElement, icon);
  } else {
    handleWrongAnswer(selectedAnswerElement, icon);
  }
}

function handleCorrectAnswer(selectedAnswerElement, icon) {
  score++;
  selectedAnswerElement.classList.add("border-b-green-400", "text-green-400");
  icon.classList.add("fa-circle-check");
}

function handleWrongAnswer(selectedAnswerElement, icon) {
  selectedAnswerElement.classList.add("border-b-red-400", "text-red-400");
  icon.classList.add("fa-circle-xmark");
  displayRightAnswer(allQuestions[currentQuestion - 1].correct_answer);
}

function nextQuestion() {
  clearInterval(quizTimerDecrement);
  submitBtn.setAttribute("disabled", "true");
  // is it's not the last question, show the next one, if it is, show result.
  if (currentQuestion < allQuestions.length) {
    currentQuestion++;
    showQuestion(allQuestions[currentQuestion - 1], questionsTimer);
    currentQuestionNum.innerText = currentQuestion;
    submitBtn.classList.remove("hidden");
    nextBtn.classList.add("hidden");
    resetAnswerElements();
  } else {
    showResult();
  }
}

function resetAnswerElements() {
  answerElements.forEach((answer) => {
    answer.parentElement.classList.remove(
      "border-b-green-400",
      "text-green-400",
      "border-b-red-400",
      "text-red-400",
      "pointer-events-none"
    );
    answer.nextElementSibling.classList.remove(
      "fa-circle-check",
      "fa-circle-xmark"
    );
  });
}

function showResult() {
  scoreText.innerText = score;
  quizDiv.classList.add("hidden");
  resultDiv.classList.remove("hidden");
  // If the user solved all questions
  if (score.toString() === totalQuestionsNum[0].innerText) {
    let quizCompletedPara = document.getElementById("quiz-completed-para")
    let crownTag = document.createElement("i")
    crownTag.className = "fa-solid fa-crown text-yellow-400 text-[160px] mb-8"
    resultDiv.insertBefore(crownTag, quizCompletedPara)
    document.getElementById("congrats").classList.replace("hidden", "block")
  } else{
    document.getElementById("congrats").classList.replace("block", "hidden")
  }
}

// Set timer and a nice progress animation on every question 
function startQuizTimer(questionsTimer) {
  remainingTime = parseInt(questionsTimer);
  timerText.innerText = remainingTime;
  // Decrement the time remaining every second
  quizTimerDecrement = setInterval(() => {
    remainingTime--;
    progress.style.width = `${(remainingTime / questionsTimer) * 100}%`;
    timerText.innerText = remainingTime;
    if (remainingTime <= 0) {
      clearInterval(quizTimerDecrement);
      handleTimeUp();
    }
  }, 1000);
}

// function to handle when the time runs out for the current question
function handleTimeUp() {
  answerElements.forEach((answer) => {
    answer.parentElement.classList.add("pointer-events-none");
  });
  submitBtn.classList.add("hidden");
  nextBtn.classList.remove("hidden");
  displayRightAnswer(allQuestions[currentQuestion - 1].correct_answer);
}

function displayRightAnswer(correctAnswer) {
  answerElements.forEach((answer) => {
    if (answer.innerText === correctAnswer) {
      answer.parentElement.classList.add(
        "border-b-green-400",
        "text-green-400"
      );
      answer.nextElementSibling.classList.add("fa-circle-check");
    }
  });
}