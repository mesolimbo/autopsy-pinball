# itch.io store assets

Artwork and screenshots for the itch.io project page. None of these ship with
the game; they are page decoration only.

| File | Use |
| --- | --- |
| `cover-630x500.png` | Project cover image (itch's recommended size) |
| `cover-source.png` | Generated source art, 1264×1008, cropped to produce the cover |
| `banner-1536x240.png` | Page banner, cropped from `banner-source.png` |
| `banner-source.png` | Generated source art, 1536×640 |
| `page-background.png` | Fixed page background, centred and not tiled |
| `screen-1-title.png` | Screenshot: title state |
| `screen-2-play.png` | Screenshot: ball in play, perspective 3D |
| `screen-3-topdown.png` | Screenshot: top-down 2.5D view |

Screenshots were captured from a local build at a 1440×900 viewport.

itch scales the banner to the full page width, so its aspect ratio sets its
height: 6.4:1 renders about 200px tall on a 1280px page.

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

**`banner-source.png`** — Wide cinematic banner for an alien autopsy pinball
game. Extremely wide panoramic composition. A satin stainless-steel autopsy tray
stretches across the frame under a moody clinical overhead light, holding a deep
blood-red translucent alien specimen with branching subsurface veins and faintly
glowing lime-green organs. Raised neon lime rails and chrome pinball flippers
catch the light. A dark emerald glass ball streaks across with a luminous lime
light trail. Dark forest-green laboratory background falling into near-black at
the left and right edges, scattered glass beakers barely visible in shadow.
Bioluminescent lime and mint highlights, restrained magenta tissue accents, rich
contrast, premium arcade cabinet illustration style. Large areas of calm dark
space at the far left and far right. No text, no words, no lettering, no logo,
no watermark, no UI elements.

**`page-background.png`** — A very dark, subtle, almost black background texture
for a web page. Deep forest-green to near-black brushed stainless steel
laboratory surface seen from directly above, with extremely faint branching
organic veins in dim lime green, a barely visible fine grid, soft vignette
darkening toward all edges, and a few sparse dim specks of residue. Very low
contrast, very dark overall, no bright areas, no focal point, evenly moody,
quiet and unobtrusive so that white text placed on top stays completely
readable. Abstract texture only. No text, no words, no lettering, no logo, no
objects, no characters, no UI elements.
