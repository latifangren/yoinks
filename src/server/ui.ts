import {createRequire} from 'node:module'

const VERSION: string = createRequire(import.meta.url)('../../package.json').version

export const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Yoinks — Media Workspace v${VERSION}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = {
  theme: {
    extend: {
      colors: {
        workspaceBg: '#f4f6fa',
        bentoBorder: '#0f172a',
        canvasBg: '#090d16',
        canvasNodeBorder: '#1e293b',
        accentIndigo: '#5c3bf5',
        accentPink: '#ec4899',
        accentGreen: '#10b981',
        accentYellow: '#fbbf24',
        accentSky: '#0ea5e9'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif']
      }
    }
  }
}
</script>
<style>
@keyframes flow {
  to {
    stroke-dashoffset: -20;
  }
}
.active-path {
  stroke: #6366f1 !important;
  stroke-width: 1.5 !important;
  stroke-dasharray: 4, 4;
  animation: flow 1s linear infinite;
  filter: drop-shadow(0 0 3px rgba(99, 102, 241, 0.6));
}
/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
#terminal-console::-webkit-scrollbar-thumb {
  background: #334155;
}
#terminal-console::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
</head>
<body class="bg-[#f4f6fa] text-slate-900 font-sans p-4 md:p-6 min-h-screen flex flex-col items-center justify-start select-none">

