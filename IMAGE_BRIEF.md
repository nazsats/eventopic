# Eventopic — AI Image Generation Brief

You chose **AI-generated imagery**. This is your shot list. Generate each image with the
prompt provided, export at the listed size, and drop it into `public/images/` with the
**exact filename**. The site already has slots wired (or being wired) to these names, so
images appear automatically — no code needed from you.

> Tool: works in Midjourney, DALL·E 3, Ideogram, Flux, Leonardo, etc.
> **Aspect ratios:** Midjourney use `--ar` (e.g. `--ar 16:9`); others just request the size.

---

## Global art direction (keep every image consistent)

- **Look:** premium, editorial, cinematic — like a luxury Dubai event campaign.
- **Palette:** bright and airy with a **royal purple / violet** accent. Clean white and soft lavender tones, amethyst and orchid purples, with luminous highlights. Elegant, modern, luxurious — NOT dark.
- **Mood:** aspirational, professional, confident, welcoming. Real-feeling people, not stiff stock.
- **Setting:** UAE / Dubai — recognisable but tasteful (skyline, modern exhibition halls, luxury hotel ballrooms, marina, desert-meets-city).
- **People:** diverse, professional event staff (hosts/hostesses, promoters, models, ushers) in smart attire. Respectful, modest, polished styling appropriate for the UAE.
- **Composition:** leave some clean negative space (top or one side) for text overlay.

**Paste this STYLE SUFFIX onto every prompt:**
> `, cinematic editorial photography, bright airy luxury aesthetic, soft purple and violet color grade, elegant lavender tones, clean white highlights, shallow depth of field, ultra-detailed, high-end advertising campaign, 8k, photorealistic`

**Paste this NEGATIVE (where supported):**
> `--no text, watermark, logo, deformed hands, extra fingers, lowres, cartoon, oversaturated, garish neon`

---

## Shot list

| # | Filename (`public/images/…`) | Size (px) | Where it's used | Prompt (add STYLE SUFFIX) |
|---|------------------------------|-----------|-----------------|---------------------------|
| 1 | `hero-main.jpg` | 1920×1080 | Homepage hero background | "Elegant event hostess and brand ambassador team welcoming guests at a luxury product launch in Dubai, modern exhibition hall, Burj Khalifa visible through glass at dusk, gold accent lighting, professional uniforms" |
| 2 | `hero-portrait.jpg` | 1200×1500 | Homepage hero foreground / talent card | "Confident UAE event hostess in a tailored champagne-gold uniform, holding a tablet, soft smile, luxury hotel ballroom background bokeh" |
| 3 | `about-team.jpg` | 1600×1000 | About page | "A diverse team of event professionals (hosts, promoters, models, coordinators) standing together in a modern Dubai venue, confident group portrait, golden hour" |
| 4 | `service-staffing.jpg` | 1000×1200 | Services — Staffing card | "Professional ushers and registration staff at a corporate conference reception desk in Dubai, warm welcoming atmosphere" |
| 5 | `service-models.jpg` | 1000×1200 | Services — Models & Entertainment | "Elegant runway model and live performer at an upscale Dubai fashion event, stage lighting in gold tones" |
| 6 | `service-promotions.jpg` | 1000×1200 | Services — Promotions & Brand | "Energetic brand ambassadors and promoters at a busy mall activation booth in Dubai, branded (blank) backdrop, engaging shoppers" |
| 7 | `service-hospitality.jpg` | 1000×1200 | Services — Hospitality | "Skilled waitstaff and bartender serving canapés at a luxury rooftop event overlooking Dubai Marina at night" |
| 8 | `cta-banner.jpg` | 2000×800 | Footer / CTA band | "Wide cinematic shot of a glamorous gala event in a Dubai ballroom, staff in action, warm gold light, lots of empty space on the left for text" |
| 9 | `gallery-1.jpg` … `gallery-8.jpg` | 1200×1200 | Gallery grid | Mix: exhibition booth staff, hostesses at a launch, promoters sampling, models on stage, registration desk, VIP greeting, kiosk activation, group team shot — all Dubai venues |
| 10 | `og-image.png` | 1200×630 | Social share / SEO (`/og-image.png` in `public/`) | "Eventopic — bold editorial banner, luxury Dubai event scene, deep navy + gold, leave center-left clear for headline text" (add the wordmark yourself in Canva after) |
| 11 | `pattern-arabesque.png` | 1600×1600, transparent PNG | Subtle section background texture | "Minimal geometric Arabic arabesque line pattern, thin gold lines on transparent background, seamless, very subtle, luxury" |

---

## Tips
- Generate **2–3 variants** of #1 and #2 (the hero) and pick the best — it sets the tone.
- Keep faces **slightly turned or mid-action** rather than staring at camera — feels more premium and less stock.
- Export JPG at ~80% quality for photos (keeps the site fast), PNG only for #10/#11.
- After dropping files in `public/images/`, they're instantly live — if a file is missing, the section falls back to a tasteful gradient, so nothing breaks while you produce them.
- Want different crops/sizes? Tell me and I'll adjust the slots.
