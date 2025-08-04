import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Calculator, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Focus input when calculator opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Global keyboard shortcut to open calculator (Ctrl/Cmd + Shift + C)
  useEffect(() => {
    const handleGlobalKeyPress = (e: any) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setIsOpen(true);
        setIsMinimized(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: any) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const evaluateExpression = (expr: string) => {
    try {
      // Basic math expression evaluation
      // Support for basic operations: +, -, *, /, %, ^, sqrt, sin, cos, tan, log
      let processedExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Add implicit multiplication for cases like "2(3+4)" -> "2*(3+4)"
      processedExpr = processedExpr.replace(/(\d)\(/g, '$1*(');
      processedExpr = processedExpr.replace(/\)(\d)/g, ')*$1');

      // Evaluate the expression safely
      const result = Function(`"use strict"; return (${processedExpr})`)();
      
      if (typeof result === 'number' && !isNaN(result)) {
        return result.toString();
      }
      return '';
    } catch (error) {
      return '';
    }
  };

  const handleInputChange = (value: string) => {
    setExpression(value);
    const evaluated = evaluateExpression(value);
    setResult(evaluated);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && expression && result) {
      const entry = `${expression} = ${result}`;
      setHistory(prev => [entry, ...prev.slice(0, 9)]);
      setExpression(result);
      setResult('');
      e.preventDefault();
    }
  };

  const insertFromHistory = (entry: string) => {
    const value = entry.split(' = ')[1];
    setExpression(value);
    setResult('');
    inputRef.current?.focus();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
        title="Open Calculator (Ctrl+Shift+C)"
      >
        <Calculator className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div
      ref={calculatorRef}
      className={cn(
        "fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-all",
        isMinimized ? "w-12 h-12" : "w-80"
      )}
    >
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <Calculator className="h-5 w-5 text-purple-600" />
        </button>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Calculator</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Calculator Body */}
          <div className="p-4">
            {/* Input Field */}
            <div className="mb-4">
              <input
                ref={inputRef}
                type="text"
                value={expression}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your calculation..."
                className="w-full px-3 py-2 text-lg border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800"
                autoComplete="off"
              />
              {result && (
                <div className="mt-2 text-right text-xl font-semibold text-purple-600 dark:text-purple-400">
                  = {result}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-1 mb-4">
              {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => {
                    if (btn === '=') {
                      if (expression && result) {
                        const entry = `${expression} = ${result}`;
                        setHistory(prev => [entry, ...prev.slice(0, 9)]);
                        setExpression(result);
                        setResult('');
                      }
                    } else {
                      handleInputChange(expression + btn);
                    }
                  }}
                  className={cn(
                    "h-10 rounded text-sm font-medium transition-colors",
                    btn === '=' 
                      ? "bg-purple-600 text-white hover:bg-purple-700 col-span-1"
                      : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  {btn}
                </button>
              ))}
            </div>

            {/* Functions */}
            <div className="grid grid-cols-4 gap-1 mb-4">
              {['sqrt(', 'sin(', 'cos(', '^', '(', ')', 'π', 'C'].map((fn) => (
                <button
                  key={fn}
                  onClick={() => {
                    if (fn === 'C') {
                      setExpression('');
                      setResult('');
                    } else {
                      handleInputChange(expression + fn);
                    }
                  }}
                  className="h-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs font-medium transition-colors"
                >
                  {fn}
                </button>
              ))}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">History</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {history.map((entry, index) => (
                    <button
                      key={index}
                      onClick={() => insertFromHistory(entry)}
                      className="w-full text-left text-xs px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Press Enter to calculate • Esc to close
            </div>
          </div>
        </>
      )}
    </div>
  );
}