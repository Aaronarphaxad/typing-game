import "./App.css";
import React, { useState, useEffect } from "react";
import ContentLoader from "react-content-loader";

function retrieveHighScore(){
  const existingHighScore = localStorage.getItem("highScore") ? localStorage.getItem("highScore"): 0;
  return existingHighScore
}

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
  const [ highScore, setHighscore ] = useState(retrieveHighScore())

  const style = {
    color: calculateAccuracy(wordLength, correctWords) >= 70 ? "green" : "red"
  };


  function handleChange(e) {
    const { value } = e.target;
    setText(value);
  }

  function calculateWordCount(text) {
    const wordsArr = text.trim().split(" ");
    return wordsArr.filter((word) => word !== "").length;
  }

 
  function handleUpdateHighScore () {
    // get the current high score from local storage
    const currentHighScore = Number(localStorage.getItem("highScore"))
    // calculate the current high score as the correct words updates
    const newHighScore = (calculateAccuracy(wordLength, correctWords) *
    correctWords)
    // if the new high score is NaN, means that the player has not started the game, ignore
    if(isNaN(newHighScore) ){
      return
    }
    // if they have, check if world lenght or correct word is greater than zero, for empty input
    if(wordLength||correctWords){
      if(currentHighScore && (currentHighScore > newHighScore)){
        // if there is an high score saved and its less than the newlyy calculated, ignore, do nothing
        return false
      }
      //if it is higher, then set it as the new high score
      setHighscore(newHighScore)
      localStorage.setItem("highScore", JSON.stringify(newHighScore));
    }
  }

  function calculateAccuracy(length, correctWords) {
    const accuracy = (correctWords / length) * 100;
    if(isNaN (accuracy)){
      return 0
    }
    // setAccuracy(a => a = accuracy)
    
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
  };

  function handleRun(action) {
    if (action === "Start") {
      setIsDisabled(false);
      setTimeRemaining((t) => (t = 5));
      setIsRunning((r) => !r);
      return;
    }
    window.location.reload();
  };

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


  useEffect(()=>{
   handleUpdateHighScore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[correctWords])

  useEffect(() => {

    if (submitted) {
      handleCorrectWordCount();
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);


  return (
    <div>
      <small>High score: {highScore}</small>
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
              correctWords}
          </h2>
        </div>
      )}
    </div>
  );
}

export default App;
