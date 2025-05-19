import React, { useState } from 'react';
import { AIProvider, AIAssistant, useAICAD } from '@ai-cad-sdk/react';

// Sample React component showing AI CAD SDK integration
function App() {
  return (
    <AIProvider
      config={{
        apiKeys: {
          claude: process.env.REACT_APP_CLAUDE_API_KEY || '',
          openai: process.env.REACT_APP_OPENAI_API_KEY || '',
        },
        defaultModel: 'claude-3-7-sonnet-20250219',
        cache: { enabled: true },
      }}
    >
      <div className="app">
        <header className="app-header">
          <h1>AI CAD SDK React Example</h1>
        </header>
        <div className="app-content">
          <TextToCADDemo />
          <AIAssistantDemo />
        </div>
      </div>
    </AIProvider>
  );
}

// Demo component for Text-to-CAD functionality
function TextToCADDemo() {
  const { textToCAD, isProcessing } = useAICAD();
  const [description, setDescription] = useState('');
  const [elements, setElements] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await textToCAD(description, {
        style: 'precise',
        complexity: 'moderate',
      });

      if (result.success && result.data) {
        setElements(result.data);
      } else {
        setError(result.error || 'Failed to generate CAD elements');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="demo-section">
      <h2>Text to CAD Converter</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Describe your 3D model:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g., A simple chair with four legs and a backrest"
            rows={4}
            className="form-control"
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={isProcessing || !description}
        >
          {isProcessing ? 'Generating...' : 'Generate CAD Elements'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {elements.length > 0 && (
        <div className="results">
          <h3>Generated Elements ({elements.length})</h3>
          <div className="elements-container">
            {elements.slice(0, 5).map((element, index) => (
              <div key={element.id || index} className="element-card">
                <h4>{element.type}</h4>
                <div className="element-properties">
                  <p>
                    Position: x={element.x}, y={element.y}, z={element.z}
                  </p>
                  {element.width && (
                    <p>
                      Dimensions: {element.width}x{element.height}x
                      {element.depth}
                    </p>
                  )}
                  {element.radius && <p>Radius: {element.radius}</p>}
                  <p>
                    Color:{' '}
                    <span
                      className="color-swatch"
                      style={{ backgroundColor: element.color }}
                    ></span>{' '}
                    {element.color}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Demo component for AI Assistant functionality
function AIAssistantDemo() {
  const [showAssistant, setShowAssistant] = useState(false);

  return (
    <div className="demo-section">
      <h2>AI Assistant</h2>
      <button
        className="btn-secondary"
        onClick={() => setShowAssistant(!showAssistant)}
      >
        {showAssistant ? 'Hide Assistant' : 'Show Assistant'}
      </button>

      {showAssistant && (
        <AIAssistant
          initialMessage="Hello! I'm your CAD/CAM assistant. How can I help you today?"
          context="CAD/CAM design and manufacturing"
          actions={['generateCADElement', 'analyzeDesign']}
        />
      )}
    </div>
  );
}

export default App;
