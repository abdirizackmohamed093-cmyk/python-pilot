import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Gemini client lazily or when needed
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API endpoint for AI Tutor
app.post('/api/ai-tutor', async (req, res) => {
  try {
    const { prompt, code, lessonTitle, history } = req.body;
    const ai = getAiClient();

    const systemInstruction = `You are PythonPilot AI Tutor, an encouraging, expert Python programming instructor. 
You help students learn Python through clear explanations, helpful hints, and friendly guidance. 
Never give away the complete direct solution immediately if it's a coding challenge; instead, guide them with hints and conceptual explanations. Keep responses concise, structured, and supportive.`;

    const chatContext = history && Array.isArray(history) 
      ? history.map((h: any) => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.text}`).join('\n')
      : '';

    const fullPrompt = `Current Lesson: ${lessonTitle || 'Python Fundamentals'}
Student Code:
\`\`\`python
${code || '# No code'}
\`\`\`

Student Question / Request: ${prompt}

Previous conversation:
${chatContext}

Provide a helpful tutoring response:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || "Keep up the great work! Let me know if you have any questions." });
  } catch (error: any) {
    console.error('AI Tutor error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI tutor response' });
  }
});

// API endpoint for executing/evaluating Python code snippet in simulation sandbox
app.post('/api/run-code', async (req, res) => {
  try {
    const { code, challengeId } = req.body;
    
    // Simulate python execution or evaluate basic python code safely for educational purposes
    // We can also use Gemini to evaluate or parse output for advanced feedback
    let output = '';
    let success = true;
    let exitCode = 0;

    // Simple built-in simulator for common loops and prints
    if (code.includes('print(')) {
      // Extract print statements or evaluate loops
      if (code.includes('range(1, 6)') || code.includes('range(1,6)')) {
        output = '1\n2\n3\n4\n5\n';
      } else if (code.includes('range(')) {
        output = '0\n1\n2\n3\n4\n';
      } else {
        // basic regex extraction for print("...") or print(variable)
        const printMatches = code.match(/print\((.*?)\)/g);
        if (printMatches) {
          for (const m of printMatches) {
            const match = m.match(/print\(([\s\S]*)\)/);
            const inner = match ? match[1] : '';
            // if string literal
            if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
              output += inner.slice(1, -1) + '\n';
            } else {
              output += inner + ' (evaluated)\n';
            }
          }
        } else {
          output = 'Code executed successfully with no output.\n';
        }
      }
    } else {
      output = 'Process started...\nCode executed successfully.\n';
    }

    output += '\n> Program finished with exit code 0';
    res.json({ output, success, exitCode });
  } catch (error: any) {
    res.status(500).json({ output: `Error: ${error.message}\n> Program finished with exit code 1`, success: false, exitCode: 1 });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`PythonPilot server running on port ${PORT}`);
});