<div class="w-full max-w-7xl mx-auto flex flex-col gap-6">
  
  <!-- Header Bar -->
  <header class="w-full bg-white border-4 border-slate-900 rounded-[20px] p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-[4px_4px_0_0_#090d16]">
    <div class="flex items-center gap-3">
      <!-- Icon/Logo -->
      <div class="bg-indigo-600 text-white p-2.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_0_#090d16] flex items-center justify-center">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="font-display font-bold text-2xl uppercase tracking-tight text-slate-900">YOINKS</h1>
          <span class="bg-[#fbbf24] text-slate-900 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-900">PRO</span>
          <span class="bg-[#10b981]/10 text-emerald-700 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ONLINE
          </span>
        </div>
        <p class="text-[11px] text-slate-500 font-medium">Yoink any video from YouTube, X, Instagram, Threads & 1800+ sites.</p>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <div class="hidden sm:flex bg-[#8b5cf6] text-white font-semibold text-xs px-3 py-1.5 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0_0_#090d16] items-center gap-1">
        ⚡ Media Engine Active
      </div>
      <div class="hidden sm:flex bg-slate-100 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg border border-slate-300 items-center gap-1">
        📁 Default: Downloads
      </div>
      <!-- Language Selector -->
      <div class="bg-white border-2 border-slate-900 rounded-lg px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0_0_#090d16] cursor-pointer hover:bg-slate-50 transition-colors">
        <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 18c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9h18" />
        </svg>
        <span>English</span>
        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      <!-- Logout Button -->
      <button id="logout-btn" onclick="doLogout()" class="hidden bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-1 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0_0_#090d16] transition-all flex items-center gap-1.5 cursor-pointer" title="Logout session">
        <span>🚪</span> Logout
      </button>
    </div>
  </header>

  <!-- Title Workspace Card -->
  <section class="w-full bg-white border-4 border-slate-900 rounded-[20px] p-6 shadow-[4px_4px_0_0_#090d16] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div class="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
      <svg class="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z" />
      </svg>
    </div>
    <div class="z-10 flex-1">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-indigo-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </span>
        <h2 class="font-display font-bold text-xl md:text-2xl text-slate-900 tracking-tight">Yoinks Media Downloader</h2>
      </div>
      <p class="text-xs md:text-sm text-slate-600 font-medium">Extract, optimize, and organize media streams. View raw quality choices, select download channels, and track processing in real time.</p>
    </div>
    
    <!-- Navigation Tabs / View Switcher -->
    <div class="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border-2 border-slate-900 z-10 self-stretch md:self-auto shadow-[2px_2px_0_0_#090d16]">
      <button id="view-dashboard-btn" onclick="setView('dashboard')" class="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5 shadow-[1px_1px_0_0_#000]">
        <span>📥</span> Downloader
      </button>
      <button id="view-gallery-btn" onclick="setView('gallery')" class="text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-bold text-xs px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5">
        <span>🎬</span> Gallery Menu
      </button>
    </div>
  </section>

  <!-- Bento Grid Columns -->
  <main id="bento-grid" class="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
    
    <!-- Left Column: Downloader Settings (Span 4) -->
    <section class="lg:col-span-4 bg-white border-4 border-slate-900 rounded-[20px] p-5 shadow-[4px_4px_0_0_#090d16] flex flex-col justify-between gap-5">
      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-display font-bold text-sm tracking-wide text-slate-900 uppercase flex items-center gap-1.5">
            <span>🎛️</span> 1. Download Settings
          </h3>
          <button class="bg-slate-100 border border-slate-300 text-[10px] font-bold text-slate-700 px-2.5 py-1 rounded-md hover:bg-slate-200 transition-colors">
            Default Path
          </button>
        </div>
        
        <!-- Preset Seeds -->
        <div class="mb-4">
          <span class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Supported Platform Seeds (Pre-fill)</span>
          <div class="flex flex-wrap gap-1.5">
            <button onclick="fillPreset('youtube')" class="flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors">
              🔴 YouTube
            </button>
            <button onclick="fillPreset('x')" class="flex items-center gap-1 bg-slate-50 text-slate-800 border border-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-full hover:bg-slate-100 transition-colors">
              🐦 X / Twitter
            </button>
            <button onclick="fillPreset('instagram')" class="flex items-center gap-1 bg-pink-50 text-pink-700 border border-pink-200 text-[11px] font-semibold px-2.5 py-1 rounded-full hover:bg-pink-100 transition-colors">
              📸 Instagram
            </button>
            <button onclick="fillPreset('tiktok')" class="flex items-center gap-1 bg-cyan-50 text-cyan-700 border border-cyan-200 text-[11px] font-semibold px-2.5 py-1 rounded-full hover:bg-cyan-100 transition-colors">
              🎵 TikTok
            </button>
          </div>
        </div>
        
        <!-- URL Input -->
        <div class="mb-4">
          <label for="url-input" class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Video URL(s) <span class="text-slate-400 font-medium normal-case">(Newlines/commas for playlists/batch)</span>
          </label>
          <textarea id="url-input" rows="4" 
            placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ&#10;https://x.com/NASA/status/1800000000000000000" 
            autocomplete="off" spellcheck="false" 
            class="w-full bg-[#f8fafc] border-2 border-slate-900 rounded-xl p-3 text-slate-800 font-mono text-xs focus:border-indigo-500 outline-none transition-all resize-none shadow-inner leading-relaxed"></textarea>
        </div>

        <!-- OutDir Input -->
        <div class="mb-3">
          <label for="outdir-input" class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Output Directory</label>
          <input id="outdir-input" type="text" value="/downloads" placeholder="/downloads" 
            class="w-full bg-[#f8fafc] border-2 border-slate-900 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-500 outline-none transition-all shadow-inner"/>
          <p class="text-[9px] text-slate-400 mt-1">Inside Docker this maps to your host directory (see docker-compose.yml)</p>
        </div>

        <!-- Subfolder Input -->
        <div class="mb-4">
          <label for="subfolder-input" class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Output subfolder <span class="text-slate-400 font-medium normal-case">(Optional)</span></label>
          <input id="subfolder-input" type="text" value="" placeholder="e.g. music/" 
            class="w-full bg-[#f8fafc] border-2 border-slate-900 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:border-indigo-500 outline-none transition-all shadow-inner"/>
        </div>

        <!-- Configuration Checkboxes -->
        <div class="space-y-2 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Format Pre-Selection</span>
          <label class="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input id="best-checkbox" type="checkbox" onchange="if(this.checked)document.getElementById('mp3-checkbox').checked=false" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"/>
            Best quality (auto)
          </label>
          <label class="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input id="mp3-checkbox" type="checkbox" onchange="if(this.checked)document.getElementById('best-checkbox').checked=false" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"/>
            Audio only (MP3)
          </label>
          <label class="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input id="embed-chapters-checkbox" type="checkbox" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"/>
            Embed chapters
          </label>
        </div>
      </div>
      
      <!-- Big Action Button -->
      <button id="probe-btn" onclick="startProbe()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-sm tracking-wide uppercase py-3 px-4 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0_0_#090d16] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#090d16] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
        </svg>
        YOINK AND PROCESS LINK
      </button>
    </section>

    <!-- Middle Column: Interactive Pipeline Canvas (Span 5) -->
    <section class="lg:col-span-5 bg-white border-4 border-slate-900 rounded-[20px] p-5 shadow-[4px_4px_0_0_#090d16] flex flex-col justify-between gap-4">
      <div class="flex flex-col h-full justify-between">
        <div class="flex justify-between items-center mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <span>📈</span> 2. Pipeline Progress
            </span>
          </div>
        </div>

        <!-- Dark Canvas Panel -->
        <div class="relative bg-canvasBg rounded-2xl border-2 border-slate-900 p-4 h-[380px] flex flex-col justify-between overflow-hidden shadow-inner select-none">
          <!-- Canvas Header Status -->
          <div class="flex justify-between items-center z-10">
            <div class="flex items-center gap-2">
              <span class="flex h-2.5 w-2.5 relative">
                <span id="canvas-status-pulse" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span id="canvas-status-dot" class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span id="canvas-status-text" class="text-[10px] font-mono text-slate-400 tracking-wider font-bold">YOINKS ENGINE STANDBY</span>
            </div>
            <div class="bg-[#1e293b]/50 border border-slate-700/50 rounded px-2 py-0.5 text-[9px] font-mono text-slate-400 font-bold">
              Active Streams: <span id="active-streams-badge" class="text-indigo-400 font-extrabold">0</span>
            </div>
          </div>

          <!-- Node Connections Canvas (SVG Overlaid) -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <!-- Connection paths -->
            <path id="line-1-2" d="M 50,12 L 25,32" stroke="#1e293b" stroke-width="0.8" fill="none" />
            <path id="line-1-3" d="M 50,12 L 75,32" stroke="#1e293b" stroke-width="0.8" fill="none" />
            <path id="line-2-4" d="M 25,32 L 50,52" stroke="#1e293b" stroke-width="0.8" fill="none" />
            <path id="line-3-4" d="M 75,32 L 50,52" stroke="#1e293b" stroke-width="0.8" fill="none" />
            <path id="line-4-5" d="M 50,52 L 50,72" stroke="#1e293b" stroke-width="0.8" fill="none" />
            <path id="line-5-6" d="M 50,72 L 50,88" stroke="#1e293b" stroke-width="0.8" fill="none" />
          </svg>

          <!-- Nodes positioned relative to background -->
          <div class="relative w-full h-full my-1">
            <!-- Node 1: Link Input (Yellow preset style) -->
            <div id="node-1" class="absolute top-[12%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-800 border border-slate-700 rounded-lg p-1.5 px-3 flex items-center gap-2 shadow-md transition-all duration-300">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-500" id="node-1-indicator"></span>
              <div class="flex flex-col text-left">
                <span class="text-[9px] font-bold text-slate-200">1. URL Entered</span>
                <span id="node-1-sub" class="text-[8px] text-slate-400">No URL</span>
              </div>
            </div>

            <!-- Node 2: Metadata Probe (Purple style) -->
            <div id="node-2" class="absolute top-[32%] left-[25%] -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-800 border border-slate-700 rounded-lg p-1.5 px-2.5 flex items-center gap-2 shadow-md transition-all duration-300">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-500" id="node-2-indicator"></span>
              <div class="flex flex-col text-left">
                <span class="text-[9px] font-bold text-slate-200">2. Probing Stream</span>
                <span id="node-2-sub" class="text-[8px] text-slate-400">Idle</span>
              </div>
            </div>

            <!-- Node 3: Engine Probe (Blue style) -->
            <div id="node-3" class="absolute top-[32%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-800 border border-slate-700 rounded-lg p-1.5 px-2.5 flex items-center gap-2 shadow-md transition-all duration-300">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-500" id="node-3-indicator"></span>
              <div class="flex flex-col text-left">
                <span class="text-[9px] font-bold text-slate-200">3. Engine Analyzer</span>
                <span id="node-3-sub" class="text-[8px] text-slate-400">Idle</span>
              </div>
            </div>

            <!-- Node 4: Format Choice (Green style) -->
            <div id="node-4" class="absolute top-[52%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-800 border border-slate-700 rounded-lg p-1.5 px-3 flex items-center gap-2 shadow-md transition-all duration-300">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-500" id="node-4-indicator"></span>
              <div class="flex flex-col text-left">
                <span class="text-[9px] font-bold text-slate-200">4. Format Selected</span>
                <span id="node-4-sub" class="text-[8px] text-slate-400">Idle</span>
              </div>
            </div>

            <!-- Node 5: Ffmpeg Transcode (Pink style) -->
            <div id="node-5" class="absolute top-[72%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-800 border border-slate-700 rounded-lg p-1.5 px-3 flex items-center gap-2 shadow-md transition-all duration-300">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-500" id="node-5-indicator"></span>
              <div class="flex flex-col text-left">
                <span class="text-[9px] font-bold text-slate-200">5. Ffmpeg Processing</span>
                <span id="node-5-sub" class="text-[8px] text-slate-400">Idle</span>
              </div>
            </div>

            <!-- Node 6: Export Saved (Slate style) -->
            <div id="node-6" class="absolute top-[88%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-800 border border-slate-700 rounded-lg p-1.5 px-3 flex items-center gap-2 shadow-md transition-all duration-300">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-500" id="node-6-indicator"></span>
              <div class="flex flex-col text-left">
                <span class="text-[9px] font-bold text-slate-200">6. File Dispatched</span>
                <span id="node-6-sub" class="text-[8px] text-slate-400">Idle</span>
              </div>
            </div>
          </div>

          <!-- Canvas Footer -->
          <div class="flex justify-between items-center z-10 border-t border-slate-800/40 pt-2">
            <span class="text-[8px] font-mono text-slate-500">Yoinks visual pipeline powered by local media inspection agents</span>
            <span class="bg-indigo-950 text-[#8b5cf6] font-mono text-[8px] font-bold px-1.5 py-0.5 rounded border border-indigo-800/50 flex items-center gap-1">
              ⚡ GPU ENABLED
            </span>
          </div>
        </div>
        
        <!-- Live Dynamic Interactive Area (Choices / Progress / Done) -->
        <div class="mt-2">
          <!-- Status Label -->
          <div id="status-text" class="text-xs font-semibold text-slate-500 italic min-h-[18px]"></div>
          
          <!-- Format Selection Container -->
          <div id="choices-area"></div>
          
          <!-- Download Progress Container -->
          <div id="progress-area"></div>
          
          <!-- Job Execution Result Container -->
          <div id="result-area"></div>
        </div>
      </div>
    </section>

    <!-- Right Panel: Media Metadata & Live Logs (Span 3) -->
    <section class="lg:col-span-3 bg-white border-4 border-slate-900 rounded-[20px] p-5 shadow-[4px_4px_0_0_#090d16] flex flex-col justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-3">
          <div class="p-1 bg-slate-100 border border-slate-300 rounded text-slate-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <h3 class="font-display font-bold text-sm tracking-wide text-slate-900 uppercase">
            3. Video Metadata
          </h3>
        </div>
        
        <p class="text-[10px] text-slate-400 font-medium mb-3">Extracted video description, uploader channel, and precise media duration.</p>

        <!-- Context Fields -->
        <div class="space-y-3">
          <!-- Field 1: Probed Concept -->
          <div class="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
            <span class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">VIDEO TITLE</span>
            <span id="meta-concept" class="text-xs font-bold text-slate-800 break-words line-clamp-2">Not defined yet</span>
          </div>
          <!-- Field 2: Target Regions / Creator -->
          <div class="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
            <span class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">CHANNEL / CREATOR</span>
            <span id="meta-uploader" class="text-xs font-bold text-slate-800">Not defined yet</span>
          </div>
          <!-- Field 3: Compliance / Duration -->
          <div class="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
            <span class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">STREAM TIME</span>
            <span id="meta-duration" class="text-xs font-bold text-slate-800">Not defined yet</span>
          </div>
        </div>
      </div>

      <!-- Recent Yoinks Component -->
      <div class="border-t-2 border-slate-100 pt-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <span class="text-indigo-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </span>
            <span class="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              Recent Yoinks
            </span>
          </div>
          <button onclick="clearRecentYoinks()" class="text-[9px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase">Clear</button>
        </div>
        <div id="recent-yoinks-list" class="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
          <p class="text-[10px] text-slate-400 italic">No recent downloads yet.</p>
        </div>
      </div>

      <!-- Live Node Log Timeline -->
      <div class="flex flex-col gap-2 mt-2">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> System Process Logs
          </span>
          <button onclick="clearTerminal()" class="text-[9px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase">Clear</button>
        </div>
        <div id="terminal-console" class="bg-[#030712] border-2 border-slate-900 rounded-xl p-3 font-mono text-[10px] leading-relaxed text-emerald-400 h-[120px] overflow-y-auto shadow-inner flex flex-col gap-1 select-text">
          <!-- Populated dynamically -->
        </div>
      </div>
    </section>
  </main>

  <!-- Media Gallery View -->
  <main id="gallery-grid" class="w-full hidden bg-white border-4 border-slate-900 rounded-[20px] p-6 shadow-[4px_4px_0_0_#090d16] flex flex-col gap-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-slate-100 pb-5">
      <div>
        <h3 class="font-display font-bold text-lg tracking-wide text-slate-900 uppercase flex items-center gap-1.5">
          <span>🎬</span> Media Gallery
        </h3>
        <p class="text-xs text-slate-500 font-medium">Browse, play, export, and manage your downloaded media streams from <code class="bg-slate-100 px-1 rounded text-indigo-600 font-mono" id="gallery-outdir-text">Downloads</code>.</p>
      </div>
      
      <!-- Control Buttons -->
      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <!-- Search bar -->
        <div class="relative flex-1 md:flex-none">
          <input type="text" id="gallery-search" oninput="filterGallery()" placeholder="Search downloaded files..." class="w-full md:w-64 bg-slate-50 border-2 border-slate-900 rounded-lg px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0_0_#090d16] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        
        <!-- Refresh button -->
        <button onclick="loadGallery()" class="bg-white border-2 border-slate-900 text-slate-800 hover:bg-slate-50 font-bold text-xs px-3 py-1.5 rounded-lg shadow-[2px_2px_0_0_#090d16] transition-all flex items-center gap-1.5 cursor-pointer">
          <svg id="gallery-refresh-icon" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
    
    <!-- Gallery Stats Bar -->
    <div class="flex flex-wrap gap-4 items-center justify-between bg-slate-50 border-2 border-slate-900 p-3 rounded-xl shadow-[2px_2px_0_0_#090d16] text-xs font-bold text-slate-700">
      <div class="flex items-center gap-4">
        <span>📦 Total Files: <span id="gallery-count-badge" class="text-indigo-600">0</span></span>
        <span class="text-slate-300">|</span>
        <span>💾 Disk Storage Used: <span id="gallery-size-badge" class="text-indigo-600">0 MB</span></span>
      </div>
      <div>
        <span class="text-[10px] text-slate-400">Files are persisted on the container's output stream directory</span>
      </div>
    </div>
    
    <!-- Loading Spinner / Empty State / Gallery Container -->
    <div id="gallery-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[250px]">
      <!-- Populated Dynamically -->
    </div>
  </main>
