import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Folder, Mail } from 'lucide-react';
import { useTerminal } from '../hooks/useTerminal';
import clsx from 'clsx';

// Simulated terminal mock
type TerminalLayoutProps = {
    processCommand: (cmd: string, args: string[]) => Promise<React.ReactNode> | React.ReactNode;
    welcomeMessage: React.ReactNode;
};

export function TerminalLayout({ processCommand, welcomeMessage }: TerminalLayoutProps) {
    const { history, executeCommand, clear } = useTerminal();
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [isFocused, setIsFocused] = useState(true);

    const handleTerminalClick = () => {
        inputRef.current?.focus();
        setIsFocused(true);
    };

    useEffect(() => {
        // Scroll to bottom on new history
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const hasRunInitialCommand = useRef(false);

    useEffect(() => {
        // Initial welcome message (can be managed by parent)
        if (!hasRunInitialCommand.current) {
            hasRunInitialCommand.current = true;
            executeCommand('help', processCommand);
        }
    }, [executeCommand, processCommand]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const commands = ['help', 'whoami', 'ls projects', 'open project', 'cat experience', 'cat education', 'cat resume', 'sudo contact', 'clear'];
            const match = commands.find(c => c.startsWith(input.toLowerCase()));
            if (match) {
                setInput(match);
            }
        } else if (e.key === 'Enter') {
            if (input.trim() === 'clear') {
                clear();
                setInput('');
                return;
            }
            executeCommand(input, processCommand);
            setInput('');
        }
    };

    return (
        <div className="flex h-screen w-screen bg-[#111111] overflow-hidden text-[#c5c6c7] font-mono text-sm">
            {/* Sidebar */}
            <div className="w-64 border-r border-[#333] hidden md:flex flex-col bg-[#0d0e12]">
                <div className="p-4 flex gap-2 border-b border-[#333]">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>

                <div className="p-6 flex-1">
                    <h3 className="text-[#555] text-xs font-bold tracking-widest mb-4">SYSTEM ALIASES</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-[#c5c6c7] hover:text-green-400 cursor-pointer transition-colors" onClick={() => executeCommand('whoami', processCommand)}>
                            <Home className="w-4 h-4 text-green-500" /> ./home
                        </li>
                        <li className="flex items-center gap-3 text-[#c5c6c7] hover:text-green-400 cursor-pointer transition-colors" onClick={() => executeCommand('cat resume', processCommand)}>
                            <User className="w-4 h-4 text-gray-400" /> ./about
                        </li>
                        <li className="flex items-center gap-3 text-[#c5c6c7] hover:text-green-400 cursor-pointer transition-colors" onClick={() => executeCommand('ls projects', processCommand)}>
                            <Folder className="w-4 h-4 text-gray-400" /> ./projects
                        </li>
                        <li className="flex items-center gap-3 text-[#c5c6c7] hover:text-green-400 cursor-pointer transition-colors" onClick={() => executeCommand('sudo contact', processCommand)}>
                            <Mail className="w-4 h-4 text-gray-400" /> ./contact
                        </li>
                    </ul>
                </div>

                <div className="p-4 border-t border-[#333] m-4 border border-dashed rounded text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-gray-500">Status:</span> <span className="text-green-400">Online</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Uptime:</span> <span className="text-gray-300">12 days</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">CPU:</span> <span className="text-gray-300">14%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Memory:</span> <span className="text-gray-300">4.2GB</span></div>
                </div>
            </div>

            {/* Main Terminal Window */}
            <div
                className="flex-1 flex flex-col relative overflow-hidden"
                onClick={handleTerminalClick}
            >
                {/* Top bar for mobile or just title */}
                <div className="h-12 border-b border-[#333] flex items-center justify-between px-4 bg-[#0d0e12]">
                    <div className="flex gap-2 md:hidden">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-gray-400 text-xs flex-1 text-center font-sans tracking-wide">
                        portfolio@admin: ~
                    </div>
                    <div className="text-gray-500 text-xs hidden md:block group-hover:block transition-opacity">bash</div>
                </div>

                {/* Terminal Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto w-full">
                        {welcomeMessage}

                        {history.map((entry) => (
                            <div key={entry.id} className="mb-4 animate-fade-in">
                                {entry.type === 'input' ? (
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-green-400">root@portfolio:~$</span>
                                        <span className="text-gray-100">{entry.content}</span>
                                    </div>
                                ) : (
                                    <div className="text-gray-300 ml-2">{entry.content}</div>
                                )}
                            </div>
                        ))}

                        {/* Current Input Line */}
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-green-400 shrink-0">root@portfolio:~$</span>
                            <div className="relative flex-1 flex items-center overflow-hidden">
                                <span className={clsx("whitespace-pre", isFocused ? "text-gray-100" : "text-gray-500")}>{input}</span>
                                <span className={clsx("inline-block ml-[2px]", {
                                    "w-2 h-4 bg-green-400 animate-blink": isFocused,
                                    "w-2 h-4 border border-gray-500": !isFocused
                                })}></span>
                                {!isFocused && (
                                    <span className="text-gray-500 text-xs ml-4 italic">(Click or press any key to focus)</span>
                                )}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() => setIsFocused(false)}
                                    onFocus={() => setIsFocused(true)}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-text caret-transparent"
                                    autoFocus
                                    spellCheck={false}
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div ref={bottomRef} className="h-8" />
                    </div>
                </div>

                {/* Bottom Status bar */}
                <div className="h-6 border-t border-[#333] bg-[#0d0e12] flex items-center px-4 text-[10px] text-gray-500 justify-between">
                    <div>MODE: NORMAL</div>
                    <div className="flex gap-4">
                        <span>UTF-8</span>
                        <span>master*</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
