import { z } from 'zod';
import { Tool } from '../types';

const inputSchema = z.object({
  expression: z.string().describe('The mathematical expression to evaluate'),
});

type Input = z.infer<typeof inputSchema>;

/**
 * Very basic, safe mathematical expression parser and evaluator.
 * No `eval()` or `Function()` allowed.
 */
function evaluateMath(expression: string): number {
  // To keep it simple but safe, we implement a basic recursive descent parser.
  // This is a minimal implementation supporting +, -, *, /, (), and basic functions.
  
  let pos = 0;
  const tokens = expression.match(/(\d+\.\d+|\d+|[a-zA-Z]+|[+\-*/^()])/g) || [];

  function peek() {
    return tokens[pos];
  }

  function consume() {
    return tokens[pos++];
  }

  function parsePrimary(): number {
    const token = consume();
    if (!token) throw new Error('Unexpected end of expression');
    
    if (token === '(') {
      const val = parseExpression();
      if (consume() !== ')') throw new Error('Expected )');
      return val;
    }

    if (token.match(/^\d/)) {
      return parseFloat(token);
    }

    if (token.match(/^[a-zA-Z]+$/)) {
      const lower = token.toLowerCase();
      if (lower === 'pi') return Math.PI;
      if (lower === 'e') return Math.E;
      
      if (consume() !== '(') throw new Error(`Expected ( after function ${token}`);
      const val = parseExpression();
      if (consume() !== ')') throw new Error(`Expected ) after function ${token} argument`);
      
      switch (lower) {
        case 'sin': return Math.sin(val);
        case 'cos': return Math.cos(val);
        case 'tan': return Math.tan(val);
        case 'log': return Math.log(val);
        case 'sqrt': return Math.sqrt(val);
        case 'abs': return Math.abs(val);
        default: throw new Error(`Unknown function: ${token}`);
      }
    }
    
    throw new Error(`Unexpected token: ${token}`);
  }

  function parseFactor(): number {
    const token = peek();
    if (token === '-' || token === '+') {
      consume();
      const val = parseFactor();
      return token === '-' ? -val : val;
    }
    
    let left = parsePrimary();
    
    while (peek() === '^') {
      consume();
      left = Math.pow(left, parseFactor()); // Right-associative
    }
    
    return left;
  }

  function parseTerm(): number {
    let left = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const right = parseFactor();
      if (op === '*') left *= right;
      else if (op === '/') left /= right;
    }
    return left;
  }

  function parseExpression(): number {
    let left = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const right = parseTerm();
      if (op === '+') left += right;
      else if (op === '-') left -= right;
    }
    return left;
  }

  if (tokens.length === 0) return 0;
  const result = parseExpression();
  if (pos < tokens.length) throw new Error('Unexpected tokens at end of expression');
  return result;
}

/**
 * Calculator tool for safe mathematical evaluation.
 */
export const calculatorTool: Tool<Input, { result: number; expression: string }> = {
  name: 'calculator',
  description: 'Safely evaluates basic mathematical expressions (supports +, -, *, /, ^, sin, cos, sqrt, log, etc.).',
  permissionScope: 'read_only',
  inputSchema,
  execute: async (input) => {
    const result = evaluateMath(input.expression);
    return {
      result,
      expression: input.expression,
    };
  },
};
