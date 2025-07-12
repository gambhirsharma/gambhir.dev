---
title: Building Jardinains using Amazon-q
description: Reliving childhood memories through code, one brick at a time
date: 2025-07-11
duration: 7min
tags: [AWS, Amazon-q, Python, Pygame, CLI]
---

![background](/blog-assets/jardinains-cli-game/jardinains.png)

> This is my submition for Amazon Q Build Games Challenge

### The Spark of Nostalgia

Imagine this: It’s 2008, and I’m sitting next to my father at his new Acer Aspire laptop. The room echoes with the satisfying [sounds](https://downloads.khinsider.com/game-soundtracks/album/jardinains-windows-gamerip-2001) of bouncing balls and shattering bricks as we take turns playing [Jardinains](https://www.google.com/search?q=Jardinains&sourceid=chrome&ie=UTF-8)!, each of us determined to beat the other’s high score. Those moments of friendly rivalry and shared laughter became some of my most treasured childhood memories.

Now, as an engineering student competing in the [Amazon Q Build Games Challenge](https://builder.aws.com/content/2y6egGcPAGQs8EwtQUM9KAONojz/build-games-challenge-build-classics-with-amazon-q-developer-cli), I knew exactly what I wanted to bring to life. Not just any game, but that game, the one that brought my father and me closer, and showed me how the simplest ideas can create the most unforgettable experiences.

### Why Jardinains? The Perfect Retro Choice

There's something beautifully pure about Jardinains! - just a ball, paddle, and colorful bricks, yet endlessly captivating. It's the kind of game anyone can learn in seconds but takes forever to master.

For this AI challenge, it was the ideal canvas - complex enough to showcase Q Developer CLI's capabilities, yet simple enough to focus on what really matters: recreating those magical gaming moments that made us fall in love with games in the first place.

### v1.0.0 with Amazon Q

I kicked off this project by installing Amazon Q Developer CLI using brew install --cask amazon-q and following the setup instructions. Once everything was ready, I integrated Amazon Q with my Alacritty terminal. For my first experiment, I simply typed q chat and gave it a straightforward prompt:
"Build a CLI game using pygame like Jardinains."

To my surprise, Amazon Q delivered an impressive first draft!

![v1 of the game](/blog-assets/jardinains-cli-game/v1.png)

The initial version already included most of the features I wanted, and I was genuinely excited by how quickly things came together. Of course, there were a few areas I wanted to tweak and improve. Let’s take a closer look at the code and the enhancements I made.

##### **Mouse/Trackpad Control**

In the first iteration, the game only supported keyboard controls. I wanted to add mouse and trackpad support for a more intuitive experience. I went back to Amazon Q, requested this feature, and it generated the correct implementation right away:

```python
def update(self):
    if self.mouse_control:
        # Mouse/trackpad control
        mouse_x = pygame.mouse.get_pos()[0]
        self.x = mouse_x - self.width // 2
        self.x = max(0, min(self.x, SCREEN_WIDTH - self.width))
    else:
        # Keyboard control
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] and self.x > 0:
            self.x -= self.speed
        if keys[pygame.K_RIGHT] and self.x < SCREEN_WIDTH - self.width:
            self.x += self.speed
```

##### **Bringing Back the Nostalgic Sound**

A huge part of Jardinains’ charm is its classic sound effects—the satisfying clink of breaking bricks and the iconic start and end jingles. To capture that nostalgia, I downloaded the original soundtracks from [this website](https://downloads.khinsider.com/game-soundtracks/album/jardinains-windows-gamerip-2001) and placed them in my project’s assets/sound/ folder.

With Amazon Q’s help, I integrated these sounds using Pygame’s mixer module and a simple SoundManager class. Now, the game plays the authentic sounds at just the right moments:

- Game Start: Plays the classic start jingle.
- Brick Break: Plays the original brick-breaking sound.
- Win or Game Over: Plays the corresponding victory or end tune.

And that’s how we completed the whole project!

---

#### **References**
- Official challenge page [Build Classics with Amazon Q Developer CLI](https://builder.aws.com/content/2y6egGcPAGQs8EwtQUM9KAONojz/build-games-challenge-build-classics-with-amazon-q-developer-cli)
- Source Code [gambhirsharma/jardinains-cli](https://github.com/gambhirsharma/jardinain-cli-game)
