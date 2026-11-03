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

## Temporary demonstration data

The homepage fixture data in `src/data/homepage.js` is illustrative only.
Featured studio names, locations, capacities, hourly rates, category labels,
ratings, and review counts are not live listings, verified reviews, or booking
availability. The hero slides, category labels, booking steps, and host-support
copy are also static presentation content.

Explore Studio results, studio details, user-created studio listings, reviews
and ratings, and bookings are not connected to MongoDB or an Express API.
There is no persistence or booking behavior in this client milestone. The
target remains an independently deployed Next.js client calling the separate
Express REST API, backed by MongoDB; database integration is pending.
