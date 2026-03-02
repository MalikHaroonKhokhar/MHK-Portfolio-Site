import React, { useState, useEffect } from 'react';
import { TerminalLayout } from './components/TerminalLayout';

// Mock types
type Config = { name: string; role: string; bio: string; skills: string[]; contactLinks: any[]; resumeLink: string; };
type Project = { title: string; id: string; description: string; techStack: string[]; image: string; githubLink?: string; liveLink?: string; };
type Experience = { role: string; company: string; duration: string; bullets: string[]; };
type Education = { degree: string; institution: string; duration: string; };

function App() {
  const [data, setData] = useState<{
    config: Config | null;
    projects: Project[];
    experience: Experience[];
    education: Education[];
  }>({ config: null, projects: [], experience: [], education: [] });

  const resolvePath = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
  };

  useEffect(() => {
    // Fetch data from public folder
    const fetchData = async () => {
      try {
        const [configRes, projectsRes, expRes, eduRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}data/config.json`).then(res => res.ok ? res.json() : null),
          fetch(`${import.meta.env.BASE_URL}data/projects.json`).then(res => res.ok ? res.json() : []),
          fetch(`${import.meta.env.BASE_URL}data/experience.json`).then(res => res.ok ? res.json() : []),
          fetch(`${import.meta.env.BASE_URL}data/education.json`).then(res => res.ok ? res.json() : [])
        ]);

        setData({
          config: configRes,
          projects: projectsRes,
          experience: expRes,
          education: eduRes
        });
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    fetchData();
  }, []);

  const TypewriterText = ({ text, delay = 10 }: { text: string; delay?: number }) => {
    const [displayed, setDisplayed] = useState('');
    useEffect(() => {
      let isMounted = true;
      let i = 0;
      const interval = setInterval(() => {
        if (!isMounted) return;
        setDisplayed(text.substring(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, delay);
      return () => { isMounted = false; clearInterval(interval); };
    }, [text, delay]);
    return <span>{displayed}</span>;
  };

  const processCommand = async (cmd: string, args: string[]): Promise<React.ReactNode> => {
    // Artificial small delay for realism
    await new Promise(r => setTimeout(r, 200));

    // Handle empty data yet
    if (!data.config && cmd !== 'help') {
      return <div className="text-yellow-400">Loading system data... Please try again.</div>;
    }

    switch (cmd) {
      case 'help':
        return (
          <div className="space-y-1">
            <div className="text-green-400">AVAILABLE COMMANDS</div>
            <div className="grid grid-cols-2 gap-2 mt-2 max-w-md">
              <div className="text-white font-bold">whoami</div><div className="text-gray-400">Displays bio, skills, and profile</div>
              <div className="text-white font-bold">ls projects</div><div className="text-gray-400">Lists all current and past projects</div>
              <div className="text-white font-bold">open project &lt;id&gt;</div><div className="text-gray-400">View detailed project info</div>
              <div className="text-white font-bold">cat experience</div><div className="text-gray-400">Prints professional work history</div>
              <div className="text-white font-bold">cat education</div><div className="text-gray-400">Prints academic history</div>
              <div className="text-white font-bold">cat resume</div><div className="text-gray-400">View resume document</div>
              <div className="text-white font-bold">sudo contact</div><div className="text-gray-400">Elevates privileges to open contact menu</div>
              <div className="text-white font-bold">clear</div><div className="text-gray-400">Clear terminal output</div>
            </div>
          </div>
        );

      case 'whoami':
        return (
          <div className="space-y-4 max-w-2xl py-2">
            <div>
              <div className="text-green-500 font-bold text-xl uppercase tracking-widest leading-none">NAME: {data.config?.name}</div>
              <div className="text-green-500 font-bold text-xl uppercase tracking-widest mt-2 leading-none">ROLE: {data.config?.role}</div>
            </div>
            <p className="text-gray-300 leading-relaxed mt-4">
              <TypewriterText text={data.config?.bio || ''} delay={15} />
            </p>
            <div className="mt-8 border-t border-[#333] pt-4">
              <div className="text-green-400 font-bold mb-2 uppercase">Skills & Technologies</div>
              <div className="flex flex-wrap gap-2 mt-4">
                {data.config?.skills.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-[#1a201b] text-green-400 border border-green-900 rounded inline-block text-xs">[{s}]</span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ls':
        if (args[0] === 'projects') {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 py-4">
              {data.projects.map((p, i) => (
                <div key={p.id || i} className="border border-[#222] bg-[#111111] hover:border-green-500 transition-colors overflow-hidden group">
                  {p.image && (
                    <div className="h-32 w-full overflow-hidden bg-black/50">
                      <img src={resolvePath(p.image)} alt={p.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-cyan-400 font-bold text-lg mb-2">{p.title}</h3>
                    <p className="text-gray-400 text-xs mb-4 line-clamp-3">{p.description}</p>
                    <p className="text-gray-500 text-[10px] mb-2">ID: {p.id}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.techStack?.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-green-500 text-[10px] border border-green-900 px-1">[{t}]</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {data.projects.length === 0 && <div className="text-gray-400">No projects found.</div>}
            </div>
          );
        }
        return <div className="text-red-400">ls: cannot access '{args.join(' ')}': No such file or directory</div>;

      case 'open':
        if (args[0] === 'project' && args[1]) {
          const p = data.projects.find(x => x.id === args[1] || x.title.toLowerCase().includes(args[1].toLowerCase()));
          if (!p) return <div className="text-red-400">Project '{args[1]}' not found. Run 'ls projects' to see available projects.</div>;

          return (
            <div className="border border-cyan-900 bg-[#0d1518] p-6 max-w-2xl my-4 rounded">
              <h2 className="text-cyan-400 text-2xl font-bold mb-2">__{p.title.toUpperCase()}</h2>
              {p.image && <img src={resolvePath(p.image)} alt={p.title} className="w-full h-48 object-cover mb-4 border border-cyan-900/50 opacity-80" />}
              <p className="text-gray-300 leading-relaxed mb-6">{p.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {p.techStack?.map((t, idx) => (
                  <span key={idx} className="text-cyan-300 bg-cyan-950/50 border border-cyan-800 px-2 py-1 text-xs">_{t}</span>
                ))}
              </div>

              <div className="flex gap-4 border-t border-cyan-900/50 pt-4">
                {p.githubLink && <a href={p.githubLink} target="_blank" rel="noreferrer" className="text-white hover:text-cyan-400 flex items-center gap-2">[L] GitHub Repo</a>}
                {p.liveLink && <a href={p.liveLink} target="_blank" rel="noreferrer" className="text-white hover:text-cyan-400 flex items-center gap-2">[L] Live Demo</a>}
              </div>
            </div>
          );
        }
        return <div className="text-red-400">Usage: open project &lt;id&gt;</div>;

      case 'cat':
        if (args[0] === 'experience') {
          return (
            <div className="space-y-8 max-w-3xl py-4">
              <h2 className="text-green-500 font-bold uppercase tracking-widest text-xl mb-6">EXPERIENCE</h2>
              {data.experience.map((exp, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-[#333] hover:border-green-500 transition-colors">
                  <div className="absolute w-2 h-2 rounded-full bg-green-500 -left-[5px] top-1.5"></div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-white font-bold text-lg">{exp.role}</h3>
                    <span className="text-gray-500 text-xs">{exp.duration}</span>
                  </div>
                  <div className="text-green-500 text-sm mb-3">{exp.company}</div>
                  <ul className="space-y-2">
                    {exp.bullets.map((b, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex gap-2">
                        <span className="text-green-500">▷</span> <TypewriterText text={b} delay={5} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {data.experience.length === 0 && <div className="text-gray-400">No experience records found.</div>}
            </div>
          );
        }
        if (args[0] === 'education') {
          return (
            <div className="space-y-6 max-w-2xl py-4">
              <h2 className="text-green-500 font-bold uppercase tracking-widest text-xl mb-4">EDUCATION</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-4">
                  <h3 className="text-white font-bold">{edu.degree}</h3>
                  <div className="text-green-500 text-sm">{edu.institution} <span className="text-gray-500 ml-2">| {edu.duration}</span></div>
                </div>
              ))}
              {data.education.length === 0 && <div className="text-gray-400">No education records found.</div>}
            </div>
          );
        }
        if (args[0] === 'resume') {
          if (data.config?.resumeLink) {
            return (
              <div className="my-4 p-4 border border-green-900 bg-green-950/20 max-w-md">
                <div className="text-green-400 mb-2">Resume document located at:</div>
                <a href={resolvePath(data.config.resumeLink)} target="_blank" rel="noreferrer" className="text-white underline hover:text-green-300">
                  [Click to download / view PDF]
                </a>
              </div>
            );
          }
          return <div className="text-yellow-400">No resume PDF uploaded. Run 'whoami' or 'cat experience' instead.</div>;
        }
        return <div className="text-red-400">cat: {args.join(' ')}: No such file or directory</div>;

      case 'sudo':
      case 'hire-me':
      case 'contact':
        if (cmd === 'sudo' && args[0] !== 'contact') {
          return <div className="text-red-500">sudo: {args.join(' ')}: command not found</div>;
        }
        return (
          <div className="my-6 max-w-lg border border-cyan-800 rounded overflow-hidden shadow-[0_0_15px_rgba(0,150,255,0.1)]">
            <div className="bg-cyan-950/50 px-4 py-2 flex justify-between items-center border-b border-cyan-800 text-cyan-400 font-bold text-xs tracking-widest">
              CONTACT / HIRE ME
              <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div><div className="w-2 h-2 rounded-full bg-cyan-700"></div></div>
            </div>
            <div className="p-6 bg-[#0a0f12]">
              <div className="text-gray-300 text-xs mb-4 space-y-1">
                <div>&gt; Initiating secure connection...</div>
                <div>&gt; Establishing communication uplink...</div>
                <div className="text-green-400">&gt;&gt; Success. Available channels:</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {data.config?.contactLinks.filter((l: any) => l.url.includes('mailto') || l.label.toLowerCase().includes('mail') || l.label.toLowerCase().includes('freelance') || l.label.toLowerCase().includes('upwork') || l.label.toLowerCase().includes('fiverr')).map((link: any, i: number) => (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer" className="block p-3 border border-[#333] hover:border-cyan-500 hover:bg-cyan-950/30 transition-all text-cyan-400 font-bold">
                    <div className="text-[10px] text-gray-500 font-normal mb-1">$ alias {link.label.toLowerCase()}</div>
                    {link.label.toUpperCase()} ↗
                  </a>
                ))}
              </div>

              <div className="text-[10px] text-gray-500 border-t border-[#222] pt-4 mt-2">
                <div className="mb-2 uppercase tracking-wide">External Protocols</div>
                <div className="flex flex-wrap gap-4">
                  {data.config?.contactLinks.filter((l: any) => !l.url.includes('mailto') && !l.label.toLowerCase().includes('mail') && !l.label.toLowerCase().includes('upwork') && !l.label.toLowerCase().includes('fiverr')).map((link: any, i: number) => (
                    <a key={i} href={link.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                      [{link.label.charAt(0).toUpperCase()}] {link.label.toLowerCase()}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-red-500">bash: {cmd}: command not found</div>;
    }
  };

  const welcomeMessage = (
    <div className="mb-8">
      <div className="text-gray-400 mb-4">
        Last login: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()} on ttys000<br />
        Welcome to {data.config?.name || 'Terminal'} Portfolio v1.0.0<br />
        Type <span className="text-green-400">'help'</span> for a list of available commands.
      </div>
      <pre className="text-green-500 font-bold hidden md:block text-[10px] md:text-xs">
        {`
 __       __          __  __  __        __    __                                                 
/  \\     /  |        /  |/  |/  |      /  |  /  |                                                
$$  \\   /$$ |  ____  $$ |$$/ $$ |   __ $$ |  $$ |  ______    ______    ______    ______   _______  
$$$  \\ /$$$ | /    \\ $$ |/  |$$ |  /  |$$ |__$$ | /      \\  /      \\  /      \\  /      \\ /       \\ 
$$$$  /$$$$ |/$$$$  |$$ |$$ |$$ |_/$$/ $$    $$ | $$$$$$  |/$$$$$$  |/$$$$$$  |/$$$$$$  |$$$$$$$  |
$$ $$ $$/$$ |$$ |  $$ |$$ |$$ |$$   $$<  $$$$$$$$ | /    $$ |$$ |  $$/ $$ |  $$ |$$ |  $$ |$$ |  $$ |
$$ |$$$/ $$ |$$ \\__$$ |$$ |$$ |$$$$$$  \\ $$ |  $$ |/$$$$$$$ |$$ |      $$ \\__$$ |$$ \\__$$ |$$ |  $$ |
$$ | $/  $$ |$$    $$/ $$ |$$ |$$ | $$  |$$ |  $$ |$$    $$ |$$ |      $$    $$/ $$    $$/ $$ |  $$ |
$$/      $$/  $$$$$$/  $$/ $$/ $$/   $$/ $$/   $$/  $$$$$$$/ $$/        $$$$$$/   $$$$$$/  $$/   $$/ 
`}
      </pre>
    </div>
  );

  return (
    <TerminalLayout processCommand={processCommand} welcomeMessage={welcomeMessage} />
  );
}

export default App;
