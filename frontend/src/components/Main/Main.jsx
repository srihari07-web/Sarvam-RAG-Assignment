import React, { useState } from 'react';  
import './Main.css';
import { assets } from '../../assets/assets';
import AudioRecorder from '../Audiorecorder/AudioRecorder';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import NavBar from '../NavBar/NavBar';

const Main = () => {
  const [query, setQuery] = useState("");  
  const [resultData, setResultData] = useState([]);  
  const [showCards, setShowCards] = useState(true);  
  const [loadingIndex, setLoadingIndex] = useState(-1);  
  const [typedTexts, setTypedTexts] = useState([]);  
  const [typingCompleted, setTypingCompleted] = useState([]);  
  const [endpoint, setEndpoint] = useState('query');  
  const [isRecording, setIsRecording] = useState(false);  
const [isLoading, setIsLoading] = useState(false); 


const handleQuery = async () => {
  if (!query) return;

  setIsLoading(true); 
  setLoadingIndex(resultData.length);

  try {
    const res = await fetch(`http://localhost:8000/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const data = await res.json();
    console.log("Backend Response:", data);
    const newResponse = data.response || "No response found.";
    setResultData(prev => [...prev, { prompt: query, response: newResponse }]);
    setTypedTexts(prev => [...prev, ""]);
    setTypingCompleted(prev => [...prev, false]);
    setShowCards(false);
    typeEffect(newResponse, resultData.length);
    setQuery("");
  } catch (error) {
    console.error("Error fetching data: ", error);
    setResultData(prev => [...prev, { prompt: query, response: "Something went wrong. Please try again." }]);
    setTypedTexts(prev => [...prev, ""]);
    setTypingCompleted(prev => [...prev, true]);
    setQuery("");
  } finally {
    setLoadingIndex(-1); 
    setIsLoading(false); 
  }
};



  const typeEffect = (text, index) => {
    let currentIndex = -1;  
    const interval = setInterval(() => {
      if (currentIndex < text.length - 1) {
        currentIndex++;
        setTypedTexts(prev => {
          const newTexts = [...prev];
          newTexts[index] += text.charAt(currentIndex);  
          return newTexts;
        });
      } else {
        clearInterval(interval);  
        setTypingCompleted(prev => {
          const newTypingCompleted = [...prev];
          newTypingCompleted[index] = true; 
          return newTypingCompleted;
        });
      }
    }, 30);  
  };

  const handleCardClick = (prompt) => {
    setQuery(prompt);  
    handleQuery();     
  };

  const fetchAndPlayAudio = async (text) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': import.meta.env.VITE_SARVAM_API, 
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: "hi-IN", 
        speaker: "meera", 
        pitch: 1,
        pace: 1.0,
        loudness: 1.0,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v1",
      }),
    };

    try {
      const response = await fetch(import.meta.env.VITE_SARVAM_TTS_API_URL, options);
      const data = await response.json();
      const audioBase64 = data.audios[0];
    
      if (audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        audio.play();
      }
    } catch (error) {
      console.error("Error fetching audio from Sarvam API: ", error);
    }
  };
const handleWebSearch = async (prompt) => {
  if (!prompt) return;
  setLoadingIndex(resultData.length);

  try {
    const res = await fetch(`http://localhost:8000/web-search`, {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: prompt })
    });

    const data = await res.json();
    console.log("Backend Web Search Response:", data);
    const newResponse = data.response || "No response found.";
    setResultData(prev => [...prev, { prompt, response: newResponse }]);
    setTypedTexts(prev => [...prev, ""]);
    setTypingCompleted(prev => [...prev, false]); 
    setShowCards(false);  
    typeEffect(newResponse, resultData.length);
    setQuery("");
  } catch (error) {
    console.error("Error fetching web search data: ", error);
    setResultData(prev => [...prev, { prompt, response: "Something went wrong. Please try again." }]);
    setTypedTexts(prev => [...prev, ""]);
    setTypingCompleted(prev => [...prev, true]);  
  } finally {
    setLoadingIndex(false);
  }
};

return (
  <div className='main'>
    <NavBar />
    <div className="endpoint-selection">
      <h2>Select Endpoint:</h2>
      <button className={`endpoint-button ${endpoint === 'query' ? 'active' : ''}`} onClick={() => setEndpoint('query')}>
        Use Vector DB
      </button>
      <button className={`endpoint-button ${endpoint === 'agent' ? 'active' : ''}`} onClick={() => setEndpoint('agent')}>
        Use Agent
      </button>
    </div>

    <div className="main-container">
      {!isLoading && showCards && (
        <>
          <div className="greet">
            <p><span>Welcome to the World of Sound!</span></p>
            <p>Ask me anything about sound waves, vibrations, or how sound travels.</p>
          </div>
          <div className="cards">
            <div className="card" onClick={() => handleCardClick("Explain the Pitch and Volume of Sound.")}>
              <p>Explain the Pitch and Volume of Sound.</p>
              <img src={assets.bulb_icon} alt="" />
            </div>
            <div className="card" onClick={() => handleCardClick("What is the relationship between frequency and pitch in sound waves?")}>
              <p>What is the relationship between frequency and pitch in sound waves?</p>
              <img src={assets.menu_icon} alt="" />
            </div>
            <div className="card" onClick={() => handleCardClick("How does amplitude affect the loudness of a sound?")}>
              <p>How does amplitude affect the loudness of a sound?</p>
              <img src={assets.messagecardsicon} alt="" />
            </div>
          </div>
        </>
      )}

      <div className="main-bottom">
        {isLoading && (
          <div className="response-loader">
            <div className="loader">
              <hr />
              <hr />
              <hr />
            </div>
          </div>
        )}

        {!isLoading && resultData.length > 0 && (
          <div className="result">
            {resultData.map((msg, index) => (
              <div key={index} className="result-item">
                <div className="result-title">
                  <img src={assets.user_icon} alt="" />
                  <p>{msg.prompt}</p>
                </div>
                <div className="result-data">
                  <img src={assets.gemini_icon} alt="" />
                  {loadingIndex === index ? (
                    <div className="loader">
                      <hr />
                      <hr />
                      <hr />
                    </div>
                  ) : (
                    <div className="result-data">
                      <p dangerouslySetInnerHTML={{ __html: typedTexts[index] }}></p>
                      {msg.response.content && (
                        <div className="web-result">
                          <p>{msg.response.content}</p>
                          <a href={msg.response.url} target="_blank" rel="noopener noreferrer">
                            Read more
                          </a>
                        </div>
                      )}
                      {typingCompleted[index] && (
                        <div className="response-actions">
                          {endpoint === 'agent' && (
                            <>
                              <button onClick={() => fetchAndPlayAudio(msg.response)} className="read-aloud-button">
                                <FontAwesomeIcon icon={faVolumeUp} />
                              </button>
                              <button onClick={() => handleWebSearch(msg.prompt)} className="web-search-response-button">
                                Web Search
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

   <div className="search-box">
  <input
    type="text"
    placeholder="Enter a prompt here"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
    disabled={isLoading}
  />
  <div className="icon-buttons">
    <AudioRecorder setQuery={setQuery} />
    <img
      src={assets.send_icon}
      alt=""
      className="send-button"
      onClick={handleQuery}
    />
  </div>
</div>


        <p className="bottom-info">"Sound is the vocabulary of nature." — Pierre Schaeffer</p>
      </div>
    </div>
  </div>
);


};

export default Main;
