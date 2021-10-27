import "./App.css";
import React, { useState, useEffect } from "react";
import ContentLoader from "react-content-loader";

function App() {
  const [text, setText] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [gettingResult, setGettingResult] = useState(false);
  const [correctWords, setCorrectWords] = useState(0);
  const [wordLength, setWordLength] = useState(0);
  const [action, setAction] = useState("Start");

  const style = {
    color: calculateAccuracy(wordLength, correctWords) >= 70 ? "green" : "red"
  };

  const highScore = localStorage.getItem("highScore");

  function handleChange(e) {
    const { value } = e.target;
    setText(value);
  }

  function calculateWordCount(text) {
    const wordsArr = text.trim().split(" ");
    return wordsArr.filter((word) => word !== "").length;
  }

  function calculateAccuracy(length, correctWords) {
    const accuracy = (correctWords / length) * 100;

    const totalScore = accuracy * wordLength;
    if (localStorage.getItem("highScore")) {
      const highScore = Number(localStorage.getItem("highScore"));
      if (highScore < totalScore) {
        localStorage.setItem("highScore", JSON.stringify(totalScore));
      }
    }
    else{
      localStorage.setItem("highScore", JSON.stringify(totalScore));
    }
    return accuracy.toFixed(2);
  }


  function handleCorrectWordCount() {
    setGettingResult(true);
    const wordsArr = text.trim().split(" ");
    const wordLength = wordsArr.filter((word) => word !== "").length;
    setWordLength(wordLength);

    setTimeout(() => {
      wordsArr.forEach((word) => {
        const endpoint = `https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`;
        fetch(endpoint)
          .then((data) => {
            if (data.status === 200) {
              setCorrectWords((w) => w + 1);
              return;
            }
          })
          .catch((error) => {
            console.log(error.message);
          });
      });
      setGettingResult(false);
    }, 3000);
  }

  function handleRun(action) {
    if (action === "Start") {
      setIsDisabled(false);
      setTimeRemaining((t) => (t = 15));
      setIsRunning((r) => !r);
      return;
    }
    window.location.reload();
  }

  useEffect(() => {
    if (timeRemaining > 0) {
      setTimeout(() => {
        if (timeRemaining === 1) {
          setSubmitted(true);
          setIsDisabled(true);
          setAction("Reset");
        }
        setTimeRemaining((time) => time - 1);
      }, 1000);
    }
  }, [timeRemaining]);

  useEffect(() => {
    if (submitted) {
      handleCorrectWordCount();
    }
  }, [timeRemaining]);

  return (
    <div>
      <small>High score: {highScore ? highScore : 0}</small>
      <h1>How fast do you type?</h1>
      <textarea
        autoFocus={true}
        disabled={isDisabled}
        style={{ backgroundColor: isDisabled && "gray" }}
        onChange={handleChange}
        value={text}
      />
      <h4>Time remaining: {timeRemaining}</h4>
      <button disabled={!isDisabled} onClick={() => handleRun(action)}>
        {action}
      </button>

      <h1>Word count: {calculateWordCount(text)}</h1>
      {gettingResult && isRunning && (
        <div className="loader">
          <ContentLoader />
        </div>
      )}
      {submitted && !gettingResult && (
        <div>
          <p>Correct Words: {correctWords}</p>
          <p style={style}>
            Accuracy: {calculateAccuracy(wordLength, correctWords)}%
          </p>
          <h2>
            Overall score:{" "}
            {calculateAccuracy(wordLength, correctWords) *
              calculateWordCount(text)}
          </h2>
        </div>
      )}
    </div>
  );
}

export default App;