</div>

<!-- Interactive Media Preview Modal -->
<div id="preview-modal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
  <div class="bg-white border-4 border-slate-900 rounded-[24px] max-w-2xl w-full p-6 shadow-[8px_8px_0_0_#090d16] flex flex-col gap-4 relative">
    <!-- Close button -->
    <button onclick="closePreviewModal()" class="absolute top-4 right-4 bg-slate-100 hover:bg-red-100 border-2 border-slate-900 rounded-full p-1.5 transition-colors text-slate-700 hover:text-red-600 cursor-pointer">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
    
    <div class="flex items-center gap-2 border-b-2 border-slate-100 pb-3 pr-8">
      <span class="text-indigo-600 text-lg">🎬</span>
      <div class="min-w-0 flex-1">
        <h4 id="preview-modal-title" class="font-display font-bold text-slate-900 text-sm md:text-base tracking-tight truncate">Media Player</h4>
        <p id="preview-modal-subtitle" class="text-[10px] text-slate-500 font-mono truncate"></p>
      </div>
    </div>
    
    <!-- Playback Container -->
    <div id="preview-player-container" class="bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-900 flex items-center justify-center min-h-[280px] relative">
      <!-- Media tag (video/audio) gets injected here dynamically -->
    </div>
    
    <!-- Info & Export Footer -->
    <div class="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
      <span id="preview-modal-size" class="text-[11px] font-bold text-slate-600">Size: 0 MB</span>
      <div class="flex gap-2">
        <a id="preview-modal-download-btn" href="#" download class="bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs px-4 py-2 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0_0_#000] transition-all flex items-center gap-1.5 cursor-pointer">
          <span>📥</span> Export File
        </a>
        <button onclick="closePreviewModal()" class="bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs px-4 py-2 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0_0_#000] transition-all cursor-pointer">
          Close
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Visual Login Screen Overlay -->
<div id="login-screen" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
  <div class="bg-white border-4 border-slate-900 rounded-[24px] max-w-md w-full p-8 shadow-[8px_8px_0_0_#090d16] flex flex-col gap-6 relative">
    <div class="flex items-center gap-3 border-b-2 border-slate-100 pb-4">
      <div class="bg-indigo-600 text-white p-3 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_0_#090d16] flex items-center justify-center">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h3 class="font-display font-bold text-xl uppercase tracking-tight text-slate-900">YOINKS WORKSPACE</h3>
          <span class="bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-300">PROTECTED</span>
        </div>
        <p class="text-xs text-slate-500 font-medium">Enter workspace password or PIN to unlock.</p>
      </div>
    </div>
    
    <div>
      <label for="login-password" class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Workspace Password / PIN</label>
      <input id="login-password" type="password" placeholder="••••••••" onkeydown="if(event.key==='Enter')doLogin()" class="w-full bg-[#f8fafc] border-2 border-slate-900 rounded-xl p-3 text-slate-800 font-mono text-sm focus:border-indigo-500 outline-none transition-all shadow-inner"/>
      <p id="login-error" class="hidden text-xs font-bold text-red-600 mt-2 flex items-center gap-1"></p>
    </div>

    <button id="login-submit-btn" onclick="doLogin()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-sm tracking-wide uppercase py-3 px-4 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0_0_#090d16] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#090d16] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer">
      <span>🔓</span> UNLOCK WORKSPACE
    </button>
  </div>
