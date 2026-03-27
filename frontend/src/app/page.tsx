"use client";
import React, { useState, useEffect, useRef } from 'react';
import AvatarCanvas from '../components/AvatarCanvas';
import { useSignComm } from '../hooks/useSignComm';
import { useDictation } from '../hooks/useDictation';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { translation } = useSignComm(videoRef, isRecording);
  const { transcript, isListening, toggleDictation, synthesizeToAvatar, setTranscript } = useDictation();
  const [currentAnim, setCurrentAnim] = useState<string>("idle");

  // Toggle Camera
  useEffect(() => {
    if (isRecording && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Could not access camera:", err));
    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  }, [isRecording]);

  return (
    <div className="flex-1 flex max-w-[1800px] w-full mx-auto p-4 md:p-6 gap-6 h-full absolute inset-0">
      
      {/* Left Pane: Interpreter Input */}
      <section className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative group">
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex justify-between items-center z-10 shadow-[0_2px_5px_-2px_rgba(0,0,0,0.02)]">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
            <span className="w-5 h-5 mr-2 bg-blue-50 text-blue-600 rounded flex items-center justify-center text-[10px] font-black border border-blue-100">1</span> 
            Interpreter Feed
          </h2>
          <select className="text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 shadow-sm text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
             <option>Active Database: ASL (United States)</option>
             <option>Active Database: ISL (India)</option>
             <option>Active Database: BSL (United Kingdom)</option>
          </select>
        </div>
        
        <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden grid-bg">
           {/* Webcam Video */}
           <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`absolute inset-0 w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${isRecording ? 'opacity-100' : 'opacity-0'}`}
            />
           
           {!isRecording && (
               <div className="text-center z-10">
                   <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-3 border border-slate-700">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                   </div>
                   <p className="text-slate-400 text-sm font-medium">Camera tracking offline</p>
               </div>
           )}

           {/* AR Overlay Mockup */}
           {isRecording && (
                <div className="absolute inset-0 border-[1.5px] border-emerald-400/40 m-6 md:m-12 rounded-2xl pointer-events-none shadow-[inset_0_0_20px_rgba(52,211,153,0.1)]">
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-500 rounded-tl-lg"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-500 rounded-br-lg"></div>
                </div>
           )}
        </div>

        <div className="p-5 bg-white border-t border-slate-100 z-10">
           <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Real-time NLP Output</p>
              <button 
                 onClick={() => setIsRecording(!isRecording)}
                 className={`px-5 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${isRecording ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 focus:ring-rose-500' : 'bg-slate-900 text-white hover:bg-blue-600 focus:ring-blue-500 hover:shadow-md'}`}
              >
                 {isRecording ? 'End Session' : 'Start Camera Capture'}
              </button>
           </div>
           <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 min-h-[90px] flex items-start shadow-inner">
             <p className="text-lg font-medium text-slate-700 leading-relaxed w-full">
               {translation ? translation : <span className="text-slate-400 italic">Awaiting sign language input...</span>}
               {isRecording && <span className="inline-block w-2 h-5 ml-1 bg-blue-500 animate-pulse align-middle rounded-sm"></span>}
             </p>
           </div>
        </div>
      </section>

      {/* Right Pane: 3D Avatar Output */}
      <section className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex justify-between items-center z-10 shadow-[0_2px_5px_-2px_rgba(0,0,0,0.02)]">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
             <span className="w-5 h-5 mr-2 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center text-[10px] font-black border border-indigo-100">2</span> 
             Avatar Synthesizer Engine
          </h2>
          <div className="flex space-x-2">
            <button className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-sm hover:bg-slate-50 transition-colors">Configuration</button>
          </div>
        </div>
        
        <div className="flex-1 relative bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center">
           {/* React Three Fiber Canvas */}
           <AvatarCanvas currentAnimation={currentAnim} />

           <div className="absolute top-4 left-4 z-20">
              <p className="text-xs text-slate-500 font-semibold bg-white/80 px-2 py-1 rounded shadow-sm backdrop-blur-sm">Camera: Orthographic</p>
           </div>
        </div>

        <div className="p-5 bg-white border-t border-slate-100 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
           <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
              Natural Language to Sign Dictionary
              {isListening && <span className="text-rose-500 font-semibold animate-pulse">⚫ Listening...</span>}
           </p>
           <div className="flex space-x-3">
              <div className="relative flex-1">
                 <input 
                    type="text" 
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        synthesizeToAvatar(transcript);
                        setCurrentAnim("agree");
                        setTimeout(() => setCurrentAnim("idle"), 3000);
                      }
                    }}
                    placeholder="Dictate or type English text for the avatar to sign..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                 />
                 <button 
                    onClick={toggleDictation}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md border shadow-sm transition-colors ${
                       isListening ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-white text-slate-400 hover:text-indigo-600 border-slate-200'
                    }`}
                 >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                 </button>
              </div>
              <button 
                 onClick={() => {
                     synthesizeToAvatar(transcript);
                     setCurrentAnim("agree");
                     setTimeout(() => setCurrentAnim("idle"), 3000);
                 }}
                 className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-indigo-700 transition-colors shadow-md flex items-center"
              >
                 Synthesize
                 <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
              </button>
           </div>
        </div>
      </section>

    </div>
  );
}
