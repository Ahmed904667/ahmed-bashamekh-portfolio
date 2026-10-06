# Portfolio redesign direction

Historical notes for the earlier bright design. The current portfolio direction is documented in MASTER.md.

## Job

Help a hiring manager understand Ahmed's shipped work quickly, then open a real product or its source. Use the CV for career context and the project repositories for project claims.

## Art direction

An energetic product-maker portfolio with a clear identity separate from the blue-on-navy branding of Hassel and Qabas. Make the work itself carry the proof: actual project imagery, concise case-study descriptions, and direct live/source links.

## Tokens

| Role | Token | Value |
| --- | --- | --- |
| Canvas | `--paper` | `#F3F4EE` |
| Primary text | `--ink` | `#17221E` |
| Feature color | `--ultramarine` | `#4541E8` |
| Secondary feature | `--tangerine` | `#FF7F52` |
| Highlight | `--citron` | `#E3F45A` |
| Quiet surface | `--mist` | `#E5E8F1` |

## Type

- Sora for display headlines and project titles.
- Inter for body text and controls.
- Sentence case for labels and navigation; no decorative all-caps eyebrows.

## Layout concept

```text
[AB]                                     Work   About   Contact

 I build software that gets used.     [real product imagery]
 Riyadh · Full-stack engineer         [overlapping product frames]
 [See projects] [Email me]

 Selected work
 [Hassel: wide case study with real product image + live link]
 [Invaro: case study] [Qabas: real brand + live link]
 [Sanad: repo-grounded case study]

 Short profile + timeline + technologies
 Contact
```

Use an asymmetric project composition with different image proportions, not four identical cards. Keep project labels and actions predictable so each work sample leads somewhere real.

## Review against the request

The previous direction read like a fabricated template: the hero and project art were invented, the page carried excessive metadata, and the project cards had no live or source destinations. This direction uses product-site imagery where available, avoids made-up screenshots and metrics, and puts genuine work links at the center. Do not infer technologies, authorship details, or Sanad facts from a project name alone.

## Quality constraints

- Responsive, keyboard usable, visible focus, readable contrast, reduced-motion support.
- No statistics or shipped feature claims unless the user supplied them or a repository verifies them.
- Live/source actions must point to the actual project.
