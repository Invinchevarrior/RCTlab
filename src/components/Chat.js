// Chat.js - AI powered chat window using Hugging Face API
// Author: [Your Name]
// Note: Replace YOUR_HF_API_KEY with your actual Hugging Face API token

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Chat.css';

const Chat = ({ onCodeGenerated, isVisible, isMinimized, onClose, onMinimize }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // window position and size
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // save window state for minimize and restore
  const [savedPosition, setSavedPosition] = useState(null);
  const [savedSize, setSavedSize] = useState(null);
  
  const chatRef = useRef(null);
  const headerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const resizeHandleRef = useRef(null);

  // Hugging Face API key
  const HF_API_KEY = ""; // Replace with your key
  
  // Hugging Face supported model list
  const MODEL_IDS = [
    "openai/gpt-oss-120b:cerebras", // recommended model by Hugging Face
    "meta-llama/Llama-2-70b-chat-hf", // Llama 2 70B model
    "microsoft/DialoGPT-medium", // dialog model
    "gpt2" // general model, backup option
  ];

  // drag related functions
  const handleMouseDown = (e) => {
    if (e.target === headerRef.current) {
      setIsDragging(true);
      const rect = chatRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // minimize/restore window
  const handleMinimize = () => {
    if (!isMinimized) {
      // save current window state when minimizing
      setSavedPosition({ ...position });
      setSavedSize({ ...size });
      if (onMinimize) {
        onMinimize(true);
      }
    } else {
      // restore with saved state
      if (savedPosition) {
        setPosition(savedPosition);
      }
      if (savedSize) {
        setSize(savedSize);
      }
      if (onMinimize) {
        onMinimize(false);
      }
    }
  };

  // close window
  const handleClose = () => {
    // clear all chat records when closing
    setMessages([]);
    setInput('');
    // reset window state to default
    setPosition({ x: 100, y: 100 });
    setSize({ width: 400, height: 600 });
    setSavedPosition(null);
    setSavedSize(null);
    if (onClose) {
      onClose();
    }
  };

  // size adjustment related functions
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    const rect = chatRef.current.getBoundingClientRect();
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height
    });
  };

  const handleResizeMove = useCallback((e) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(320, Math.min(800, resizeStart.width + deltaX));
      const newHeight = Math.max(450, Math.min(800, resizeStart.height + deltaY));
      
      setSize({ width: newWidth, height: newHeight });
    }
  }, [isResizing, resizeStart]);

  //const handleResizeEnd = useCallback(() => {
    //setIsResizing(false);
  //}, []);

  // auto scroll to latest message
  //const scrollToBottom = () => {
    //messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //};

  // auto scroll when message updated
  //useEffect(() => {
    //scrollToBottom();
  //}, [messages]);

  // add global mouse event listener
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', isDragging ? handleMouseMove : handleResizeMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', isDragging ? handleMouseMove : handleResizeMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp, handleResizeMove]);

  // restore saved state when chat window is reopened
  useEffect(() => {
    if (isVisible && !isMinimized && (savedPosition || savedSize)) {
      // delay restore, ensure DOM is rendered
      const timer = setTimeout(() => {
        if (savedPosition) {
          setPosition(savedPosition);
        }
        if (savedSize) {
          setSize(savedSize);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, isMinimized, savedPosition, savedSize]);

    // ensure state sync when restoring from minimized state
  useEffect(() => {
    if (isVisible && !isMinimized && savedPosition && savedSize) {
      // immediately restore saved state
      setPosition(savedPosition);
      setSize(savedSize);
    }
  }, [isVisible, isMinimized, savedPosition, savedSize]);

  // Function to send prompt to Hugging Face API using official format
  const sendPrompt = async (prompt) => {
    const systemPrompt = `You are a helpful AI assistant. You can help with various topics including:
- General questions and discussions
- Code generation and programming help
- Writing and creative tasks
- Problem solving and analysis
- And much more!

Please provide helpful, accurate, and engaging responses. If the user asks for code, you can provide it in a clear format. Otherwise, just have a natural conversation.`;

    // try multiple models until success
    for (const modelId of MODEL_IDS) {
      try {
        console.log(`Trying model: ${modelId}`);
        
        // use official recommended API endpoint and format
        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: prompt
              }
            ],
            model: modelId,
            max_tokens: 2000,
            temperature: 0.7,
            top_p: 0.9
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`Model ${modelId} failed:`, response.status, errorText);
          
          // if 404 error, try next model
          if (response.status === 404) {
            continue;
          }
          
          // other errors, throw exception
          throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`Model ${modelId} response:`, data);
        
        // extract content based on official API response format
        let content = "";
        if (data.choices && data.choices.length > 0) {
          content = data.choices[0].message?.content || "";
        } else if (data.generated_text) {
          content = data.generated_text;
        } else if (data.text) {
          content = data.text;
        } else {
          content = JSON.stringify(data);
        }

        if (!content || content.trim() === "") {
          throw new Error("Empty response from model");
        }

        console.log("Raw content from model:", content);
        return content;

      } catch (error) {
        console.log(`Model ${modelId} error:`, error.message);
        
        // if last model, throw error
        if (modelId === MODEL_IDS[MODEL_IDS.length - 1]) {
          throw new Error(`All models failed. Last error: ${error.message}`);
        }
        
        // otherwise, try next model
        continue;
      }
    }
    
    throw new Error("All available models failed to generate response");
  };

  // Handle sending message
  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await sendPrompt(input);
      
      // check if contains code block, if so, try to extract
      let codeData = null;
      if (aiResponse.includes('```html') || aiResponse.includes('```css') || aiResponse.includes('```javascript') || aiResponse.includes('```js')) {
        try {
          codeData = extractCodeFromResponse(aiResponse);
        } catch (e) {
          console.log("Code extraction failed:", e);
        }
      }

      const aiMessage = {
        text: aiResponse,
        sender: 'ai',
        code: codeData
      };
      
      setMessages([...newMessages, aiMessage]);
      
      // if code extracted, send to main application
      if (codeData && onCodeGenerated) {
        onCodeGenerated(codeData);
      }
      
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([...newMessages, { 
        text: `Error: ${err.message}`, 
        sender: 'ai', 
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // function to extract code from AI response (optional)
  const extractCodeFromResponse = (response) => {
    console.log("Extracting code from response:", response);
    
    const htmlMatch = response.match(/```html\s*([\s\S]*?)\s*```/i);
    const cssMatch = response.match(/```css\s*([\s\S]*?)\s*```/i);
    const jsMatch = response.match(/```(?:javascript|js)\s*([\s\S]*?)\s*```/i);

    console.log("HTML match:", htmlMatch);
    console.log("CSS match:", cssMatch);
    console.log("JS match:", jsMatch);

    if (htmlMatch || cssMatch || jsMatch) {
      const result = {
        html: htmlMatch ? htmlMatch[1].trim() : '',
        css: cssMatch ? cssMatch[1].trim() : '',
        js: jsMatch ? jsMatch[1].trim() : ''
      };
      
      console.log("Extracted code result:", result);
      return result;
    }
    
    console.log("No code blocks found");
    return null;
  };

  // Helper function to extract text content from a string, excluding code blocks
  const extractTextContent = (text, codeData) => {
    if (!codeData) {
      return text;
    }

    console.log("Extracting text content from:", text);
    console.log("Code data:", codeData);

    let content = text;
    
    // remove HTML code block
    if (codeData.html) {
      const htmlPattern = /```html\s*([\s\S]*?)\s*```/gi;
      content = content.replace(htmlPattern, '').trim();
    }
    
        // remove CSS code block
    if (codeData.css) {
      const cssPattern = /```css\s*([\s\S]*?)\s*```/gi;
      content = content.replace(cssPattern, '').trim();
    }
    
    // remove JavaScript code block
    if (codeData.js) {
      const jsPattern = /```(?:javascript|js)\s*([\s\S]*?)\s*```/gi;
      content = content.replace(jsPattern, '').trim();
    }
    
    // clean up extra empty lines and spaces
    content = content.replace(/\n\s*\n/g, '\n').trim();
    
    console.log("Extracted text content:", content);
    return content || "AI generated response with code blocks.";
  };

  // format markdown text, convert to visual content
  const formatMarkdownText = (text) => {
    if (!text) return '';
    
    // handle table
    let formattedText = text;
    
    // check table format and convert
    if (text.includes('|') && text.includes('---')) {
      formattedText = convertMarkdownTable(text);
    } else {
      // handle title
      formattedText = text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        
        // handle bold and italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        
        // handle code line
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        
        // handle link
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        
        // handle list
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        
          // handle separator
        .replace(/^---$/gim, '<hr>')
        
        // handle line break - more intelligent line break handling
        .replace(/\n\n/g, '</p><p>') // double line break as paragraph separator
        .replace(/\n/g, '<br>'); // single line break as line break
      
      // wrap paragraph
      formattedText = '<p>' + formattedText + '</p>';
      
      // wrap list item
      if (formattedText.includes('<li>')) {
        formattedText = formattedText.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
      }
      
      // clean up empty paragraph tags
      formattedText = formattedText.replace(/<p><\/p>/g, '');
      formattedText = formattedText.replace(/<p><br><\/p>/g, '');
    }
    
    return formattedText;
  };

  // convert markdown table to HTML table
  const convertMarkdownTable = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    let tableHtml = '<div class="markdown-table-container"><table class="markdown-table">';
    
    lines.forEach((line, index) => {
      if (line.includes('|')) {
        if (line.includes('---')) {
          // skip separator line
          return;
        }
        
        const cells = line.split('|').filter(cell => cell.trim());
        if (cells.length > 0) {
          const tag = index === 0 ? 'th' : 'td';
          tableHtml += '<tr>';
          cells.forEach(cell => {
            const trimmedCell = cell.trim();
            if (trimmedCell) {
              tableHtml += `<${tag}>${trimmedCell}</${tag}>`;
            }
          });
          tableHtml += '</tr>';
        }
      }
    });
    
    tableHtml += '</table></div>';
    return tableHtml;
  };

  // if window is not visible, do not render
  if (!isVisible) {
    return null;
  }

  // if minimized, only show title bar
  if (isMinimized) {
    return (
      <div 
        className="chat-window chat-window-minimized"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px` 
        }}
        ref={chatRef}
      >
        <div className="chat-header" ref={headerRef} onMouseDown={handleMouseDown}>
          <div className="chat-title">AI Chat</div>
          <div className="chat-controls">
            <button className="chat-control-btn minimize-btn" onClick={handleMinimize}>
              <span>−</span>
            </button>
            <button className="chat-control-btn close-btn" onClick={handleClose}>
              <span>×</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

    return (
          <div 
        className={`chat-window ${isResizing ? 'resizing' : ''}`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`
        }}
        ref={chatRef}
      >
      <div className="chat-header" ref={headerRef} onMouseDown={handleMouseDown}>
        <div className="chat-title">AI Chat</div>
        <div className="chat-controls">
          <button className="chat-control-btn minimize-btn" onClick={handleMinimize}>
            <span>−</span>
          </button>
          <button className="chat-control-btn close-btn" onClick={handleClose}>
            <span>×</span>
          </button>
        </div>
      </div>
      
    <div className="chat-container">
      <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender} ${msg.isError ? 'isError' : ''}`}>
                             {/* user message display */}
               {msg.sender === 'user' && (
                 <div className="message-content user-message-content">
                   <div className="message-text" contentEditable="true" suppressContentEditableWarning={true}>
                     {msg.text}
                   </div>
                   <div className="message-actions">
                     <button 
                       className="copy-btn" 
                       onClick={() => navigator.clipboard.writeText(msg.text)}
                       title="Copy message"
                     >
                       <span role="img" aria-label="Copy">📋</span>
                     </button>
                   </div>
                 </div>
               )}
              
              {/* AI message display */}
              {msg.sender === 'ai' && (
                <div className="message-content ai-message-content">
                  {/* if contains code block, display text and code separately */}
                  {msg.code ? (
                    <>
                                             {/* display text without code */}
                       <div 
                         className="ai-text-content" 
                         contentEditable="true" 
                         suppressContentEditableWarning={true}
                         dangerouslySetInnerHTML={{ __html: formatMarkdownText(extractTextContent(msg.text, msg.code)) }}
                       />
                      
                      {/* display code block */}
              <div className="code-blocks">
                                                 {msg.code.html && (
                           <>
                             <div className="code-label">
                               <strong>HTML</strong>
                               <button 
                                 className="copy-code-btn" 
                                 onClick={() => navigator.clipboard.writeText(msg.code.html)}
                                 title="Copy HTML code"
                               >
                                 <span role="img" aria-label="Copy">📋</span>
                               </button>
                             </div>
                             <pre className="code-block html-code"><code>{msg.code.html}</code></pre>
                           </>
                         )}
                         {msg.code.css && (
                           <>
                             <div className="code-label">
                               <strong>CSS</strong>
                               <button 
                                 className="copy-code-btn" 
                                 onClick={() => navigator.clipboard.writeText(msg.code.css)}
                                 title="Copy CSS code"
                               >
                                 <span role="img" aria-label="Copy">📋</span>
                               </button>
                             </div>
                             <pre className="code-block css-code"><code>{msg.code.css}</code></pre>
                           </>
                         )}
                         {msg.code.js && (
                           <>
                             <div className="code-label">
                               <strong>JavaScript</strong>
                               <button 
                                 className="copy-code-btn" 
                                 onClick={() => navigator.clipboard.writeText(msg.code.js)}
                                 title="Copy JavaScript code"
                               >
                                 <span role="img" aria-label="Copy">📋</span>
                               </button>
                             </div>
                             <pre className="code-block js-code"><code>{msg.code.js}</code></pre>
                           </>
                         )}
                      </div>
                    </>
                  ) : (
                                         /* if no code block, display text directly */
                     <div 
                       className="ai-text-content" 
                       contentEditable="true" 
                       suppressContentEditableWarning={true}
                       dangerouslySetInnerHTML={{ __html: formatMarkdownText(msg.text) }}
                     />
                  )}
                  
                  <div className="message-actions">
                    <button 
                      className="copy-btn" 
                      onClick={() => navigator.clipboard.writeText(msg.text)}
                      title="Copy message"
                    >
                      <span role="img" aria-label="Copy">📋</span>
                    </button>
                  </div>
              </div>
            )}
          </div>
        ))}
           {isLoading && <div className="loading">AI is thinking...</div>}
           <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
          <div className="input-container">
                         <textarea
          value={input}
               placeholder="Ask me anything..."
          onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSend();
                 }
               }}
               rows={1}
               className="chat-textarea"
               ref={(el) => {
                 if (el) {
                   // auto adjust height
                   el.style.height = 'auto';
                   el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                 }
               }}
               onInput={(e) => {
                  // real-time adjust height
                 const el = e.target;
                 el.style.height = 'auto';
                 el.style.height = Math.min(el.scrollHeight, 120) + 'px';
               }}
             />
            <button onClick={handleSend} disabled={isLoading} className="send-button">
              {isLoading ? 'Thinking...' : 'Send'}
            </button>
          </div>
                 </div>
         
         {/* size adjustment handle */}
         <div 
           className="resize-handle"
           ref={resizeHandleRef}
           onMouseDown={handleResizeStart}
           title="Drag to resize"
         >
           <span role="img" aria-label="Resize">⤡</span>
         </div>
      </div>
    </div>
  );
};

export default Chat;
