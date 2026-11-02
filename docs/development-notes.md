# Football Championship Arena

A free, independent football game built with ChatGPT Work and Sites.

[Play the live game](https://football-championship-arena.nuttybeam2.chatgpt.site)

## Play

- **Play a match:** begin a standalone 90-second offline match.
- **Championships:** choose from 195 countries, 24 original clubs, and 26 custom competition options. Up to eight entrants per tournament.
- **Online rooms:** 2–8 people join by room code. Server-authoritative results, validated inputs, host permissions, expiring rooms and request limits.
- **Road to Glory:** five solo chapters with passing practice, scoring challenges, a rainy derby, golden goal and a final. Stars unlock later chapters and save on the device.
- **Football gallery:** credited historical Messi/Mbappé photographs, a World Cup trophy photograph and two UEFA reference logos. Matches use original animated characters, not official player squads.
- **Install / offline:** use Prepare offline while connected; use the browser's Install app or Add to Home Screen option where supported. This is an installable web app, not an app-store package.

## Controls

| Action | Player 1 | Player 2 on same keyboard |
| --- | --- | --- |
| Move | WASD or arrow keys | IJKL |
| Shoot | Space | O |
| Pass | E | P |
| Switch player | Q | U |
| Sprint & Skill | Shift | Y |
| Through ball | F | H |
| Clear | R | N |

An analog touch joystick and Pass, Through, Sprint & Skill, Clear and Shot buttons are included. Matches use original articulated 3D footballers, stadium geometry and a software projection fallback when WebGL is unavailable. No commercial football game assets are used. Sprint uses stamina. Shots move through the pitch and goalkeepers can save them. Standard pitch fixtures have two three-minute halves; the standalone quick-play match lasts 90 seconds. Tactical and manager modes remain available.

## Custom formats

Cups: two groups, semi-finals and final. Qualifiers: top two per group qualify. Leagues: single round robin. Win 3 / draw 1 / loss 0. These formats do not reproduce official competition rules, schedules or squads. The country roster differs from FIFA association membership; clubs are fictional.

## Development

The full application uses Vinext/Vite with a Cloudflare Worker and D1 for online room state. Sites provisions hosted storage. A static-only GitHub Pages deployment cannot run the online backend.

Use the project scripts with Node 22.13+ and the installed package manager. Generate migrations with `db:generate`; the Sites publishing workflow applies hosted migrations. Local D1 development requires the migration under `drizzle/` to be applied with the project's Wrangler configuration.

Tests:

```sh
node scripts/game-test.mjs
node scripts/pitch-test.mjs
GAME_TEST_ORIGIN=https://your-game-origin node scripts/api-test.mjs
```

The API test creates temporary game rooms. Do not run it against an unrelated site. No API keys or player accounts are needed to play.

## Media

See [media credits](public/media-credits.html) for original source pages, author credits and licenses. Photograph adaptations retain their stated CC BY / CC BY-SA licenses. UEFA logos are competition references; trademark rights remain with their owners. This game is not endorsed by FIFA, UEFA or the depicted players.

Original code-generated pitch characters, sound cues and interface are used. There are no paid features or purchases.

### Possession controls and accessibility fixes
With possession: E Pass, F Through, R Clear, Space Shot. Without possession: E standing tackle, F slide tackle, R or Q switch, hold Space for assisted pressure. Tap the on-screen Sprint button to toggle assisted sprint on/off; keyboard players may hold Shift and move. Sprint consumes stamina. Manual tackles have range and recovery cooldowns. Shift+WASD is case-normalized. Original geometric kits have trim, stitched numbers, animated limbs and boot details, with a closer broadcast camera and selected-player labels.

### Commentary, original song and manual
Open Audio from the hub or match toolbar to opt into English speech commentary, captions, music and effects with independent volume controls. Commentary watches server/local match events without changing gameplay. Speech uses the browser speechSynthesis API; English voice availability and offline speech depend on the device. Captions work without a voice. The original instrumental “One Pitch, One World” is synthesized locally using Web Audio and loops until stopped. No external music service, recorded copyrighted song or API key is used. Audio starts only after a user gesture, suspends when the tab is hidden, and respects pause/mute controls.
The How to play page and in-match Help dialog share the same full manual, covering first kickoff, contextual controls, tackles, stamina, scoring, arcade rule limits, 2–8-player rooms, both alternative modes and offline play. Solo pitch matches pause while reading; online matches keep running.
