import React, { useState, useRef, useEffect } from 'react';
import { assets } from '../../assets/assets';

const languages = [
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'bn-IN', name: 'Bengali' },
  { code: 'kn-IN', name: 'Kannada' },
  { code: 'ml-IN', name: 'Malayalam' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'od-IN', name: 'Odia' },
  { code: 'pa-IN', name: 'Punjabi' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'gu-IN', name: 'Gujarati' },
];


const AudioRecorder = ({ setQuery }) => {
  const [recording, setRecording] = useState(false);
  const [language, setLanguage] = useState('hi-IN');
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const dropdownRef = useRef(null);



  const startRecording = async () => {
    setRecording(true);
    audioChunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      await sendAudioToApi(audioFile);
    };
  };

  const sendAudioToApi = async (audioFile) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('language_code', language); 
    formData.append('model', 'saarika:v1');

    try {
      const response = await fetch(import.meta.env.VITE_SARVAM_ASR_API_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': import.meta.env.VITE_SARVAM_API,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.transcript) {
        setQuery(data.transcript);
      }
    } catch (error) {
      console.error("Error sending audio to API: ", error);
    }
  };

  const toggleLanguageOptions = () => {
    setShowLanguageOptions(!showLanguageOptions);
  };

  const handleLanguageSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowLanguageOptions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <img
        src={recording ? assets.pause : assets.mic_icon}
        alt={recording ? "Stop Recording" : "Start Recording"}
        onClick={recording ? stopRecording : startRecording}
        style={{ cursor: 'pointer' }}
      />

      <div style={{ position: 'relative', marginLeft: '10px' }} ref={dropdownRef}>
        <button
          onClick={toggleLanguageOptions}
          style={{
            padding: '10px 15px',
            cursor: 'pointer',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '120px',
          }}
        >
          {languages.find(lang => lang.code === language)?.name || 'Select Language'}
        </button>

        {showLanguageOptions && (
          <div
            style={{
              position: 'absolute',
              bottom: '40px', 
              left: '0',
              width: '120px', 
              backgroundColor: 'white',
              border: '1px solid black',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              zIndex: 1000,
              borderRadius: '4px',
            }}
          >
            <ul style={{ listStyle: 'none', padding: '10px', margin: '0' }}>
              {languages.map((lang) => (
                <li
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  style={{
                    cursor: 'pointer',
                    padding: '5px',
                    textAlign: 'center',
                    borderBottom: '1px solid #ddd',
                  }}
                >
                  {lang.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
