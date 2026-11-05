# Homepage image sources

The homepage uses locally stored, resized JPEGs so it does not depend on
third-party image hosts at runtime. The assets were downloaded from the image
CDNs listed below and visually checked for subject fit.

All Unsplash assets are covered by the [Unsplash License](https://unsplash.com/license), which permits free use and modification, including commercial use.
Pexels images are covered by the [Pexels License](https://www.pexels.com/license/).
The image URLs identify the original CDN asset; source platform licensing does
not imply that a pictured person, venue, or brand endorses StudioSpace.

| Local file | Source |
|---|---|
| `public/images/hero/interior-studio.jpg` | [Unsplash photo-1600607687939-ce8a6c25118c](https://images.unsplash.com/photo-1600607687939-ce8a6c25118c) |
| `public/images/hero/recording-room.jpg` | [Unsplash photo-1598488035139-bdbb2231ce04](https://images.unsplash.com/photo-1598488035139-bdbb2231ce04) |
| `public/images/hero/live-session.jpg` | [Unsplash photo-1506157786151-b8491531f063](https://images.unsplash.com/photo-1506157786151-b8491531f063) |
| `public/images/categories/photography.jpg` | [Unsplash photo-1516035069371-29a1b244cc32](https://images.unsplash.com/photo-1516035069371-29a1b244cc32) |
| `public/images/categories/film.jpg` | [Unsplash photo-1485846234645-a62644f84728](https://images.unsplash.com/photo-1485846234645-a62644f84728) |
| `public/images/categories/podcast.jpg` | [Unsplash photo-1590602847861-f357a9332bbc](https://images.unsplash.com/photo-1590602847861-f357a9332bbc) |
| `public/images/categories/music.jpg` | [Unsplash photo-1511379938547-c1f69419868d](https://images.unsplash.com/photo-1511379938547-c1f69419868d) |
| `public/images/categories/events.jpg` | [Unsplash photo-1531058020387-3be344556be6](https://images.unsplash.com/photo-1531058020387-3be344556be6) (retained; no longer used for Art Workshops) |
| `public/images/categories/art-workshops.jpg` | [Unsplash photo by Andrii Solok](https://unsplash.com/photos/a-room-with-a-table-chairs-and-paintings-on-the-wall-mQ4eK73Hjtw), [source image](https://images.unsplash.com/photo-1698498441161-f1e66acd1cff) |
| `public/images/studios/daylight-loft.jpg` | [Unsplash photo-1497366754035-f200968a6e72](https://images.unsplash.com/photo-1497366754035-f200968a6e72) |
| `public/images/studios/northline-sound.jpg` | [Unsplash photo-1478737270239-2f02b77fc618](https://images.unsplash.com/photo-1478737270239-2f02b77fc618) |
| `public/images/studios/atelier-12.jpg` | [Unsplash photo-1524758631624-e2822e304c36](https://images.unsplash.com/photo-1524758631624-e2822e304c36) |
| `public/images/studios/the-vocal-room.jpg` | [Unsplash photo-1516280440614-37939bbacd81](https://images.unsplash.com/photo-1516280440614-37939bbacd81) |
| `public/images/studios/the-cut-room.jpg` | [Unsplash photo-1574717024653-61fd2cf4d44d](https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d) |
| `public/images/studios/the-foundry.jpg` | [Unsplash photo by Ashe Walker](https://unsplash.com/photos/a-room-with-a-easel-easel-paintbrushes-and-other-Lp7iAR8vp5M), [source image](https://images.unsplash.com/photo-1740710543611-80b658171bc3) |

## Data and image use

The hero slides, category descriptions, booking-step copy, and host-support
copy are static presentation content. The legacy studio fixtures in
`src/data/studios.js` remain illustrative and are not the current source for
homepage featured results, Explore results, or studio details. Those routes
request records from the independently deployed Express API. A missing studio
image can still use the local `daylight-loft.jpg` fallback in the card/gallery,
so a local image should not be read as proof of the listed venue's identity.

The Server also includes demo seed records. Neither fixture nor seed content
establishes that a venue, host, review, rating, or availability is independently
verified. The current Server does not provide a reviews API.

Studio listings can be created and edited through the authenticated Express
API. Booking requests are also submitted to the API and persisted as `Pending`;
this is not a host confirmation, availability guarantee, or payment. The
current application has no host approval/confirmation API or payment flow.
