# Glow Autopsy Pinball

A standalone browser pinball game based on `concept.png` and `concept.svg`.

## Play

Open `index.html` in a modern browser. No build or package installation is needed.
Alternatively, run `node server.cjs` and visit http://127.0.0.1:4173.

- **Space** / **Begin procedure**: release a ball, or restart after three balls.
  During play, **Space** / **Nudge table** nudges the ball loose.
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

Canvas 2D creates the 2.5D appearance with raised organ faces, shadows, highlights,
neon rails, and a reflective ball. `art-data.js` contains paths extracted from the original SVG. `art-polish.js`
adds a smoother outer silhouette, generated foot sprites with matching collision
outlines, and cached generated brain, stomach, bone and mouth materials. The visible silhouettes generate collision outlines
sampled at 3-unit intervals. The mouth is a solid bumper; its teeth are raised
decorations on that same obstacle. Physics runs at a fixed 240 Hz with capped ball speed to prevent
tunneling. The red boundary is open between the leg flippers; exiting below it
loses a ball. Audio is generated with the Web Audio API after user interaction.

The game has no runtime JavaScript dependencies or remote game assets.
The generated texture PNGs are bundled in `assets/`; their prompts and generation
method are documented in `assets/GENERATION.md` and `assets/ADDITIONAL-GENERATION.md`. Google
Fonts optionally supplies the interface typefaces, with local font fallbacks.
The source PNG, SVG, and Illustrator document are preserved unchanged.

Files: `index.html`, `style.css`, `game.js`, `art-data.js`, `art-polish.js`,
and `assets/` form the complete static game and can be served by any static web host. `server.cjs` is a local
preview helper and is not needed for hosting.

Desktop, narrow-panel, and phone layouts allocate the available viewport height
to the table, preserving its aspect ratio. Verified at 1366×768, 1280×600,
1024×600, and 700×650. Open `tests.html` to run the isolated game verification
harness, including solid-mouth and foot-flipper collision checks.

The feet rest at a slight upward angle and absorb passive rebounds. Powered
flipper shots aim toward the side lanes; game motion runs at 1.2× pace without
speeding up tilt penalty countdowns. `tests.html` also verifies nudge cooldowns,
tilt warnings, temporary lockout and recovery.
