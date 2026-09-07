# Glow Autopsy Pinball

A standalone browser pinball game based on `concept.png` and `concept.svg`.

## Play

The game runs entirely in the browser. Players do not need Node, an installation,
or a backend. `index.html` loads the adjacent JavaScript, CSS, and texture files;
visual changes normally live in those files.

## Upload to itch.io

Upload `dist/glow-autopsy-pinball-itch.zip` as an **HTML Game**, and select
**This file will be played in the browser**. The archive contains `index.html`
at its root and all required scripts and artwork at relative paths.
Use **Click to launch in fullscreen**, or an embedded viewport of **1280 x 720**
with the fullscreen button enabled. Leave scrollbars disabled.

Cover art and store screenshots live in `assets/store/`; see the README there.

Regenerate the ZIP after edits by running `./tools/package-itch.ps1` in PowerShell.
Packaging needs no Node or npm. The ZIP excludes the preview server, tests,
original concept artwork, and unused images.

itch.io hosts the static files itself. For local development only, `server.cjs`
is an optional HTTP preview helper; any static file server works. Textures are embedded in `assets/texture-data.js` so opening `index.html`
directly does not require local image requests for WebGL. The packaging script
regenerates this file from the source PNGs.
Upload documentation: https://itch.io/docs/creators/html5

## Controls

- **Tab** / **View toggle** above the table: switch between perspective 3D and top-down
  orthographic 2.5D. Both retain textured geometry, lighting, and the current game.

- **Space** / **Begin procedure**: release a ball, or restart after three balls.
  During play, **Space** / **Nudge table** nudges the ball loose. Space keeps this
  action even when the view button has focus. Shift+Tab retains backward focus navigation.
- **Left / right arrows** or **A / D**: leg flippers. Hold to raise, release to lower.
- Two nudges within six seconds show a tilt warning; a third locks both feet for
  four seconds. The countdown is visible, and the controls recover automatically.
- **P**: pause / resume. Switching away also pauses the game.
- Touch devices have two independent flipper buttons below the table.
- Sound toggle controls synthesized launch, collision, flipper, and drain sounds.

Brain hits earn 500, eyes 250, stomach 200, and skeletal fragments and the solid black mouth 100 points.
Every 12 organ hits increases the multiplier, up to ×5. Three balls per procedure.
The personal best is saved locally when the procedure ends.

## Implementation

Three.js renders a perspective camera tilted 30 degrees from vertical, a shallow
3D cabinet, beveled extruded organ meshes, physically lit image textures, cast
shadows, raised neon rails, and a faceted translucent green crystal orb. Physics remains on the original
2D playfield coordinates. A loading screen crossfades into the first fully textured 3D frame over 650 ms.
The flat renderer is never shown; loading failures offer a retry. Controls remain
inactive until ready, and reduced-motion preferences disable the transition. `art-data.js` contains paths extracted from the original SVG. `art-polish.js`
adds a smoother outer silhouette, generated foot sprites with matching collision
outlines, and cached generated brain, stomach, bone and mouth materials. The visible silhouettes generate collision outlines
sampled at 3-unit intervals. The mouth is recessed, with teeth inside its cavity and a continuous raised
lip wall protecting the opening. Physics runs at a fixed 240 Hz with capped ball speed to prevent
tunneling. The red boundary is open between the leg flippers; exiting below it
loses a ball. Audio is generated with the Web Audio API after user interaction.

Three.js 0.185.1 is vendored locally in `vendor/three.js`, with its MIT license
in `vendor/THREE-LICENSE.txt`. There are no remote runtime scripts or game assets.
The generated texture PNGs are bundled in `assets/`; their prompts and generation
method are documented in `assets/GENERATION.md` and `assets/ADDITIONAL-GENERATION.md`. Google
Fonts optionally supplies the interface typefaces, with local font fallbacks.
The source PNG, SVG, and Illustrator document are preserved unchanged.

Files: `index.html`, `style.css`, `game.js`, `art-data.js`, `art-polish.js`,
`scene-3d.js`, `vendor/`, and `assets/` form the complete static game and can be served by any static web host. `server.cjs` is a local
preview helper and is not needed for hosting.

Desktop, narrow-panel, and phone layouts allocate the available viewport height
to the table, preserving its aspect ratio. Verified at 1366×768, 1280×600,
1024×600, 700×650, 599×479, and 568×320. Narrow landscape screens collapse the
title and controls onto one row so the table still fits without scrolling. Open `tests.html` to run the isolated game verification
harness, including solid-mouth and foot-flipper collision checks.

The feet rest at a slight upward angle and absorb passive rebounds. Powered
flipper shots aim toward the side lanes; game motion runs at 1.2× pace without
speeding up tilt penalty countdowns. `tests.html` also verifies nudge cooldowns,
tilt warnings, temporary lockout and recovery.

The stomach has a convex upper contour. Organ scoring requires a meaningful
impact and rearms only after the ball leaves a clearance zone, preventing
continuous contacts from generating repeated points. Tests cover the contour,
contact scoring, rearming, perspective projection, extrusion and shadow setup.

The title uses three separate transparent generated wordmarks, stacked on the
loading screen and wide sidebar and arranged horizontally in the narrow panel.
Assets and generation prompts are documented in `assets/LOGO-GENERATION.md`.

The specimen rests on a satin stainless-steel tray with a raised rim and sparse
alien residue. The deep-red playfield has branching subsurface veins and a
restrained tissue sheen over a barely visible grid.

A modeled steel scalpel with a grooved handle rests on the left of the specimen.

The irises sit on their own planes above the sclera and slide to follow the ball,
easing back to centre when no ball is live. Their travel is derived from the iris
size within the eye texture, so they stop short of the eyelid.

The ball is a dark emerald gem with restrained internal light. Its pooled glow
trail follows recent ball positions through rebounds, scaling length and opacity
with speed. Reduced-motion preferences suppress the trail.
