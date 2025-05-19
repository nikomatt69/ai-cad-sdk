# Guida all'uso di AI-CAD-SDK

Questa guida completa ti aiuterà a integrare e utilizzare AI-CAD-SDK nei tuoi progetti e tramite l'interfaccia a linea di comando (CLI).

## Indice

1. [Installazione](#installazione)
2. [Guida rapida](#guida-rapida)
3. [Model-Completions-Protocol (MCP)](#model-completions-protocol-mcp)
4. [Interfaccia da linea di comando (CLI)](#interfaccia-da-linea-di-comando-cli)
5. [Funzionalità principali](#funzionalità-principali)
6. [Integrazione in applicazioni React](#integrazione-in-applicazioni-react)
7. [Configurazioni avanzate](#configurazioni-avanzate)
8. [Risoluzione problemi](#risoluzione-problemi)
9. [Best practices](#best-practices)

## Installazione

### Installazione globale (per CLI)

```bash
npm install -g ai-cad-sdk
```

### Installazione in un progetto

```bash
npm install ai-cad-sdk
```

## Guida rapida

### Inizializzazione base

```typescript
import aiCADSDK from 'ai-cad-sdk';

// Configurazione
aiCADSDK.configure({
  apiKey: 'your-api-key',
  defaultModel: 'claude-3-7-sonnet-20250219',
  mcpEnabled: true
});

// Inizializzazione
await aiCADSDK.initialize();

// Ottieni il servizio AI
const aiService = aiCADSDK.getAIService();
```

### Testo a CAD

```typescript
const response = await aiService.textToCAD({
  description: 'Una sedia moderna con quattro gambe e un design curvilineo',
  style: 'artistic',
  complexity: 'moderate'
});

if (response.success) {
  const elements = response.data;
  // Usa gli elementi CAD nella tua applicazione
}
```

### Analisi del design

```typescript
const analysisResponse = await aiService.analyzeDesign({
  elements: myCADElements,
  analysisType: 'manufacturability',
  materialContext: 'aluminum'
});

if (analysisResponse.success) {
  const analysis = analysisResponse.data;
  // Mostra l'analisi all'utente
}
```

## Model-Completions-Protocol (MCP)

Il Model-Completions-Protocol è una tecnologia chiave che ottimizza l'interazione con i modelli AI.

### Strategie di caching

```typescript
import { mcpConfigManager } from 'ai-cad-sdk';

// Imposta la strategia di caching
mcpConfigManager.setStrategy('balanced'); // 'aggressive', 'balanced', 'conservative'

// Personalizza la strategia
mcpConfigManager.updateStrategyConfig('balanced', {
  cacheStrategy: 'semantic', // 'exact', 'semantic', 'hybrid'
  minSimilarity: 0.8,        // Soglia di similarità (0.0 - 1.0)
  cacheTTL: 43200000         // Durata della cache in millisecondi (12 ore)
});
```

### Prioritizzazione delle richieste

```typescript
import { mcpService } from 'ai-cad-sdk';

// Alta priorità (richiesta interattiva dell'utente)
const result = await mcpService.enqueue(userRequest, 'high');

// Priorità normale
await mcpService.enqueue(standardRequest, 'normal');

// Bassa priorità (attività in background)
await mcpService.enqueue(backgroundTask, 'low');
```

### Routing intelligente tra provider AI

```typescript
// Abilita il multi-provider
mcpConfigManager.setMultiProviderEnabled(true);

// Imposta il provider preferito (opzionale)
mcpConfigManager.setPreferredProvider('CLAUDE'); // 'CLAUDE', 'OPENAI'

// Le richieste verranno indirizzate automaticamente al modello più adatto
```

### Richieste con metadati per la selezione automatica del modello

```typescript
const response = await aiService.generateContent({
  prompt: "Spiega come funzionano gli ingranaggi nei sistemi meccanici",
  metadata: {
    type: 'technical_explanation', // Tipo di attività
    complexity: 'medium',          // Complessità dell'attività
    requiresReasoning: true,       // Capacità richieste
    requiresFactual: true
  },
  useMCP: true
});
```

## Interfaccia da linea di comando (CLI)

L'SDK include una potente interfaccia a riga di comando:

### Comandi principali

```bash
# Test della connessione
ai-cad test

# Converti testo in elementi CAD
ai-cad text-to-cad --description "Una sedia moderna con design minimalista" --output chair.json

# Analisi del design
ai-cad analyze-design --input chair.json --type manufacturability --output analysis.json

# Configurazione MCP
ai-cad mcp-config
```

### Modalità interattiva

Tutti i comandi supportano una modalità interattiva. Basta eseguire il comando senza parametri:

```bash
ai-cad text-to-cad
```

### Esempi di uso della CLI

```bash
# Genera un modello 3D semplice
ai-cad text-to-cad -d "Un tavolo da caffè con gambe in metallo e piano in vetro" -s mechanical -c simple -o coffee-table.json

# Analizza un modello esistente per la produzione
ai-cad analyze-design -i mymodel.json -t manufacturability -m "plastic" -o analysis-report.json

# Configura il sistema MCP
ai-cad mcp-config -s balanced -m true -p CLAUDE
```

## Funzionalità principali

### 1. Conversione testo a CAD

```typescript
const response = await aiService.textToCAD({
  description: "Un orologio da parete con design Art Deco",
  constraints: {
    maxElements: 100,
    maxDimensions: { width: 400, height: 400, depth: 50 },
    preferredTypes: ["circle", "rectangle", "path"],
  },
  style: "artistic",
  complexity: "complex"
});
```

### 2. Analisi del design

```typescript
const analysisResponse = await aiService.analyzeDesign({
  elements: myCADElements,
  analysisType: "comprehensive", // structural, manufacturability, cost, performance, comprehensive
  materialContext: "steel",
  manufacturingMethod: "cnc milling",
  specificConcerns: ["weight", "durability"]
});
```

### 3. Ottimizzazione G-code

```typescript
const gcodeResponse = await aiService.optimizeGCode({
  gcode: myGCode,
  machineType: "cnc_mill",
  material: "aluminum",
  optimizationGoal: "quality", // speed, quality, toolLife, balanced
  constraints: {
    maxFeedRate: 500,
    maxSpindleSpeed: 10000
  }
});
```

### 4. Suggerimenti AI

```typescript
const suggestionsResponse = await aiService.generateSuggestions(
  "L'utente sta progettando un supporto per monitor con un braccio troppo sottile",
  "cad",
  {
    maxSuggestions: 3,
    suggestionsType: "improvement" // warning, improvement, optimization, alternative
  }
);
```

## Integrazione in applicazioni React

### Hook per Text-to-CAD

```typescript
import { useTextToCAD } from 'ai-cad-sdk/react';

function TextToCADComponent() {
  const { convert, loading, elements, error } = useTextToCAD();
  
  const handleConvert = async () => {
    await convert({
      description: "Un bicchiere con base solida e design moderno",
      style: "precise",
      complexity: "simple"
    });
  };
  
  return (
    <div>
      <button onClick={handleConvert} disabled={loading}>
        {loading ? 'Generazione in corso...' : 'Genera modello'}
      </button>
      
      {error && <div className="error">Errore: {error}</div>}
      
      {elements && (
        <div className="elements-preview">
          <h3>Elementi generati: {elements.length}</h3>
          {/* Visualizza gli elementi */}
        </div>
      )}
    </div>
  );
}
```

### Hook per l'analisi del design

```typescript
import { useDesignAnalysis } from 'ai-cad-sdk/react';

function DesignAnalysisComponent({ elements }) {
  const { analyze, loading, analysis, error } = useDesignAnalysis();
  
  const handleAnalyze = async () => {
    await analyze({
      elements,
      analysisType: "manufacturability",
      materialContext: "plastic"
    });
  };
  
  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analisi in corso...' : 'Analizza design'}
      </button>
      
      {error && <div className="error">Errore: {error}</div>}
      
      {analysis && (
        <div className="analysis-results">
          <h3>Risultati dell'analisi</h3>
          {/* Mostra i risultati dell'analisi */}
        </div>
      )}
    </div>
  );
}
```

## Configurazioni avanzate

### Configurazione completa dell'SDK

```typescript
aiCADSDK.configure({
  apiKey: 'your-api-key',
  defaultModel: 'claude-3-7-sonnet-20250219',
  maxTokens: 4000,
  temperature: 0.3,
  cacheEnabled: true,
  analyticsEnabled: true,
  allowBrowser: true,
  customPrompts: {
    textToCAD: "Crea un modello CAD basato su questa descrizione: {{description}}",
    designAnalysis: "Analizza questo design CAD: {{elements}}"
  },
  retryAttempts: 3,
  mcpEnabled: true,
  mcpEndpoint: '/api/ai/mcp',
  mcpStrategy: 'balanced',
  mcpCacheLifetime: 43200000, // 12 ore
  autoModelSelection: {
    enabled: true,
    preferredProvider: 'CLAUDE'
  },
  openaiApiKey: 'your-openai-api-key',
  openaiOrgId: 'your-org-id'
});
```

### Configurazione avanzata MCP

```typescript
// Configurazione manuale del servizio MCP
import { mcpService } from 'ai-cad-sdk';

// Configura le impostazioni
mcpService.setSemanticCacheEnabled(true);
mcpService.setSmartRoutingEnabled(true);
mcpService.setDefaultTTL(3600000); // 1 ora

// Ottieni le statistiche MCP
const mcpStats = await mcpService.getStats();
console.log('Statistiche MCP:', mcpStats);

// Utilizza direttamente il smart router
import { smartRouter } from 'ai-cad-sdk';

// Ottieni una raccomandazione per un modello
const bestModel = smartRouter.selectModel({
  taskType: 'code',
  complexityLevel: 'high',
  priority: 'quality',
  requiredCapabilities: ['reasoning', 'code']
});

// Stima i costi per una richiesta
const cost = smartRouter.estimateCost(
  'claude-3-7-sonnet-20250219',
  1000, // token input
  1500  // token output
);
```

### Gestione della cache

```typescript
import { aiCache } from 'ai-cad-sdk';

// Configura la cache
aiCache.setMaxSize(200); // Numero massimo di elementi in cache
aiCache.setTTL(7200000); // 2 ore di durata predefinita
aiCache.setPersistence(true); // Abilita la persistenza della cache

// Ottieni statistiche della cache
const cacheStats = aiCache.getStats();
console.log('Statistiche cache:', cacheStats);

// Pulisci la cache
aiCache.clear();
```

### Analytics e telemetria

```typescript
import { aiAnalytics } from 'ai-cad-sdk';

// Traccia un evento personalizzato
aiAnalytics.trackEvent({
  eventType: 'user_interaction',
  eventName: 'design_approved',
  success: true,
  metadata: {
    designId: '12345',
    approvalTime: Date.now()
  }
});

// Ottieni metriche di performance
const metrics = aiAnalytics.getMetrics();
console.log('Metriche di performance:', metrics);

// Ottieni eventi recenti
const recentEvents = aiAnalytics.getRecentEvents(10); // ultimi 10 eventi
console.log('Eventi recenti:', recentEvents);
```

## Risoluzione problemi

### Errori comuni e soluzioni

1. **Errore di autenticazione**
   
   ```
   Error: Authentication failed. Invalid API key.
   ```
   
   Soluzione: Verifica la tua chiave API nelle impostazioni e assicurati che sia attiva.

2. **Timeout della richiesta**
   
   ```
   Error: Request timeout
   ```
   
   Soluzione: Aumenta il timeout delle richieste nelle opzioni MCP o riduci la complessità della richiesta.

3. **Modello non disponibile**
   
   ```
   Error: Model 'xxx' is not available
   ```
   
   Soluzione: Utilizza uno dei modelli supportati o abilita il routing intelligente per la selezione automatica.

4. **Errori di parsing**
   
   ```
   Error: Failed to parse AI response
   ```
   
   Soluzione: Verifica che il formato dei dati sia corretto o modifica la funzione di parsing.

### Diagnostica

```typescript
// Abilita il logging dettagliato
import { setLogLevel } from 'ai-cad-sdk/utils';
setLogLevel('debug');

// Test della connessione
import { testConnection } from 'ai-cad-sdk/diagnostics';
const connectionStatus = await testConnection();
console.log('Stato connessione:', connectionStatus);

// Verifica delle capacità
import { checkCapabilities } from 'ai-cad-sdk/diagnostics';
const capabilities = await checkCapabilities();
console.log('Capacità disponibili:', capabilities);
```

## Best Practices

1. **Usa sempre MCP in produzione**
   
   ```typescript
   aiCADSDK.configure({
     mcpEnabled: true,
     mcpStrategy: 'balanced'
   });
   ```

2. **Fornisci metadati ricchi per le richieste**
   
   ```typescript
   const request = {
     prompt: "Descrizione dettagliata...",
     metadata: {
       type: 'design_description',
       complexity: 'medium',
       requiresReasoning: true
     }
   };
   ```

3. **Ottimizza la cache con TTL appropriati**
   
   - Contenuti statici: 24+ ore
   - Contenuti semi-dinamici: 6-12 ore
   - Contenuti dinamici: 30-60 minuti

4. **Gestisci le richieste in base alla priorità**
   
   - Alta: Interazioni dirette con l'utente
   - Normale: Richieste standard
   - Bassa: Attività in background e analisi

5. **Imposta una strategia MCP appropriata**
   
   - Aggressive: Ottimizza per velocità e efficienza
   - Balanced: Bilanciamento tra qualità e velocità
   - Conservative: Ottimizza per precisione e qualità

6. **Usa l'API analitica per monitorare e ottimizzare**
   
   ```typescript
   // Controlla regolarmente le metriche
   const metrics = aiAnalytics.getMetrics();
   
   // Ottimizza in base ai risultati
   if (metrics.averageResponseTime > 2000) {
     mcpConfigManager.setStrategy('aggressive');
   }
   ```

7. **Implementa gestione degli errori robusta**
   
   ```typescript
   try {
     const response = await aiService.textToCAD(request);
     // Gestisci risposta
   } catch (error) {
     // Log dell'errore
     console.error('Errore AI-CAD:', error);
     
     // Fallback
     if (error.code === 'TIMEOUT') {
       // Riprova con parametri semplificati
     }
   }
   ```

Con questa guida completa, dovresti essere in grado di utilizzare al meglio AI-CAD-SDK nel tuo progetto. Per ulteriori dettagli, consulta la documentazione API completa o i repository di esempi.