</div>

<script>
let currentView = 'dashboard'
let galleryFiles = []

function setView(viewName) {
  currentView = viewName
  const dbBtn = document.getElementById('view-dashboard-btn')
  const galBtn = document.getElementById('view-gallery-btn')
  const dbGrid = document.getElementById('bento-grid')
  const galGrid = document.getElementById('gallery-grid')
  
  if (viewName === 'gallery') {
    dbGrid.classList.add('hidden')
    galGrid.classList.remove('hidden')
    
    dbBtn.className = "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-bold text-xs px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
    galBtn.className = "bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5 shadow-[1px_1px_0_0_#000] cursor-pointer"
    
    loadGallery()
  } else {
    dbGrid.classList.remove('hidden')
    galGrid.classList.add('hidden')
    
    dbBtn.className = "bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5 shadow-[1px_1px_0_0_#000] cursor-pointer"
    galBtn.className = "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-bold text-xs px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
  }
}

async function loadGallery() {
  const container = document.getElementById('gallery-container')
  const countBadge = document.getElementById('gallery-count-badge')
  const sizeBadge = document.getElementById('gallery-size-badge')
  const refreshIcon = document.getElementById('gallery-refresh-icon')
  
  if (refreshIcon) refreshIcon.classList.add('animate-spin')
  container.innerHTML = '<div class="col-span-full flex flex-col items-center justify-center p-12 text-slate-400">' +
    '<svg class="animate-spin h-8 w-8 text-indigo-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
      '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>' +
    '</svg>' +
    '<span class="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">Syncing container downloads directory...</span>' +
  '</div>'
  
  try {
    const res = await fetch('/api/files')
    if (!res.ok) throw new Error('Failed to load gallery')
    const data = await res.json()
    
    galleryFiles = data.files || []
    
    const outDirText = document.getElementById('gallery-outdir-text')
    if (outDirText && data.outDir) {
      outDirText.textContent = data.outDir
    }
    
    renderGalleryList(galleryFiles)
  } catch (err) {
    container.innerHTML = '<div class="col-span-full bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center text-red-600 font-bold text-xs">' +
      '⚠️ Error reading output files: ' + esc(err.message || err) +
    '</div>'
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('animate-spin')
  }
}

function renderGalleryList(files) {
  const container = document.getElementById('gallery-container')
  const countBadge = document.getElementById('gallery-count-badge')
  const sizeBadge = document.getElementById('gallery-size-badge')
  
  countBadge.textContent = files.length
  
  let totalBytes = 0
  files.forEach(f => totalBytes += f.size)
  sizeBadge.textContent = formatBytes(totalBytes)
  
  if (files.length === 0) {
    container.innerHTML = '<div class="col-span-full border-4 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">' +
      '<span class="text-3xl block mb-2">📥</span>' +
      '<h4 class="font-bold text-sm text-slate-700">No media assets found</h4>' +
      '<p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Items downloaded using the Yoinks Engine will show up here automatically. Go paste a link and start yoinking!</p>' +
      '<button onclick="setView(\\'dashboard\\')" class="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0_0_#000] transition-all cursor-pointer">' +
        'Open Downloader' +
      '</button>' +
    '</div>'
    return
  }
  
  let html = ''
  files.forEach(file => {
    const isVideo = file.type === 'video'
    const isAudio = file.type === 'audio'
    
    const accentClass = isVideo 
      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
      : isAudio 
        ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
        : 'border-slate-500 bg-slate-50 text-slate-700'
        
    const icon = isVideo ? '🎬' : isAudio ? '🎵' : '📄'
    const typeLabel = isVideo ? 'VIDEO' : isAudio ? 'AUDIO' : 'FILE'
    
    const dateStr = new Date(file.mtime).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const sRelPath = esc(file.relPath)
    const sName = esc(file.name)
    const sType = esc(file.type)
    const sSize = formatBytes(file.size)
    const folderLabel = (file.relPath.includes('/') || file.relPath.includes('\\\\'))
      ? '<span class="flex items-center gap-1 truncate" title="' + sRelPath + '">📁 Folder: <span class="text-indigo-600 font-mono font-bold">' + esc(pathDir(file.relPath)) + '</span></span>'
      : ''
    
    html += '<div class="group relative bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0_0_#090d16] hover:shadow-[6px_6px_0_0_#090d16] hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-4">' +
      '<div class="flex items-center justify-between gap-2">' +
        '<span class="px-2 py-0.5 rounded border border-slate-900 font-mono text-[9px] font-black flex items-center gap-1 ' + accentClass + '">' +
          '<span>' + icon + '</span>' +
          '<span>' + typeLabel + '</span>' +
        '</span>' +
        '<span class="font-mono text-[10px] text-slate-400 font-semibold uppercase">' + esc(file.ext) + '</span>' +
      '</div>' +
      
      '<div class="flex-1 min-w-0">' +
        '<h4 class="font-display font-bold text-slate-800 text-xs leading-snug tracking-tight break-words line-clamp-2" title="' + sName + '">' +
          sName +
        '</h4>' +
        '<div class="flex flex-col gap-1 mt-2 text-[10px] text-slate-400 font-medium">' +
          '<span class="flex items-center gap-1">💾 Size: <span class="text-slate-600 font-bold">' + sSize + '</span></span>' +
          '<span class="flex items-center gap-1">🕒 Saved: <span class="text-slate-600 font-semibold">' + dateStr + '</span></span>' +
          folderLabel +
        '</div>' +
      '</div>' +
      
      '<div class="flex items-center gap-1.5 border-t border-slate-100 pt-3">' +
        '<button onclick="openPreviewModal(\\'' + sRelPath.replace(/'/g, "\\'") + '\\', \\'' + sName.replace(/'/g, "\\'") + '\\', \\'' + sSize + '\\', \\'' + sType + '\\')" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] py-1.5 rounded-lg border border-slate-900 shadow-[1px_1px_0_0_#000] transition-all flex items-center justify-center gap-1 cursor-pointer">' +
          '<span>▶️</span> Preview' +
        '</button>' +
        
        '<a href="/api/files/download?path=' + encodeURIComponent(file.relPath) + '" download="' + sName + '" class="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-300 hover:border-emerald-500 transition-colors flex items-center justify-center cursor-pointer" title="Export File to Local Browser">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">' +
            '<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />' +
          '</svg>' +
        '</a>' +
        
        '<button onclick="deleteFile(\\'' + sRelPath.replace(/'/g, "\\'") + '\\', \\'' + sName.replace(/'/g, "\\'") + '\\')" class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 hover:border-red-500 transition-colors flex items-center justify-center cursor-pointer" title="Delete File">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">' +
            '<path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />' +
          '</svg>' +
        '</button>' +
      '</div>' +
    '</div>'
  })
  container.innerHTML = html
}

