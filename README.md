WebDrum is a side project that aims to simulate parts of a drum set using motion detection through the user's webcam. It's still in a very early stage, but hopefully it will get bigger and better in time!


-------------
Ideas:

- Limit blend mode operations for the designated space, saves time.
- Allow user to choose a space to play on (2)
- Don't play the note before the stick moves away first (3)
- Any way to calculate speed/intensity of the movement? Change sound (2)depending on that? --> Check the amount of white and figure out strength depending on that
- Record played music + share it on FB and Twitter (1)
- Need a list of drum areas so that I can iterate through those (2)
- Draw the drum area (3)
- Record sounds from band room (1)
- Aesthetics
- Push on github

Current delay from hit to sound: 45 ms

Hypothesis: Blending only the drum area will save me time in computation
Test results: 
1st trial: delay from hit to sound: 7 ms
2nd trial: 6 ms

Testing old version again: 
1st trial: 40 ms
2nd trial: 42 ms

Result --> only blending important areas made the response time 6-7x better