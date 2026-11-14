import { generate, project, model, publicError } from './gemini.js';
console.log(`Testing ADC with project ${project} and model ${model}…`);
try {
  console.log(await generate('Reply with exactly: Gemini connected.', 'This is a connection test.'));
} catch(error) {
  console.error(publicError(error));
  process.exitCode=1;
}