function filterGallery() {
  const query = document.getElementById('gallery-search').value.toLowerCase().trim()
  if (!query) {
    renderGalleryList(galleryFiles)
    return
  }
  
  const filtered = galleryFiles.filter(file => file.name.toLowerCase().includes(query))
  renderGalleryList(filtered)
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function pathDir(relPath) {
  const idx = relPath.lastIndexOf('/')
  const idx2 = relPath.lastIndexOf('\\\\')
  const pivot = Math.max(idx, idx2)
  if (pivot === -1) return ''
  return relPath.substring(0, pivot)
}

function openPreviewModal(relPath, filename, size, type) {
  const modal = document.getElementById('preview-modal')
  const title = document.getElementById('preview-modal-title')
  const subtitle = document.getElementById('preview-modal-subtitle')
  const sizeText = document.getElementById('preview-modal-size')
  const playerContainer = document.getElementById('preview-player-container')
  const downloadBtn = document.getElementById('preview-modal-download-btn')
  
  title.textContent = filename
  subtitle.textContent = relPath
  sizeText.textContent = 'Size: ' + size
  downloadBtn.href = '/api/files/download?path=' + encodeURIComponent(relPath)
  
  const streamUrl = '/api/files/stream?path=' + encodeURIComponent(relPath)
  
  if (type === 'video') {
    playerContainer.innerHTML = '<video id="gallery-player" controls autoplay class="w-full h-full max-h-[380px] object-contain rounded-lg">' +
      '<source src="' + streamUrl + '" type="video/mp4">' +
      'Your browser does not support the video tag.' +
    '</video>'
  } else if (type === 'audio') {
    playerContainer.innerHTML = '<div class="flex flex-col items-center justify-center p-8 w-full">' +
      '<div class="text-5xl animate-bounce mb-4">🎵</div>' +
      '<audio id="gallery-player" controls autoplay class="w-full max-w-md">' +
        '<source src="' + streamUrl + '" type="audio/mpeg">' +
        'Your browser does not support the audio element.' +
      '</audio>' +
      '<span class="text-[10px] font-mono text-slate-500 mt-4 uppercase">Streaming audio channel via range request...</span>' +
    '</div>'
  } else {
    playerContainer.innerHTML = '<div class="flex flex-col items-center justify-center p-8 text-slate-400 text-center">' +
      '<span class="text-5xl mb-3">📄</span>' +
      '<h5 class="font-bold text-slate-700 text-xs">Preview unavailable for this format</h5>' +
      '<p class="text-[10px] mt-1">Export/Download the file to view its full content locally.</p>' +
    '</div>'
  }
  
  modal.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

function closePreviewModal() {
  const modal = document.getElementById('preview-modal')
  const playerContainer = document.getElementById('preview-player-container')
  
  const player = document.getElementById('gallery-player')
  if (player) {
    try {
      player.pause()
    } catch (e) {}
  }
  
  playerContainer.innerHTML = ''
  modal.classList.add('hidden')
  document.body.style.overflow = ''
}

async function deleteFile(relPath, filename) {
  if (!confirm('Are you sure you want to permanently delete "' + filename + '" from server storage? This cannot be undone.')) {
    return
  }
  
  try {
    const res = await fetch('/api/files?path=' + encodeURIComponent(relPath), {
      method: 'DELETE'
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to delete file')
    
    loadGallery()
    
    const time = new Date().toLocaleTimeString()
    addLogLine(time, 'Successfully deleted asset: ' + filename, 'warning')
  } catch (err) {
    alert('Error deleting file: ' + (err.message || err))
  }
}

let jobId = null
let eventSource = null
let currentMediaTitle = ''
let currentMediaUploader = ''
let currentProbedUrl = ''

// Initial Boot logs
const bootTime = new Date().toLocaleTimeString()
addLogLine(bootTime, 'Initializing Yoinks Engine Service...', 'info')
addLogLine(bootTime, 'Awaiting input connection...', 'info')
addLogLine(bootTime, 'Standby. Enter media URL to start extraction.', 'success')

// Initialize Recent Yoinks
renderRecentYoinks()

function setStatus(msg, type='info'){
  document.getElementById('status-text').textContent = msg
  if (msg) {
    const time = new Date().toLocaleTimeString()
    addLogLine(time, msg, type)
  }
}

function clearAreas(){
  document.getElementById('choices-area').innerHTML=''
  document.getElementById('progress-area').innerHTML=''
  document.getElementById('result-area').innerHTML=''
}

function addLogLine(time, msg, type='info') {
  const container = document.getElementById('terminal-console')
  if (!container) return
  
  let colorClass = 'text-slate-400'
  if (type === 'error') colorClass = 'text-red-400 font-semibold'
  if (type === 'success') colorClass = 'text-emerald-400 font-semibold'
  if (type === 'warning') colorClass = 'text-amber-400'
  if (type === 'info-accent') colorClass = 'text-indigo-400'
  
  const p = document.createElement('p')
  p.className = 'break-words'
  p.innerHTML = '<span class="text-slate-600">['+time+']</span> <span class="'+colorClass+'">'+esc(msg)+'</span>'
  container.appendChild(p)
  container.scrollTop = container.scrollHeight
}

function clearTerminal() {
  const container = document.getElementById('terminal-console')
  if (container) {
    container.innerHTML = ''
    const time = new Date().toLocaleTimeString()
    addLogLine(time, 'Terminal console cleared.', 'info')
  }
}

function fillPreset(platform) {
  const urlInput = document.getElementById('url-input')
  const time = new Date().toLocaleTimeString()
  if (platform === 'youtube') {
    urlInput.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    addLogLine(time, 'Loaded classic YouTube stream seed preset.', 'info-accent')
  } else if (platform === 'x') {
    urlInput.value = 'https://x.com/NASA/status/1800000000000000000'
    addLogLine(time, 'Loaded X / Twitter space telemetry feed preset.', 'info-accent')
  } else if (platform === 'instagram') {
    urlInput.value = 'https://www.instagram.com/p/C-aaaaa/'
    addLogLine(time, 'Loaded Instagram reels feed preset.', 'info-accent')
  } else if (platform === 'tiktok') {
    urlInput.value = 'https://www.tiktok.com/@khaby.lame/video/1234567890'
    addLogLine(time, 'Loaded TikTok short-form loop preset.', 'info-accent')
  }
  
  // Clear any existing active states and light up input node
  updateVisualNodes('standby')
  activateNode('node-1', 'node-1-indicator', 'yellow', 'URL Submitted', 'Ready to Probe')
}

// Visual Node State Machine Handler
function updateVisualNodes(phase, details = {}) {
  const indicators = ['node-1-indicator', 'node-2-indicator', 'node-3-indicator', 'node-4-indicator', 'node-5-indicator', 'node-6-indicator']
  indicators.forEach(indId => {
    const el = document.getElementById(indId)
    if (el) el.className = "w-1.5 h-1.5 rounded-full bg-slate-500"
  })

  const nodeIds = ['node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6']
  nodeIds.forEach(nId => {
    const el = document.getElementById(nId)
    if (el) el.className = "absolute -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-800 border border-slate-700 rounded-lg p-1.5 px-3 flex items-center gap-2 shadow-md transition-all duration-300"
  })

  const lines = ['line-1-2', 'line-1-3', 'line-2-4', 'line-3-4', 'line-4-5', 'line-5-6']
  lines.forEach(lId => {
    const el = document.getElementById(lId)
    if (el) {
      el.setAttribute('stroke', '#1e293b')
      el.removeAttribute('class')
    }
  })

  if (phase === 'probing') {
    activateNode('node-1', 'node-1-indicator', 'yellow', 'URL Entered', 'Active')
    activateNode('node-2', 'node-2-indicator', 'purple', 'Probing Stream', 'Fetching...')
    activateLine('line-1-2')
    document.getElementById('canvas-status-text').textContent = 'PROBING MEDIA STREAMS'
    document.getElementById('canvas-status-pulse').className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75'
    document.getElementById('canvas-status-dot').className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500'
  } else if (phase === 'picking') {
    completeNode('node-1', 'node-1-indicator', 'URL Entered', 'Valid')
    completeNode('node-2', 'node-2-indicator', 'Probing Stream', 'Done')
    completeNode('node-3', 'node-3-indicator', 'Engine Analyzer', 'Ready')
    activateNode('node-4', 'node-4-indicator', 'blue', 'Format Selected', 'Waiting')
    activateLine('line-1-2')
    activateLine('line-1-3')
    activateLine('line-2-4')
    activateLine('line-3-4')
    document.getElementById('canvas-status-text').textContent = 'WAITING FOR FORMAT PICK'
    document.getElementById('canvas-status-pulse').className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'
    document.getElementById('canvas-status-dot').className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500'
  } else if (phase === 'downloading') {
    completeNode('node-1', 'node-1-indicator', 'URL Entered', 'Valid')
    completeNode('node-2', 'node-2-indicator', 'Probing Stream', 'Done')
    completeNode('node-3', 'node-3-indicator', 'Engine Analyzer', 'Ready')
    completeNode('node-4', 'node-4-indicator', 'Format Selected', 'Done')
    
    if (details.processing) {
      activateNode('node-5', 'node-5-indicator', 'pink', 'Ffmpeg Processing', 'Processing')
      activateLine('line-4-5')
      document.getElementById('canvas-status-text').textContent = 'FFMPEG CONVERTING'
      document.getElementById('canvas-status-pulse').className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75'
      document.getElementById('canvas-status-dot').className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500'
    } else {
      activateNode('node-4', 'node-4-indicator', 'green', 'Format Selected', 'Streaming')
      activateLine('line-4-5')
      document.getElementById('canvas-status-text').textContent = 'STREAMING RAW DATA'
      document.getElementById('canvas-status-pulse').className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'
      document.getElementById('canvas-status-dot').className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500'
    }
    lines.forEach(lId => activateLine(lId))
  } else if (phase === 'done') {
    completeNode('node-1', 'node-1-indicator', 'URL Entered', 'Valid')
    completeNode('node-2', 'node-2-indicator', 'Probing Stream', 'Done')
    completeNode('node-3', 'node-3-indicator', 'Engine Analyzer', 'Ready')
    completeNode('node-4', 'node-4-indicator', 'Format Selected', 'Done')
    completeNode('node-5', 'node-5-indicator', 'Ffmpeg Processing', 'Done')
    activateNode('node-6', 'node-6-indicator', 'green', 'File Dispatched', 'Completed')
    lines.forEach(lId => activateLine(lId))
    document.getElementById('canvas-status-text').textContent = 'YOINK PROCESS COMPLETE'
    document.getElementById('canvas-status-pulse').className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'
    document.getElementById('canvas-status-dot').className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500'
  } else if (phase === 'error') {
    activateNode('node-1', 'node-1-indicator', 'red', 'Job Failed', 'Error')
    document.getElementById('canvas-status-text').textContent = 'MEDIA PIPELINE FAULT'
    document.getElementById('canvas-status-pulse').className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'
    document.getElementById('canvas-status-dot').className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500'
  } else {
    document.getElementById('canvas-status-text').textContent = 'YOINKS ENGINE STANDBY'
    document.getElementById('canvas-status-pulse').className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'
    document.getElementById('canvas-status-dot').className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500'
  }
}

function activateNode(nodeId, indicatorId, color, title, statusText) {
  const node = document.getElementById(nodeId)
  const ind = document.getElementById(indicatorId)
  const sub = document.getElementById(nodeId + '-sub')
  
  if (ind) {
    if (color === 'yellow') ind.className = "w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse"
    else if (color === 'purple') ind.className = "w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse"
    else if (color === 'blue') ind.className = "w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse"
    else if (color === 'green') ind.className = "w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"
    else if (color === 'pink') ind.className = "w-1.5 h-1.5 rounded-full bg-[#ec4899] animate-pulse"
    else if (color === 'red') ind.className = "w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"
  }
  
  if (node) {
    if (color === 'yellow') node.className = "absolute -translate-x-1/2 -translate-y-1/2 z-10 bg-amber-950/90 border-2 border-amber-500 rounded-lg p-1.5 px-3 flex items-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all duration-300 scale-105"
    else if (color === 'purple') node.className = "absolute -translate-x-1/2 -translate-y-1/2 z-10 bg-indigo-950/90 border-2 border-indigo-500 rounded-lg p-1.5 px-3 flex items-center gap-2 shadow-[0_0_12px_rgba(99,102,241,0.4)] transition-all duration-300 scale-105"
    else if (color === 'blue') node.className = "absolute -translate-x-1/2 -translate-y-1/2 z-10 bg-sky-950/90 border-2 border-sky-500 rounded-lg p-1.5 px-3 flex items-center gap-2 shadow-[0_0_12px_rgba(14,165,233,0.4)] transition-all duration-300 scale-105"
    else if (color === 'green') node.className = "absolute -translate-x-1/2 -translate-y-1/2 z-10 bg-emerald-950/90 border-2 border-emerald-500 rounded-lg p-1.5 px-3 flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-300 scale-105"
    else if (color === 'pink') node.className = "absolute -translate-x-1/2 -translate-y-1/2 z-10 bg-pink-950/90 border-2 border-pink-500 rounded-lg p-1.5 px-3 flex items-center gap-2 shadow-[0_0_12px_rgba(236,72,153,0.4)] transition-all duration-300 scale-105"
    else if (color === 'red') node.className = "absolute -translate-x-1/2 -translate-y-1/2 z-10 bg-red-950/90 border-2 border-red-500 rounded-lg p-1.5 px-3 flex items-center gap-2 shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all duration-300"
  }
  
  if (sub) {
    sub.textContent = statusText
    if (color === 'red') sub.className = "text-[8px] text-red-400 font-semibold"
    else if (color === 'yellow') sub.className = "text-[8px] text-amber-400 font-semibold"
    else if (color === 'purple') sub.className = "text-[8px] text-indigo-400 font-semibold"
    else if (color === 'blue') sub.className = "text-[8px] text-sky-400 font-semibold"
    else if (color === 'green') sub.className = "text-[8px] text-emerald-400 font-semibold"
    else if (color === 'pink') sub.className = "text-[8px] text-pink-400 font-semibold"
  }
}

function completeNode(nodeId, indicatorId, title, statusText) {
  const node = document.getElementById(nodeId)
  const ind = document.getElementById(indicatorId)
  const sub = document.getElementById(nodeId + '-sub')
  
  if (ind) ind.className = "w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
  if (node) node.className = "absolute -translate-x-1/2 -translate-y-1/2 z-10 bg-[#062e16]/90 border-2 border-emerald-600 rounded-lg p-1.5 px-3 flex items-center gap-2 shadow-md transition-all duration-300"
  if (sub) {
    sub.textContent = statusText
    sub.className = "text-[8px] text-emerald-400 font-semibold"
  }
}

function activateLine(lineId) {
  const line = document.getElementById(lineId)
  if (line) {
    line.setAttribute('stroke', '#6366f1')
    line.setAttribute('class', 'active-path')
  }
}

async function startProbe(){
  const url = document.getElementById('url-input').value.trim()
  if(!url){
    setStatus('Please paste a valid URL.', 'error')
    return
  }
  currentProbedUrl = url
  clearAreas()
  setStatus('Probing video streams metadata…', 'warning')
  updateVisualNodes('probing')
  
  if(eventSource){eventSource.close();eventSource=null}
  document.getElementById('probe-btn').disabled=true
  try{
    const res = await fetch('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})})
    if(!res.ok){
      const e=await res.json()
      setStatus('Probe failed: '+(e.error||res.status), 'error')
      updateVisualNodes('error')
      document.getElementById('probe-btn').disabled=false
      return
    }
    const {jobId:id,count}=await res.json()
    jobId=id
    document.getElementById('active-streams-badge').textContent = count
    listenJob(id)
  }catch(e){
    setStatus('Network connection error: '+e.message, 'error')
    updateVisualNodes('error')
    document.getElementById('probe-btn').disabled=false
  }
}

function listenJob(id){
  eventSource=new EventSource('/api/jobs/'+id+'/events')
  eventSource.onmessage=e=>{
    const s=JSON.parse(e.data)
    handleStatus(s,id)
  }
  eventSource.onerror=()=>{
    setStatus('SSE stream connection terminated.', 'warning')
    document.getElementById('probe-btn').disabled=false
  }
}

function handleStatus(s,id){
  if(s.phase==='probing'){
    setStatus(s.status, 'info')
    updateVisualNodes('probing')
  } else if(s.phase==='picking'){
    currentMediaTitle = s.title || 'Untitled Video'
    currentMediaUploader = s.uploader || 'Unknown'
    // Update core metadata context
    document.getElementById('meta-concept').textContent = s.title || 'N/A'
    document.getElementById('meta-uploader').textContent = s.uploader || 'Batch Job'
    document.getElementById('meta-duration').textContent = s.duration ? fmtDuration(s.duration) : 'Batch Item(s)'
    
    setStatus('Source information extracted. Select desired formats.', 'success')
    updateVisualNodes('picking')
    
    const isBest = document.getElementById('best-checkbox').checked
    const isMp3 = document.getElementById('mp3-checkbox').checked
    if (isMp3) {
      const audioIdx = s.choices.findIndex(c => c.kind === 'audio')
      const targetIdx = audioIdx !== -1 ? audioIdx : s.choices.length - 1
      startDownload(id, targetIdx)
    } else if (isBest) {
      startDownload(id, 0)
    } else {
      renderChoices(s,id)
    }
  } else if(s.phase==='downloading'){
    setStatus('')
    updateVisualNodes('downloading', {processing: s.processing})
    renderProgress(s)
  } else if(s.phase==='done'){
    setStatus('Job execution finalized successfully.', 'success')
    updateVisualNodes('done')
    renderDone(s.filepath)
    document.getElementById('probe-btn').disabled=false
    saveRecentYoink(currentMediaTitle, currentMediaUploader, currentProbedUrl)
    if(eventSource){eventSource.close();eventSource=null}
  } else if(s.phase==='error'){
    setStatus('Execution failure: ' + s.message, 'error')
    updateVisualNodes('error')
    renderError(s.message)
    document.getElementById('probe-btn').disabled=false
    if(eventSource){eventSource.close();eventSource=null}
  }
}

function renderChoices(s,id){
  const area=document.getElementById('choices-area')
  let html='<div class="mt-4 p-4 bg-slate-50 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0_0_#090d16]">'
  html += '<p class="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide flex items-center gap-1">📋 Select Output Stream Formats</p>'
  html += '<div class="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">'
  for(const c of s.choices){
    const kindClass = c.kind === 'audio' ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100' : 'border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
    const kindIcon = c.kind === 'audio' ? '🎵' : '🎬'
    html+='<button class="choice-btn w-full text-left border-2 border-slate-900 rounded-lg p-2.5 text-xs font-semibold flex items-center justify-between transition-all '+kindClass+'" onclick="startDownload(\\'' +id+'\\','+c.index+')">'
    html+='<span class="flex items-center gap-1.5"><span>'+kindIcon+'</span> '+esc(c.label)+'</span>'
    html+='<span class="text-[9px] font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-500 uppercase">Yoink Stream</span>'
    html+='</button>'
  }
  html+='</div></div>'
  area.innerHTML=html
}

function renderProgress(s){
  const area=document.getElementById('progress-area')
  const pct=s.progress&&s.progress.totalBytes?Math.round(s.progress.downloadedBytes/s.progress.totalBytes*100):null
  let meta=''
  if(s.processing){
    meta='⚙ Processing and combining streams with Ffmpeg transcoder…'
  } else if(s.progress){
    if(s.progress.totalParts > 1) {
      meta += '[Part ' + (s.progress.part + 1) + '/' + s.progress.totalParts + '] '
    }
    if(s.progress.speed)meta+= '🚀 ' + fmtSpeed(s.progress.speed)+' &nbsp;·&nbsp; '
    if(s.progress.eta)meta+= '⏳ ' + fmtEta(s.progress.eta)+' left &nbsp;·&nbsp; '
    if(pct!==null)meta+=pct+'%'
  }
  
  let html = '<div class="mt-4 p-4 bg-slate-900 text-slate-100 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0_0_#090d16]">'
  html += '<div class="flex justify-between items-center mb-1.5">'
  html += '<span class="text-xs font-bold font-mono tracking-tight text-indigo-400 max-w-[80%] truncate">' + esc(s.choiceLabel) + '</span>'
  html += '<span class="text-xs font-bold font-mono text-indigo-300">' + (pct !== null ? pct + '%' : 'Streaming') + '</span>'
  html += '</div>'
  html += '<div class="w-full bg-slate-800 rounded-full h-3.5 border border-slate-700 overflow-hidden mb-2">'
  html += '<div class="bg-indigo-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.6)]" style="width: ' + (pct ?? 0) + '%"></div>'
  html += '</div>'
  html += '<p class="text-[10px] font-mono text-slate-400">' + meta + '</p>'
  html += '</div>'
  
  area.innerHTML = html
}

function renderDone(fp){
  document.getElementById('progress-area').innerHTML=''
  let html = '<div class="mt-4 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl shadow-[2px_2px_0_0_#052e16] flex items-start gap-3 animate-bounce">'
  html += '<div class="p-2 bg-emerald-500 text-white rounded-lg border-2 border-emerald-600 flex items-center justify-center">'
  html += '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>'
  html += '</div>'
  html += '<div class="flex-1">'
  html += '<h4 class="font-display font-bold text-sm text-emerald-800 mb-0.5">✓ Yoinked Successfully!</h4>'
  html += '<p class="text-xs text-emerald-700 font-mono break-all bg-emerald-100/40 p-1.5 rounded border border-emerald-200">' + esc(fp) + '</p>'
  html += '</div></div>'
  document.getElementById('result-area').innerHTML = html
}

function renderError(msg){
  document.getElementById('choices-area').innerHTML=''
  document.getElementById('progress-area').innerHTML=''
  let html = '<div class="mt-4 p-4 bg-red-50 border-2 border-red-500 rounded-xl shadow-[2px_2px_0_0_#7f1d1d] flex items-start gap-3">'
  html += '<div class="p-2 bg-red-500 text-white rounded-lg border-2 border-red-600 flex items-center justify-center">'
  html += '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>'
  html += '</div>'
  html += '<div class="flex-1">'
  html += '<h4 class="font-display font-bold text-sm text-red-800 mb-0.5">✗ Job Error</h4>'
  html += '<p class="text-xs text-red-700">' + esc(msg) + '</p>'
  html += '</div></div>'
  document.getElementById('result-area').innerHTML = html
}

async function startDownload(id,choiceIndex){
  const outDir=document.getElementById('outdir-input').value.trim()||'/downloads'
  const subfolder=document.getElementById('subfolder-input').value.trim()
  const embedChapters=document.getElementById('embed-chapters-checkbox').checked
  document.getElementById('choices-area').innerHTML=''
  document.getElementById('result-area').innerHTML=''
  setStatus('Spinning up localized download subprocess…', 'warning')
  try {
    const res = await fetch('/api/jobs/'+id+'/download',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({choiceIndex,outDir,subfolder,embedChapters})
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Download request failed (' + res.status + ')')
    }
  } catch (e) {
    setStatus('Failed to start download: ' + (e.message || e), 'error')
    updateVisualNodes('error')
    document.getElementById('probe-btn').disabled=false
  }
}

function esc(s){if(!s)return '';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function fmtSpeed(bps){const k=bps/1024;if(k<1024)return k.toFixed(0)+' KB/s';return (k/1024).toFixed(1)+' MB/s'}
function fmtEta(s){const m=Math.floor(s/60);const ss=Math.floor(s%60);return m>0?m+'m '+ss+'s':ss+'s'}
function fmtDuration(seconds) {
  if (!seconds) return 'N/A';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }
  return m + ':' + String(s).padStart(2, '0');
}

function saveRecentYoink(title, uploader, url) {
  if (!title || !url) return;
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem('recent_yoinks') || '[]');
  } catch(e) {}
  
  // Remove duplicate items to place latest at top
  list = list.filter(item => item.url !== url && item.title !== title);
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  list.unshift({ title, uploader, url, time });
  
  if (list.length > 5) {
    list = list.slice(0, 5);
  }
  
  try {
    localStorage.setItem('recent_yoinks', JSON.stringify(list));
  } catch(e) {}
  renderRecentYoinks();
}

function renderRecentYoinks() {
  const listContainer = document.getElementById('recent-yoinks-list');
  if (!listContainer) return;
  
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem('recent_yoinks') || '[]');
  } catch(e) {}
  
  if (list.length === 0) {
    listContainer.innerHTML = '<p class="text-[10px] text-slate-400 italic">No recent downloads yet.</p>';
    return;
  }
  
  let html = '';
  for (const item of list) {
    html += '<div class="group relative flex items-center justify-between bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg p-2 transition-all duration-200">';
    html += '  <div class="flex-1 min-w-0 cursor-pointer" onclick="fillAndProbe(\\'' + esc(item.url) + '\\')">';
    html += '    <div class="text-[11px] font-bold text-slate-800 truncate group-hover:text-indigo-900" title="' + esc(item.title) + '">' + esc(item.title) + '</div>';
    html += '    <div class="text-[9px] text-slate-400 group-hover:text-indigo-400 font-medium flex items-center gap-1.5 mt-0.5">';
    html += '      <span class="truncate max-w-[80px]">👤 ' + esc(item.uploader) + '</span>';
    html += '      <span>•</span>';
    html += '      <span>🕒 ' + esc(item.time) + '</span>';
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">';
    html += '    <button onclick="copyToClipboard(\\'' + esc(item.url) + '\\', this)" class="p-1 text-slate-400 hover:text-indigo-600 rounded bg-white border border-slate-200 hover:shadow-sm" title="Copy URL">';
    html += '      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';
  }
  listContainer.innerHTML = html;
}

function clearRecentYoinks() {
  if (confirm('Are you sure you want to clear your download history?')) {
    localStorage.removeItem('recent_yoinks');
    renderRecentYoinks();
  }
}

function fillAndProbe(url) {
  const input = document.getElementById('url-input');
  if (input) {
    input.value = url;
    input.classList.add('ring-2', 'ring-indigo-500');
    setTimeout(() => input.classList.remove('ring-2', 'ring-indigo-500'), 1000);
    startProbe();
  }
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = '<svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>';
    setTimeout(() => { btn.innerHTML = original; }, 1500);
  }).catch(() => {
    alert('Failed to copy URL');
  });
}

