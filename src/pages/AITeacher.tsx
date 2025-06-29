import React, { useState } from 'react';

const GEMINI_API_KEY = 'AIzaSyAl4ZKjHyNs0kEAeuCCojjBKeEye_JgPWc';
const GEMINI_MODEL = 'gemini-2.0-flash';
const ELEVENLABS_API_KEY = 'sk_c549daee81e90865cb3171fa06ebfbd47a5dc76dbd293890';
const ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

const ASTRA_PROMPT = `You are an AI teacher named "Astra" helping students understand complex concepts clearly. Your task is to generate two things:

1. Spoken Script for ElevenLabs Voice AI
Tone: friendly, clear, natural
Duration: under 90 seconds
Format: conversational, with examples or analogies
Goal: Make the student understand as if you're explaining 1-on-1
Avoid meta comments or instructions; this will be read aloud.

2. Page Content Summary for the Web App
Provide a well-structured explanation of the topic
Add 1–2 subheadings, bullet points or examples
Include a helpful analogy if it suits the topic
Use markdown-compatible formatting (e.g. **bold**, *italic*, inline code)

Input

Topic: {{topic}}
User Level: {{level}}
Focus or Instruction: {{focus}}`;

function buildPrompt(topic: string, level: string, focus: string) {
  return ASTRA_PROMPT
    .replace('{{topic}}', topic)
    .replace('{{level}}', level)
    .replace('{{focus}}', focus);
}

async function callGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Gemini API error: ${errorData.error?.message || res.statusText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Remove special characters and keep only plain text
  function cleanText(str) {
    return str.replace(/[#*_`~\[\]<>\-]/g, '').replace(/\n{2,}/g, '\n').trim();
  }

  // Split by headings
  const scriptMatch = text.match(/Spoken Script[\s\S]*?\n([\s\S]*?)\n\s*Page Content Summary/i);
  const summaryMatch = text.match(/Page Content Summary[\s\S]*?\n([\s\S]*)/i);

  return {
    script: scriptMatch ? cleanText(scriptMatch[1]) : '',
    summary: summaryMatch ? cleanText(summaryMatch[1]) : cleanText(text)
  };
}

// Utility to truncate text to a max word count
function truncateToWords(text, maxWords) {
  const words = text.split(/\s+/);
  return words.length > maxWords ? words.slice(0, maxWords).join(' ') : text;
}

async function getElevenLabsAudio(text) {
  // Truncate to 250 words for ElevenLabs
  const truncatedText = truncateToWords(text, 250);
  console.log('[Astra] ElevenLabs script (first 20 words):', truncatedText.split(/\s+/).slice(0, 20).join(' '));

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text: truncatedText,
      voice_settings: { stability: 0.5, similarity_boost: 0.5 }
    })
  });

  const contentType = res.headers.get('Content-Type');
  console.log('[Astra] ElevenLabs response Content-Type:', contentType);

  if (contentType !== 'audio/mpeg') {
    const errorJson = await res.json().catch(() => ({}));
    console.error('[Astra] ElevenLabs API error:', errorJson);
    throw new Error(errorJson.detail?.message || 'Failed to generate audio.');
  }

  const audioBlob = await res.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  console.log('[Astra] ElevenLabs audioUrl:', audioUrl);
  if (!audioUrl) throw new Error('Failed to create audio URL.');
  return audioUrl;
}

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const AITeacher: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState(levels[0]);
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const [script, setScript] = useState('');
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');

  const handleAskAstra = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to learn about.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');
    setAudioUrl('');
    setScript('');
    setAudioError('');
    setAudioLoading(false);
    
    try {
      const prompt = buildPrompt(topic.trim(), level, focus.trim());
      const { script, summary } = await callGemini(prompt);
      
      if (!summary) {
        throw new Error('No explanation was generated. Please try again.');
      }
      
      setSummary(summary);
      setScript(script);
      
      if (script && ELEVENLABS_API_KEY) {
        setAudioLoading(true);
        try {
          const url = await getElevenLabsAudio(script);
          setAudioUrl(url);
        } catch (audioError) {
          setAudioError(audioError instanceof Error ? audioError.message : 'Audio generation failed.');
          setAudioUrl('');
        } finally {
          setAudioLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && topic.trim()) {
      handleAskAstra();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Teacher: Astra</h1>
            <p className="text-gray-600">Your personal AI tutor for learning any topic</p>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">What would you like to learn about?</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="E.g., Python Loops, Quantum Physics, French Grammar..."
                disabled={loading}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Level</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  disabled={loading}
                >
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions (Optional)</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={focus}
                  onChange={e => setFocus(e.target.value)}
                  placeholder="E.g., Use real-world examples, Keep it simple..."
                  disabled={loading}
                />
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-6 py-3 font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAskAstra}
              disabled={loading || !topic.trim()}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Asking Astra...
                </div>
              ) : (
                'Ask Astra'
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {summary && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Astra's Explanation
              </h2>
              <div 
                className="prose prose-blue max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: summary
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 py-0.5 rounded text-sm">$1</code>')
                    .replace(/\n/g, '<br/>') 
                }} 
              />
            </div>
          )}

          {script && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Listen to Astra's Explanation
              </h3>
              {audioLoading ? (
                <div className="flex items-center gap-2 text-blue-600"><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating audio...</div>
              ) : audioUrl ? (
                <div>
                  <audio controls src={audioUrl} className="w-full" controlsList="nodownload" />
                  <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => { const audio = document.querySelector('audio'); if (audio) audio.play(); }}>Play</button>
                </div>
              ) : audioError ? (
                <div>
                  <div className="text-red-600 mb-2">{audioError}</div>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        const utter = new window.SpeechSynthesisUtterance(script);
                        utter.rate = 1;
                        utter.pitch = 1;
                        window.speechSynthesis.speak(utter);
                      } else {
                        alert('Sorry, your browser does not support speech synthesis.');
                      }
                    }}
                  >
                    Play with Browser Voice
                  </button>
                </div>
              ) : null}
              <div className="mt-4 p-3 bg-white rounded shadow text-gray-800 whitespace-pre-line">
                {script}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITeacher; 