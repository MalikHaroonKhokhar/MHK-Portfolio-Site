import { useState, useCallback } from 'react';

export interface TerminalEntry {
    type: 'input' | 'output';
    content: React.ReactNode;
    id: string;
}

export function useTerminal() {
    const [history, setHistory] = useState<TerminalEntry[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const clear = useCallback(() => {
        setHistory([]);
    }, []);

    const print = useCallback((content: React.ReactNode) => {
        setHistory(prev => [
            ...prev,
            { type: 'output', content, id: Math.random().toString(36).substring(7) }
        ]);
    }, []);

    const executeCommand = useCallback(
        async (cmdRaw: string, commandProcessor: (cmd: string, args: string[]) => Promise<React.ReactNode> | React.ReactNode) => {
            const trimmed = cmdRaw.trim();
            if (!trimmed) return;

            // Add user input to history
            setHistory(prev => [
                ...prev,
                { type: 'input', content: trimmed, id: Math.random().toString(36).substring(7) }
            ]);

            const [cmd, ...args] = trimmed.split(' ');

            setIsTyping(true);
            try {
                const result = await Promise.resolve(commandProcessor(cmd.toLowerCase(), args));
                if (result !== null) {
                    print(result);
                }
            } catch (err: any) {
                print(<div className="text-red-500" > Error: {(err as Error).message} </div>);
} finally {
    setIsTyping(false);
}
    },
[print]
  );

return {
    history,
    isTyping,
    executeCommand,
    clear,
    print,
};
}
