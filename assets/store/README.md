# itch.io store assets

Artwork and screenshots for the itch.io project page. None of these ship with
the game; they are page decoration only.

| File | Use |
| --- | --- |
| `cover-630x500.png` | Project cover image (itch's recommended size) |
| `cover-source.png` | Generated source art, 1264×1008, cropped to produce the cover |
| `banner-ball.png` | Page banner, the centre band of `banner-ball-source.png` |
| `banner-ball-source.png` | Generated source art, 1536×512 |
| `page-background.png` | Fixed page background, centred and not tiled |
| `screen-1-perspective-3d.png` | Screenshot: perspective 3D view |
| `screen-2-topdown-25d.png` | Screenshot: top-down 2.5D view |

The two screenshots deliberately show the game's two view modes, captured from
the same ball at a 1440×900 viewport.

itch scales the banner to the full page width, so its aspect ratio sets its
height: 6.4:1 renders about 200px tall on a 1280px page. The image model caps at
3:1, so the banner is generated as a horizontal streak centred in a 3:1 frame
and cropped to the band containing the trail.

## Page theme

Values set in itch's theme editor, taken from `style.css`:

| Setting | Value |
| --- | --- |
| BG / BG 2 | `#0b110f` / `#121c17` |
| Text | `#dbe4d6` |
| Link, headers, buttons | `#c9ff88` |
| Body font / header font | Inter / IBM Plex Mono |

## Generation prompts

Each source image was generated with an image model.

**`cover-source.png`** — Game store cover art for an itch.io HTML5 pinball game
called "Glow Autopsy Pinball". Landscape composition. A stylized alien specimen
laid out on a satin stainless-steel autopsy tray, viewed as a neon pinball
playfield: deep blood-red translucent body with branching subsurface veins,
exposed glowing organs (brain, eyes, stomach) rendered as beveled enamel pinball
targets, raised neon lime rails, chrome leg flippers at the bottom. A dark
emerald glass ball leaves a luminous lime light trail curving across the table.
Dark forest-green laboratory background, moody clinical overhead light,
cinematic rim lighting, rich contrast, premium arcade cabinet illustration
style, bioluminescent lime and mint highlights with restrained magenta tissue
accents. Highly polished digital illustration, no text, no words, no lettering,
no logo, no watermark, no UI elements.

**`banner-ball-source.png`** — Stylized cartoon illustration, wide letterbox
banner, artwork filling the entire frame edge to edge with no black bars.
Composed as a strong horizontal band across the exact vertical centre. A plain
smooth glossy dark emerald green glass sphere streaks horizontally through the
middle of the image, dragging a long clean lime-green light trail behind it that
stretches off the left edge in a straight horizontal line. The sphere is a
simple polished gem ball with only a soft white highlight on it: absolutely no
skull, no face, no eyes, no symbol, no logo, no marking of any kind on the ball.
It rushes past friendly stylized alien anatomy: smooth rounded shapes of deep
muted blood-red and dark maroon tissue with simple curved vein lines, and a
plump cartoon brain with soft muted dusty-pink rounded lobes on the right.
Restrained dark palette built on deep forest green, dark maroon and lime green,
not bright, not candy-coloured, no hot pink, no bubblegum. Clean vector-like
illustration with bold simplified forms, smooth flat gradients, glossy beveled
surfaces and crisp highlights, like polished arcade cabinet art. Playful spooky
mood, not realistic, not gory, no wet slimy detail, no blood. Near-black shadows
at the far left and far right edges. No text, no words, no lettering, no
watermark, no UI elements, no pinball table, no machinery.

A photoreal treatment of this scene read as gore rather than arcade art, and
asking only for "cartoon" put a skull on the ball. Both negatives above are
load-bearing.

**`page-background.png`** — A very dark, subtle, almost black background texture
for a web page. Deep forest-green to near-black brushed stainless steel
laboratory surface seen from directly above, with extremely faint branching
organic veins in dim lime green, a barely visible fine grid, soft vignette
darkening toward all edges, and a few sparse dim specks of residue. Very low
contrast, very dark overall, no bright areas, no focal point, evenly moody,
quiet and unobtrusive so that white text placed on top stays completely
readable. Abstract texture only. No text, no words, no lettering, no logo, no
objects, no characters, no UI elements.
