import Groq from 'groq-sdk';

let _groq: Groq | null = null;

export function groq() {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        'GROQ_API_KEY is not set. Add it to .env.local — get a free key at https://console.groq.com/keys'
      );
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
