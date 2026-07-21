# yoinks

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
  <img src="assets/logo-light.svg" alt="yoinks" width="288">
</picture>

yoink any video. paste. yoink. done.

Download videos from YouTube, X/Twitter, Instagram, Threads, TikTok and
1,800+ other sites — right from your terminal. Paste a url, pick a
resolution (or audio-only mp3), done. No popups, no fake download buttons,
no sketchy redirects.

<img src="assets/home.png" alt="yoinks home screen — paste a link and hit yoink" width="100%">

## Install

```sh
npm install -g yoinks
```

Or try it without installing anything:

```sh
npx yoinks
```

Requires Node 18+. Everything else (yt-dlp, ffmpeg) is fetched or bundled
automatically.

## Usage

```sh
$ yoinks https://youtu.be/dQw4w9WgXcQ    # straight to the format picker
$ yoinks                                 # prompts for a url
$ yoinks --theme light                   # force the light palette
```

yoinks takes over the terminal (full-screen, centered — and restores your
scrollback on exit). Pick a format with ↑/↓ (or j/k, or number keys) and
hit enter. `esc` goes back, `^c` quits. Or just use the mouse — the yoink
button, the format list and the footer hints are all clickable, and
clicking the logo takes you back home. Files are saved to `~/Downloads`,
and the file path is printed to your terminal when you're done.

The default `auto` theme uses your terminal's own foreground and background,
so it follows light and dark terminal themes without guessing. Press `^t` or
click the theme control in the footer to cycle through `auto`, `light`, and
`dark` for the current session. Use `--theme auto`, `--theme light`, or
`--theme dark` to choose the starting theme for one launch.

<img src="assets/download-options.png" alt="yoinks format picker — resolutions with estimated file sizes, plus audio-only mp3" width="100%">

## How it works

- Powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp). On first run,
  yoinks downloads the standalone yt-dlp binary to `~/.yoinks/bin` —
  no Python required. If you already have yt-dlp installed, it uses yours.
- ffmpeg (needed for merging high-res streams and mp3 extraction) is found
  on your PATH, with `ffmpeg-static` as a bundled fallback.
- The UI is [Ink](https://github.com/vadimdemedes/ink) — React for the
  terminal.

## WebUI + Docker

Run yoinks as a LAN-accessible WebUI with Docker Compose:

```sh
docker compose up --build
```

Then open `http://localhost:3000` on the host, or from another device on your
LAN: `http://<host-lan-ip>:3000`. Downloads are written to `./downloads` on the
host via the `/downloads` container mount.

The WebUI supports:

- URL input and format probing
- format selection
- real-time download progress over Server-Sent Events
- custom output directory (container path, default `/downloads`)
- batch downloads via newline- or comma-separated URLs
- optional Basic Auth via `BASIC_AUTH=user:pass`

For local non-Docker WebUI development:

```sh
npm run build
OUT_DIR=./downloads PORT=3000 npm run start:web
```

## Development

```sh
npm install
npm run build        # bundle CLI + WebUI server to dist/ with tsup
npm run dev          # rebuild on change
node dist/cli.js <url>
npm run start:web    # run the WebUI server after building
npm run typecheck
```

To try it as a global command without publishing: `npm link`, then run
`yoinks` anywhere.

## Roadmap & Status

- [x] `--best` / `--mp3` flags to skip the picker (scriptable mode)
- [x] `-o <dir>` to choose output folder
- [x] Playlist / thread-with-multiple-videos & batch URL support
- [x] Clipboard detection: launch bare and auto-suggest copied URL
- [x] Self-update for yt-dlp binary (`yoinks --update`)
- [x] Publish to npm (`npm i -g yoinks` / `npx yoinks`)
- [x] `curl -fsSL https://yoinks.sh/install.sh | sh` installer (`install.sh`)
- [x] Single-Page WebUI Media Workspace with Bento Grid & Media Gallery
- [x] Visual Login Screen, Session Cookie Auth (`AUTH_PASSWORD`), & Logout Button
- [x] Telegram Bot integration with live progress bar (`[████████░░]`) & audio format selector (MP3, M4A, Opus)
- [x] Docker & docker-compose container support

## A note on fair use

yoinks is a personal-archiving tool. Downloading content may violate a
platform's terms of service — only download what you have the right to
keep, and be excellent to creators.

## License

[MIT](LICENSE)