async function checkAuthStatus() {
  try {
    const res = await fetch('/api/auth/check')
    if (!res.ok) return
    const data = await res.json()
    const loginScreen = document.getElementById('login-screen')
    const logoutBtn = document.getElementById('logout-btn')
    if (data.authEnabled) {
      if (logoutBtn) logoutBtn.classList.remove('hidden')
      if (!data.authenticated) {
        if (loginScreen) loginScreen.classList.remove('hidden')
        document.body.style.overflow = 'hidden'
      } else {
        if (loginScreen) loginScreen.classList.add('hidden')
        document.body.style.overflow = ''
      }
    } else {
      if (loginScreen) loginScreen.classList.add('hidden')
      if (logoutBtn) logoutBtn.classList.add('hidden')
      document.body.style.overflow = ''
    }
  } catch (e) {}
}

async function doLogin() {
  const input = document.getElementById('login-password')
  const errEl = document.getElementById('login-error')
  const pass = input ? input.value : ''
  if (!pass) return
  if (errEl) errEl.classList.add('hidden')
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({password: pass})
    })
    const data = await res.json()
    if (res.ok && data.ok) {
      location.reload()
    } else {
      if (errEl) {
        errEl.textContent = '⚠️ ' + (data.error || 'Invalid password or PIN')
        errEl.classList.remove('hidden')
      }
    }
  } catch (e) {
    if (errEl) {
      errEl.textContent = '⚠️ Network error'
      errEl.classList.remove('hidden')
    }
  }
}

async function doLogout() {
  if (!confirm('Are you sure you want to log out of Yoinks Workspace?')) return
  try {
    await fetch('/api/auth/logout', {method: 'POST'})
    location.reload()
  } catch (e) {}
}

checkAuthStatus()
</script>
</body>
</html>`
