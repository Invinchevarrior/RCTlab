// GlobalChatManager.js - global AI chat manager
// can be used on all pages, manage chat window state

import React, { useState, useEffect } from 'react';
import Chat from './Chat';

const GlobalChatManager = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  // listen to global chat button click event
  useEffect(() => {
    const handleGlobalChatToggle = () => {
      if (isChatMinimized) {
        // if minimized, restore window
        setIsChatMinimized(false);
        setIsChatVisible(true);
      } else if (isChatVisible) {
        // if window is visible, hide window
        setIsChatVisible(false);
      } else {
        // if window is hidden, show window
        setIsChatVisible(true);
      }
    };

    // add global event listener
    window.addEventListener('globalChatToggle', handleGlobalChatToggle);

    return () => {
      window.removeEventListener('globalChatToggle', handleGlobalChatToggle);
    };
  }, [isChatVisible, isChatMinimized]);

  // handle chat window close
  const handleChatClose = () => {
    setIsChatVisible(false);
    setIsChatMinimized(false);
  };

  // handle chat window minimize
  const handleChatMinimize = (minimized) => {
    setIsChatMinimized(minimized);
    if (minimized) {
      setIsChatVisible(false);
    } else {
      setIsChatVisible(true);
    }
  };

  // code generation callback
  const handleCodeGenerated = (codeData) => {
    // here can add global code processing logic
    console.log('Code generated globally:', codeData);
    
    // can send event to current page, let page handle code
    window.dispatchEvent(new CustomEvent('codeGenerated', { 
      detail: codeData 
    }));
  };

  return (
    <>
      {(isChatVisible || isChatMinimized) && (
        <Chat
          isVisible={isChatVisible}
          isMinimized={isChatMinimized}
          onClose={handleChatClose}
          onMinimize={handleChatMinimize}
          onCodeGenerated={handleCodeGenerated}
        />
      )}
    </>
  );
};

export default GlobalChatManager;
