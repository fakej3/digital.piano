/* ===================================================
   InstrumentVerse — learning.js
   Structured lessons for all 12 instruments
   =================================================== */

const Learning = (() => {
  const LESSONS = {
    piano: {
      emoji: '🎹', name: 'Piano',
      beginner: [
        {
          id:'piano-b1', title:'Your First Piano Notes', duration:'8 min', xp:50,
          content:`<h3>Welcome to the Piano</h3>
<p>The piano is one of the most versatile instruments ever created. Before you play your first note, let's get familiar with the keyboard layout.</p>
<h3>The White Keys</h3>
<p>The white keys on a piano follow the musical alphabet: <strong>C D E F G A B</strong>. After B, the pattern repeats. Middle C (C4) is the most important landmark on the piano — it sits roughly in the center of the keyboard.</p>
<h3>Finding Middle C</h3>
<p>Look for a group of two black keys. The white key immediately to the left of those two black keys is C. On InstrumentVerse, press the <kbd>A</kbd> key to play C4 (Middle C).</p>
<div class="lesson-tip"><strong>Pro Tip:</strong> Notice how black keys come in groups of 2 and 3. This pattern repeats and is your map to finding any note on the piano.</div>
<h3>Your First Exercise</h3>
<ul>
<li>Press A to play C4 — listen to the tone</li>
<li>Press S to play D4 — notice it's slightly higher</li>
<li>Press D to play E4, F for F4, G for G4, H for A4, J for B4</li>
<li>Press K for C5 — you've just played one complete octave!</li>
</ul>
<h3>What is an Octave?</h3>
<p>An octave is the distance between one C and the next C. Notes separated by an octave sound very similar but at different pitches. This is because the higher C vibrates exactly twice as fast as the lower C.</p>`,
          instrument: 'piano'
        },
        {
          id:'piano-b2', title:'Playing the C Major Scale', duration:'10 min', xp:75,
          content:`<h3>The C Major Scale</h3>
<p>The C major scale is the foundation of Western music. It uses only white keys: C D E F G A B C. This scale gives us the familiar "Do Re Mi Fa Sol La Ti Do" sound.</p>
<h3>Finger Numbering</h3>
<p>Pianists number their fingers 1–5, with 1 being the thumb and 5 being the pinky. For the right hand: thumb=C, index=D, middle=E, ring=F, pinky=G — then the thumb crosses under to play A, index=B, middle=C.</p>
<h3>Practice Exercise</h3>
<ul>
<li>Play C D E F G A B C slowly, one note at a time</li>
<li>Now try it backwards: C B A G F E D C</li>
<li>Try playing it faster each time through</li>
<li>Listen for the smooth, happy quality of this scale</li>
</ul>
<div class="lesson-tip"><strong>Practice Tip:</strong> Slow is smooth, smooth is fast. Always start slow to build muscle memory before speeding up.</div>
<h3>The Pattern</h3>
<p>The C major scale follows this interval pattern: Whole-Whole-Half-Whole-Whole-Whole-Half. A whole step skips one key; a half step moves to the very next key (including black keys).</p>`,
          instrument: 'piano'
        },
        {
          id:'piano-b3', title:'Your First Chord: C Major', duration:'12 min', xp:100,
          content:`<h3>What is a Chord?</h3>
<p>A chord is three or more notes played simultaneously. Chords create harmony — the rich, full sound that makes music emotional and complete.</p>
<h3>The C Major Chord</h3>
<p>The C major chord uses three notes: <strong>C, E, and G</strong>. These three notes are called the root (C), the third (E), and the fifth (G).</p>
<h3>Playing Your First Chord</h3>
<ul>
<li>Place your fingers over C (A key), E (D key), and G (G key)</li>
<li>Press all three simultaneously</li>
<li>Listen to the bright, happy sound — that's C major!</li>
</ul>
<div class="lesson-tip"><strong>Music Theory:</strong> Major chords sound bright and happy. Minor chords (like Am = A, C, E) sound darker and more emotional. The difference is just one note!</div>
<h3>The Three Main Chords</h3>
<p>In the key of C, there are three essential chords used in hundreds of songs:</p>
<ul>
<li><strong>C major:</strong> C - E - G (bright, happy)</li>
<li><strong>F major:</strong> F - A - C (warm, full)</li>
<li><strong>G major:</strong> G - B - D (strong, resolving)</li>
</ul>
<p>Practice moving between these three chords. You'll notice they flow naturally from one to another.</p>`,
          instrument: 'piano'
        }
      ],
      intermediate: [
        {
          id:'piano-i1', title:'Major and Minor Scales', duration:'15 min', xp:125,
          content:`<h3>Major vs Minor</h3>
<p>You've learned the C major scale. Now let's explore what makes a scale "major" or "minor" and how this affects the emotion of music.</p>
<h3>The Natural Minor Scale</h3>
<p>The A natural minor scale uses the same notes as C major (all white keys) but starts on A: <strong>A B C D E F G A</strong>. Notice how it sounds darker and more melancholic compared to C major.</p>
<h3>Scale Formulas</h3>
<ul>
<li><strong>Major:</strong> W W H W W W H (whole-whole-half pattern)</li>
<li><strong>Natural Minor:</strong> W H W W H W W</li>
</ul>
<p>This formula can be applied starting on any note to create major or minor scales in any key.</p>
<div class="lesson-tip"><strong>Composition Insight:</strong> Happy songs often use major keys; sad or dramatic songs often use minor keys. Most pop songs alternate between both for emotional contrast.</div>
<h3>Practice</h3>
<ul>
<li>Play C major scale, then A minor scale back-to-back</li>
<li>Notice the mood change — same notes, different feel</li>
<li>Try playing simple melodies in both scales</li>
</ul>`,
          instrument: 'piano'
        }
      ],
      advanced: [
        {
          id:'piano-a1', title:'Chord Progressions & Harmony', duration:'20 min', xp:200,
          content:`<h3>The Language of Harmony</h3>
<p>Chord progressions are sequences of chords that create the emotional backbone of music. Understanding them unlocks the ability to play and compose countless songs.</p>
<h3>The I-IV-V-I Progression</h3>
<p>In C major: C - F - G - C. This is the most fundamental progression in Western music. It creates tension (G) and release (back to C). Thousands of songs use this exact pattern.</p>
<h3>The I-V-vi-IV Progression</h3>
<p>In C major: C - G - Am - F. This progression appears in an enormous number of pop songs. It combines major and minor chords for emotional depth.</p>
<h3>Advanced Chords</h3>
<ul>
<li><strong>7th chords:</strong> Add a 4th note for richness (Cmaj7 = C E G B)</li>
<li><strong>Suspended chords:</strong> Replace the 3rd with a 2nd or 4th for tension</li>
<li><strong>Diminished chords:</strong> Two minor thirds stacked — creates drama</li>
</ul>
<div class="lesson-tip"><strong>Composer's Secret:</strong> Most hit songs use just 3-4 chords repeating. The melody and rhythm are what make them unique. Simplicity is a strength, not a weakness.</div>`,
          instrument: 'piano'
        }
      ]
    },

    guitar: {
      emoji: '🎸', name: 'Guitar',
      beginner: [
        {
          id:'guitar-b1', title:'Understanding the Guitar', duration:'8 min', xp:50,
          content:`<h3>The Guitar's Anatomy</h3>
<p>A standard guitar has 6 strings, tuned (from lowest to highest): <strong>E A D G B E</strong>. Many use the mnemonic "Eat All Day, Get Big Easily" to remember this.</p>
<h3>How Chords Work</h3>
<p>On guitar, chords are formed by pressing specific frets on specific strings. In InstrumentVerse's chord mode, you can play full chords by clicking the chord buttons and strumming the neck.</p>
<h3>Your First Chord: Em</h3>
<p>Em (E minor) is the easiest guitar chord. Select "Em" in the chord palette and strum all 6 strings — all strings ring open or with just 2 fingers on a real guitar.</p>
<div class="lesson-tip"><strong>Guitar Basics:</strong> Frets are the metal strips on the neck. The higher the fret number, the higher the pitch. Open strings (fret 0) ring freely.</div>
<h3>Practice</h3>
<ul>
<li>Play Em, then Am — notice the shift in emotion</li>
<li>Try the three-chord magic: G, C, D</li>
<li>Experiment with strum direction (up vs down)</li>
</ul>`,
          instrument: 'guitar'
        },
        {
          id:'guitar-b2', title:'Essential Open Chords', duration:'15 min', xp:100,
          content:`<h3>The Core 5 Open Chords</h3>
<p>Learning G, C, D, Em, and Am unlocks thousands of songs. These are called "open" chords because they use open strings (strings played without pressing a fret).</p>
<h3>Chord Transitions</h3>
<p>The hardest part of guitar for beginners is switching between chords smoothly. The key is to:</p>
<ul>
<li>Practice the transition very slowly at first</li>
<li>Visualize the next chord shape before you move</li>
<li>Move all fingers simultaneously, not one at a time</li>
<li>Keep your fretting hand relaxed — tension is the enemy</li>
</ul>
<div class="lesson-tip"><strong>Song Hack:</strong> G - D - Em - C is the most common 4-chord progression in pop music. Countless hit songs use exactly these four chords.</div>
<h3>Strumming Patterns</h3>
<ul>
<li><strong>Basic:</strong> Down Down Down Down (one per beat)</li>
<li><strong>Rock:</strong> Down Down Up Up Down Up</li>
<li><strong>Ballad:</strong> Down...Up Down...Up</li>
</ul>`,
          instrument: 'guitar'
        }
      ],
      intermediate: [
        {
          id:'guitar-i1', title:'Barre Chords', duration:'18 min', xp:150,
          content:`<h3>What are Barre Chords?</h3>
<p>Barre chords are movable chord shapes where your index finger presses all 6 strings at once (like a capo). They let you play any chord in any key using the same shape.</p>
<h3>The F Major Barre Chord</h3>
<p>The most common (and most feared) barre chord for beginners. In InstrumentVerse, the F chord shape [1,1,2,3,3,1] shows the barre on the first fret.</p>
<div class="lesson-tip"><strong>The Big Secret:</strong> Once you master the E-shape barre chord on fret 1 (F major), moving it to fret 3 gives you G major, fret 5 gives A major. The same shape in different positions!</div>`,
          instrument: 'guitar'
        }
      ],
      advanced: [
        {
          id:'guitar-a1', title:'Lead Guitar & Scales', duration:'25 min', xp:200,
          content:`<h3>The Pentatonic Scale</h3>
<p>The pentatonic scale (5 notes) is the foundation of rock, blues, and country lead guitar. In A minor pentatonic: A C D E G. It's forgiving — almost any note sounds good over almost any chord in the key.</p>
<h3>The Blues Scale</h3>
<p>Add one "blue note" (a flat 5th, or "tritone") to the pentatonic to get the blues scale. This gives that characteristic bluesy, gritty sound heard in everything from BB King to Jimi Hendrix.</p>
<div class="lesson-tip"><strong>Improvisation:</strong> Start with just 3-4 notes from the pentatonic scale. Play them in different orders, different rhythms. Simplicity is the heart of great solos.</div>`,
          instrument: 'guitar'
        }
      ]
    },

    drums: {
      emoji: '🥁', name: 'Drums',
      beginner: [
        {
          id:'drums-b1', title:'The Basic Beat', duration:'10 min', xp:75,
          content:`<h3>The Drum Kit</h3>
<p>A standard drum kit has: kick drum, snare drum, hi-hat (closed and open), crash cymbal, ride cymbal, and toms. Each has a specific role in creating rhythm.</p>
<h3>The Basic Rock Beat</h3>
<p>The most fundamental beat in modern music:</p>
<ul>
<li><strong>Beat 1:</strong> Kick drum (J key)</li>
<li><strong>Beat 2:</strong> Snare drum (D key)</li>
<li><strong>Beat 3:</strong> Kick drum again</li>
<li><strong>Beat 4:</strong> Snare drum again</li>
<li><strong>Continuous:</strong> Hi-hat on every beat (W key)</li>
</ul>
<div class="lesson-tip"><strong>Timing is Everything:</strong> Drummers are the "timekeepers" of a band. A great drummer with mediocre technique is more valuable than a technically skilled drummer with poor timing.</div>
<h3>Practice</h3>
<ul>
<li>Start with just kick (J) and snare (D) alternating</li>
<li>Add hi-hat (W) on every beat</li>
<li>Use the Beat Maker to program patterns and hear them loop</li>
</ul>`,
          instrument: 'drums'
        }
      ],
      intermediate: [
        {
          id:'drums-i1', title:'Syncopation & Grooves', duration:'15 min', xp:125,
          content:`<h3>What is Syncopation?</h3>
<p>Syncopation means placing accents on the "off-beats" — between the main beats. This creates groove, swing, and the infectious feel that makes people want to dance.</p>
<h3>The Hi-Hat Shuffle</h3>
<p>Instead of playing hi-hat on every beat, try: Down, Down-Up, Down, Down-Up. The "Up" strokes are on the off-beat and create a shuffle feel used in blues and R&B.</p>
<div class="lesson-tip"><strong>Groove vs Speed:</strong> The best drummers in the world aren't necessarily the fastest — they're the ones with the best groove and feel. Neil Peart, John Bonham, and Questlove are masters of groove.</div>`,
          instrument: 'drums'
        }
      ],
      advanced: [
        {
          id:'drums-a1', title:'Polyrhythm & Advanced Patterns', duration:'20 min', xp:200,
          content:`<h3>Polyrhythm</h3>
<p>Polyrhythm means playing two different rhythmic patterns simultaneously. For example, playing 3 beats in the time of 4 beats (called "3 against 4") creates a hypnotic, complex feel.</p>
<h3>Independence</h3>
<p>Advanced drumming requires each limb to act independently. This means your hands and feet can all play different patterns at the same time.</p>
<div class="lesson-tip"><strong>Jazz Drumming:</strong> In jazz, the ride cymbal carries the main pulse while the snare is used for "comping" — spontaneously accenting and reacting to other musicians. This requires deep listening skills.</div>`,
          instrument: 'drums'
        }
      ]
    },

    synth: {
      emoji: '🎛️', name: 'Synthesizer',
      beginner: [
        {
          id:'synth-b1', title:'How Synthesizers Work', duration:'12 min', xp:75,
          content:`<h3>Sound Synthesis Fundamentals</h3>
<p>A synthesizer generates sound electronically, unlike acoustic instruments. The basic building block is an <strong>oscillator</strong> — a circuit (or algorithm) that generates a repeating waveform.</p>
<h3>The Four Basic Waveforms</h3>
<ul>
<li><strong>Sine:</strong> Pure, smooth tone. Flute-like. No harmonics.</li>
<li><strong>Triangle:</strong> Slightly hollow, warm. Odd harmonics only, quieter.</li>
<li><strong>Sawtooth:</strong> Bright, buzzy, harsh. All harmonics. Great for lead sounds.</li>
<li><strong>Square:</strong> Hollow, reedy. Odd harmonics only. Great for bass and pads.</li>
</ul>
<h3>The Filter</h3>
<p>A filter shapes the tone by removing frequencies. A <strong>lowpass filter</strong> (most common) removes high frequencies. As you lower the cutoff frequency, the sound becomes darker and warmer.</p>
<div class="lesson-tip"><strong>Classic Sounds:</strong> A sawtooth through a lowpass filter with high resonance = classic analog synth. Try it on InstrumentVerse: select Sawtooth, set filter to Lowpass, lower the cutoff to about 800Hz, and raise the resonance.</div>`,
          instrument: 'synth'
        }
      ],
      intermediate: [
        {
          id:'synth-i1', title:'ADSR Envelopes', duration:'15 min', xp:125,
          content:`<h3>What is ADSR?</h3>
<p>ADSR stands for Attack, Decay, Sustain, Release — the four stages of how a sound changes over time after a key is pressed.</p>
<ul>
<li><strong>Attack:</strong> How long it takes for the sound to reach full volume after you press a key. (Fast = sharp; Slow = swells in gradually)</li>
<li><strong>Decay:</strong> How long it takes to fall from peak volume to the sustain level.</li>
<li><strong>Sustain:</strong> The volume level held while the key is pressed.</li>
<li><strong>Release:</strong> How long the sound fades after you release the key.</li>
</ul>
<div class="lesson-tip"><strong>Sound Design:</strong> Piano: fast attack, fast decay, 0% sustain, medium release. Organ: fast attack, no decay, 100% sustain, fast release. Strings: slow attack, slow decay, high sustain, slow release.</div>`,
          instrument: 'synth'
        }
      ],
      advanced: [
        {
          id:'synth-a1', title:'LFO Modulation', duration:'18 min', xp:175,
          content:`<h3>The LFO (Low Frequency Oscillator)</h3>
<p>An LFO is an oscillator running at a very slow rate (below 20Hz, often 0.1–10Hz). Rather than producing audio, it modulates other parameters — creating movement and animation in the sound.</p>
<h3>Common LFO Applications</h3>
<ul>
<li><strong>LFO on pitch:</strong> Creates vibrato (wavering pitch) — like a vocalist naturally does</li>
<li><strong>LFO on filter cutoff:</strong> Creates an automatic filter sweep — that "wah wah" effect</li>
<li><strong>LFO on volume:</strong> Creates tremolo — think of classic guitar amp tremolo</li>
</ul>
<div class="lesson-tip"><strong>Dubstep Secret:</strong> The characteristic "wobble bass" sound is simply a square or sawtooth wave with an LFO modulating the filter cutoff at a rhythmically-synced rate. Start with LFO rate = 2Hz, filter cutoff = 400Hz, high resonance.</div>`,
          instrument: 'synth'
        }
      ]
    },

    violin: {
      emoji: '🎻', name: 'Violin',
      beginner: [
        {
          id:'violin-b1', title:'The Violin\'s Voice', duration:'8 min', xp:50,
          content:`<h3>About the Violin</h3>
<p>The violin is the highest-pitched instrument in the string family. Its four strings (G D A E) are played with a bow in real life, creating that distinctive sustained, singing tone.</p>
<h3>Playing in InstrumentVerse</h3>
<p>Click or hold the keys on each string to play notes. Longer holds simulate the bowing technique — the longer you hold, the more the note develops with vibrato.</p>
<h3>The Four Strings</h3>
<ul>
<li><strong>G string:</strong> Rich, dark, powerful (lowest)</li>
<li><strong>D string:</strong> Warm, singing quality</li>
<li><strong>A string:</strong> Bright, clear, expressive</li>
<li><strong>E string:</strong> Brilliant, penetrating (highest)</li>
</ul>
<div class="lesson-tip"><strong>Vibrato:</strong> Professional violinists use vibrato — a slight oscillation of pitch — to add warmth and expression. InstrumentVerse simulates this automatically.</div>`,
          instrument: 'violin'
        }
      ],
      intermediate: [
        {
          id:'violin-i1', title:'Scales and Positions', duration:'15 min', xp:125,
          content:`<h3>First Position</h3>
<p>In real violin playing, "first position" means your hand is positioned near the nut (top of the neck), accessing the first few frets. This is where beginners start.</p>
<h3>The D Major Scale on Violin</h3>
<p>D major is one of the first scales learned on violin because it lies comfortably under the fingers in first position: D E F# G A B C# D.</p>
<div class="lesson-tip"><strong>Bowing Technique:</strong> On a real violin, the bow direction (down-bow vs up-bow) affects the dynamics and articulation. Down-bow tends to be stronger, up-bow more delicate.</div>`,
          instrument: 'violin'
        }
      ],
      advanced: [
        {
          id:'violin-a1', title:'Expressive Playing', duration:'20 min', xp:200,
          content:`<h3>Dynamics and Expression</h3>
<p>Great violin playing is about more than hitting the right notes. It's about shaping phrases, varying dynamics (loud and soft), and adding subtle expressiveness.</p>
<h3>Key Expression Techniques</h3>
<ul>
<li><strong>Vibrato:</strong> Oscillating pitch for warmth</li>
<li><strong>Sul ponticello:</strong> Bow near the bridge for a glassy, eerie tone</li>
<li><strong>Pizzicato:</strong> Plucking the strings instead of bowing</li>
<li><strong>Harmonics:</strong> Lightly touching the string at exact points creates flute-like overtones</li>
</ul>
<div class="lesson-tip"><strong>The Singing Tone:</strong> The best violinists make their instrument "sing." Think of your favorite melody — how would a singer breathe, emphasize certain words, slow down for dramatic effect? Apply those same instincts to your playing.</div>`,
          instrument: 'violin'
        }
      ]
    },

    flute: {
      emoji: '🎶', name: 'Flute',
      beginner: [
        {
          id:'flute-b1', title:'The Breath of Music', duration:'8 min', xp:50,
          content:`<h3>The Flute's Pure Voice</h3>
<p>The flute produces sound through air vibrating across an opening. This creates one of the purest, most ethereal tones in all of music — it's essentially amplified air.</p>
<h3>Playing in InstrumentVerse</h3>
<p>Hold keys to sustain notes. The flute benefits from longer notes and smooth transitions between pitches.</p>
<h3>Flute Characteristics</h3>
<ul>
<li>Pure, airy tone with subtle breath noise</li>
<li>Automatic vibrato for expressiveness</li>
<li>Best suited for melodic playing and sustained notes</li>
<li>Range: C4 to C6 in InstrumentVerse</li>
</ul>
<div class="lesson-tip"><strong>Famous Flutists:</strong> James Galway ("The Man with the Golden Flute"), Ian Anderson (Jethro Tull), Herbie Mann (jazz flute pioneer). The flute spans classical, jazz, folk, and world music.</div>`,
          instrument: 'flute'
        }
      ],
      intermediate: [
        {
          id:'flute-i1', title:'Melodic Phrases', duration:'12 min', xp:100,
          content:`<h3>Phrasing on the Flute</h3>
<p>A musical phrase is like a sentence — it has a beginning, middle, and end. Good flute playing connects notes into flowing phrases rather than playing them as disconnected events.</p>
<h3>Smooth Connections (Legato)</h3>
<p>To play legato on the flute, you transition smoothly from note to note without breaks. In InstrumentVerse, try sliding from one key to the next while holding the previous key down briefly.</p>
<div class="lesson-tip"><strong>Breathing:</strong> Real flutists plan their breathing carefully — you can only breathe at phrase ends (like punctuation in a sentence). This shapes the music's structure.</div>`,
          instrument: 'flute'
        }
      ],
      advanced: [
        {
          id:'flute-a1', title:'Ornaments and Techniques', duration:'18 min', xp:175,
          content:`<h3>Advanced Flute Techniques</h3>
<ul>
<li><strong>Trill:</strong> Rapidly alternating between two adjacent notes</li>
<li><strong>Flutter tongue:</strong> Rolling the tongue while playing for a buzzing effect</li>
<li><strong>Multiphonics:</strong> Playing two notes simultaneously on flute</li>
<li><strong>Extended range:</strong> Playing above the normal range using harmonics</li>
</ul>
<div class="lesson-tip"><strong>World Music:</strong> The flute appears in virtually every musical culture worldwide — Native American flute, Japanese shakuhachi, Irish tin whistle, Indian bansuri. Each uses different scales and techniques.</div>`,
          instrument: 'flute'
        }
      ]
    },

    beatmaker: {
      emoji: '🎚️', name: 'Beat Maker',
      beginner: [
        {
          id:'bm-b1', title:'Your First Beat', duration:'10 min', xp:75,
          content:`<h3>The Step Sequencer</h3>
<p>A step sequencer divides time into equal steps (here, 16 steps = one bar of music). You activate specific steps for each instrument to create a repeating pattern.</p>
<h3>The Basic House Beat</h3>
<ul>
<li><strong>Kick drum:</strong> Steps 1, 5, 9, 13 (every 4th step = "four on the floor")</li>
<li><strong>Snare:</strong> Steps 5 and 13 (beats 2 and 4)</li>
<li><strong>Hi-Hat:</strong> Steps 3, 7, 11, 15 (off-beats)</li>
</ul>
<p>Try the preset patterns to hear classic grooves, then customize them!</p>
<div class="lesson-tip"><strong>BPM:</strong> "Beats per minute" controls the tempo. Hip-hop: 80-100 BPM. House music: 125-130 BPM. Drum & bass: 160-180 BPM. Start at 90 BPM to learn.</div>`,
          instrument: 'beatmaker'
        }
      ],
      intermediate: [
        {
          id:'bm-i1', title:'Groove and Feel', duration:'15 min', xp:125,
          content:`<h3>What Makes a Good Beat?</h3>
<p>A great beat isn't just about which steps are active — it's about the interaction between different elements and the overall feel or "groove."</p>
<h3>Kick-Snare Interaction</h3>
<p>The relationship between kick and snare defines the beat's character. Traditional: kick on 1&3, snare on 2&4. Switching these creates immediate stylistic change.</p>
<div class="lesson-tip"><strong>Less is More:</strong> Beginners often fill every step. Professional producers leave space — silence is a musical element. Try a beat where you use fewer steps than you think you need.</div>`,
          instrument: 'beatmaker'
        }
      ],
      advanced: [
        {
          id:'bm-a1', title:'Complex Polyrhythms', duration:'20 min', xp:200,
          content:`<h3>Polyrhythm in Beat Making</h3>
<p>Polyrhythm means two different rhythmic patterns happening simultaneously. In a step sequencer, you can create this by giving different instruments patterns of different lengths within the same 16-step grid.</p>
<h3>Example: 3 Against 4</h3>
<p>Set the kick to hit every 4 steps (steps 1, 5, 9, 13). Set the hi-hat to hit every 3 steps (steps 1, 4, 7, 10, 13, 16). These two patterns cycle against each other creating hypnotic complexity.</p>
<div class="lesson-tip"><strong>Afrobeat:</strong> Complex, polyrhythmic beats were central to Fela Kuti's Afrobeat — multiple instruments playing interlocking patterns that together create one unified groove. This principle underlies much of West African music.</div>`,
          instrument: 'beatmaker'
        }
      ]
    },

    ukulele: {
      emoji: '🪕', name: 'Ukulele',
      beginner: [
        {
          id:'uke-b1', title:'Aloha, Ukulele!', duration:'8 min', xp:50,
          content:`<h3>The Happy Little Instrument</h3>
<p>The ukulele originated in Hawaii and has a warm, cheerful tone perfect for folk, pop, and island music. With just 4 strings and simple chord shapes, it's one of the easiest instruments to start playing songs on.</p>
<h3>Standard Tuning: G-C-E-A</h3>
<p>Unlike guitar where strings go low to high, the ukulele's G string is actually higher than the C string — this is called "re-entrant tuning" and gives the uke its bright, distinctive sound.</p>
<h3>Your First Three Chords</h3>
<ul>
<li><strong>C major:</strong> The easiest chord on uke — just press the 3rd fret of the A string</li>
<li><strong>Am:</strong> Press the 2nd fret of the G string</li>
<li><strong>F:</strong> Press 2nd fret G, 1st fret E</li>
</ul>
<div class="lesson-tip"><strong>Quick Song:</strong> C - Am - F - G gives you the basic structure of hundreds of pop songs on ukulele.</div>`,
          instrument: 'ukulele'
        }
      ],
      intermediate: [
        {
          id:'uke-i1', title:'Strumming Patterns', duration:'12 min', xp:100,
          content:`<h3>The Island Strum</h3>
<p>The most common ukulele strum: D DU UDU (D=down, U=up). Count it: "1 - and-2 - and-3-and" to get the rhythm. This pattern appears in dozens of classic ukulele songs.</p>
<div class="lesson-tip"><strong>Feel the Music:</strong> Strumming patterns aren't just mechanical — they convey emotion. Slow, deliberate strums feel intimate; fast light strums feel playful and energetic.</div>`,
          instrument: 'ukulele'
        }
      ],
      advanced: [
        {
          id:'uke-a1', title:'Fingerpicking & Arrangements', duration:'18 min', xp:175,
          content:`<h3>Fingerpicking on Ukulele</h3>
<p>Instead of strumming all strings with a pick or finger, fingerpicking assigns each finger to a specific string, allowing you to play melody and accompaniment simultaneously.</p>
<p>Classic fingerpicking pattern: Thumb plays G string, index plays C, middle plays E, ring plays A. Practice each finger alone before combining them.</p>
<div class="lesson-tip"><strong>Jake Shimabukuro:</strong> Often called "the Jimi Hendrix of the ukulele," Jake demonstrates what's possible when you push the instrument to its limits. Search for his "While My Guitar Gently Weeps" cover for inspiration.</div>`,
          instrument: 'ukulele'
        }
      ]
    },

    bass: {
      emoji: '🎸', name: 'Bass Guitar',
      beginner: [
        {
          id:'bass-b1', title:'The Foundation of Music', duration:'10 min', xp:75,
          content:`<h3>Why Bass Matters</h3>
<p>Bass guitar provides the rhythmic and harmonic foundation of virtually all modern music. Without bass, music lacks weight and groove. The bass connects the rhythm section (drums) to the harmonic instruments (guitar, keys).</p>
<h3>Standard Tuning: E-A-D-G</h3>
<p>Bass is tuned one octave lower than the bottom 4 strings of a guitar. The thick strings vibrate slowly, creating those deep, powerful low frequencies you feel as much as hear.</p>
<h3>Root Note Playing</h3>
<p>The simplest bass approach: play the root note of each chord when it changes. If the guitarist plays C major, you play C. Simple but effective and the foundation of all bass playing.</p>
<div class="lesson-tip"><strong>Less is More:</strong> Great bassists like James Jamerson, Jaco Pastorius, and Paul McCartney are celebrated not just for their technique, but for their melodic sense and restraint. Every note should serve the song.</div>`,
          instrument: 'bass'
        }
      ],
      intermediate: [
        {
          id:'bass-i1', title:'Walking Bass Lines', duration:'15 min', xp:125,
          content:`<h3>The Walking Bass</h3>
<p>A walking bass line moves stepwise or in scale patterns through chord changes, creating smooth connections between chord tones. This technique is central to jazz and blues.</p>
<p>Basic approach: On each beat, play the root note of the chord, then walk up or down to the root of the next chord using scale tones and chromatic passing tones.</p>
<div class="lesson-tip"><strong>Motown Bass:</strong> James Jamerson's bass lines on Marvin Gaye, Stevie Wonder, and The Supremes recordings are masterclasses in melodic bass playing within a pop context. They're more like additional melodies than mere accompaniment.</div>`,
          instrument: 'bass'
        }
      ],
      advanced: [
        {
          id:'bass-a1', title:'Slap & Pop Technique', duration:'20 min', xp:200,
          content:`<h3>Slap Bass</h3>
<p>Slap bass uses the thumb to "slap" the string against the fretboard (creating a percussive thud on low strings) combined with "popping" — pulling the string away from the fretboard with a finger (creating a bright, snapping tone on high strings).</p>
<p>This technique, popularized by Larry Graham and perfected by Flea, Marcus Miller, and Victor Wooten, creates a funky, percussive sound that's immediately recognizable.</p>
<div class="lesson-tip"><strong>Groove First:</strong> The most important thing in slap bass isn't speed — it's the groove and rhythmic feel. Practice the pattern slowly until the timing is impeccable before gradually increasing speed.</div>`,
          instrument: 'bass'
        }
      ]
    },

    xylophone: {
      emoji: '🎵', name: 'Xylophone',
      beginner: [
        {
          id:'xyl-b1', title:'Mallet Magic', duration:'8 min', xp:50,
          content:`<h3>The Xylophone</h3>
<p>The xylophone is a percussion instrument consisting of wooden bars of different lengths. Each bar produces a specific pitch when struck with a mallet. The name comes from Greek: xylon (wood) + phone (sound).</p>
<h3>Playing Technique</h3>
<p>Click or tap the bars to play. The bars are arranged like piano keys — lower notes on the left, higher notes on the right.</p>
<h3>Basic Scales</h3>
<p>Practice playing the C major scale from left to right (C D E F G A B C). Notice how each bar gets slightly smaller and higher in pitch as you move right.</p>
<div class="lesson-tip"><strong>Orff Method:</strong> The xylophone is central to the Orff Schulwerk approach to music education. It's often one of the first instruments children learn because it's intuitive and forgiving.</div>`,
          instrument: 'xylophone'
        }
      ],
      intermediate: [
        {
          id:'xyl-i1', title:'Two-Mallet Technique', duration:'12 min', xp:100,
          content:`<h3>Playing with Two Hands</h3>
<p>Professional xylophonists use 2 or 4 mallets simultaneously. With two mallets, you can play melodies in one hand while accompanying with the other.</p>
<p>Practice: Play C5 with the right hand while playing C4 (an octave lower) with the left. Move them together through the scale — you're playing in octaves!</p>
<div class="lesson-tip"><strong>Marimba vs Xylophone:</strong> The marimba looks similar but has tube resonators underneath each bar that amplify the sound, giving it a warmer, more sustained tone. The xylophone has a shorter, drier sound.</div>`,
          instrument: 'xylophone'
        }
      ],
      advanced: [
        {
          id:'xyl-a1', title:'Speed and Articulation', duration:'18 min', xp:175,
          content:`<h3>Rapid Note Patterns</h3>
<p>The xylophone excels at fast, articulated passages that would be impossible on many other instruments. Scale runs, arpeggios, and scalar patterns can be played at extraordinary speeds.</p>
<h3>Double Lateral Stroke</h3>
<p>To play fast scales, alternating hands go: R L R L in a smooth, continuous motion. The key is keeping both mallets at equal height and using wrist (not arm) strokes for speed.</p>
<div class="lesson-tip"><strong>Saint-Saëns "Fossils":</strong> In Carnival of the Animals, Saint-Saëns uses the xylophone to imitate the rattling of fossils. Listen to this piece — it perfectly showcases the instrument's dry, percussive character.</div>`,
          instrument: 'xylophone'
        }
      ]
    },

    marimba: {
      emoji: '🎵', name: 'Marimba',
      beginner: [
        {
          id:'mar-b1', title:'The Warm Voice of Percussion', duration:'8 min', xp:50,
          content:`<h3>The Marimba</h3>
<p>The marimba is a concert percussion instrument with wooden bars and metal tube resonators. It has a warm, rich tone quite different from the sharper sound of the xylophone.</p>
<h3>Range and Character</h3>
<p>The marimba has a wide range (C2 to C7 on concert instruments). The lower register is deep and resonant; the upper register is bright and clear. InstrumentVerse shows the middle-low range (C3 to C5).</p>
<h3>Soft Touch</h3>
<p>Unlike the xylophone, marimba bars respond well to a soft touch — you don't need to strike hard to get a full sound. Press gently for the best tone.</p>
<div class="lesson-tip"><strong>Afro-Cuban Origins:</strong> The marimba has African roots and was brought to Latin America, where it became the national instrument of Guatemala. Listen to traditional Guatemalan marimba music for its authentic character.</div>`,
          instrument: 'marimba'
        }
      ],
      intermediate: [
        {
          id:'mar-i1', title:'Four-Mallet Technique', duration:'15 min', xp:125,
          content:`<h3>Playing Four Mallets</h3>
<p>Concert marimbists typically hold two mallets in each hand, allowing them to play chords and complex harmonies. The most common grip is the "Burton grip" — a cross-stick technique developed by vibraphonist Gary Burton.</p>
<h3>Chord Playing</h3>
<p>With four mallets, you can play 4-note chords spanning large intervals. In InstrumentVerse, try clicking multiple bars simultaneously to hear chord sounds on the marimba.</p>
<div class="lesson-tip"><strong>Keiko Abe:</strong> Often called the "First Lady of the Marimba," Keiko Abe has composed and arranged much of the concert marimba repertoire. Her work elevated the marimba to a solo concert instrument.</div>`,
          instrument: 'marimba'
        }
      ],
      advanced: [
        {
          id:'mar-a1', title:'Extended Techniques', duration:'20 min', xp:200,
          content:`<h3>Contemporary Marimba</h3>
<p>Modern marimbists have developed extended techniques that push the instrument far beyond its traditional role:</p>
<ul>
<li><strong>Dead strokes:</strong> Leaving the mallet on the bar after striking to dampen the resonance</li>
<li><strong>Pitch bending:</strong> Pressing hard on the edge of a bar to slightly lower its pitch</li>
<li><strong>Multiphonics:</strong> Creating two simultaneous pitches</li>
<li><strong>Prepared marimba:</strong> Objects placed on the bars to alter tone</li>
</ul>
<div class="lesson-tip"><strong>Steve Reich:</strong> The composer Steve Reich wrote "Marimba Phase" — a piece where the same pattern plays on two marimbas that gradually go out of phase with each other. This minimalist technique is hypnotic and influential.</div>`,
          instrument: 'marimba'
        }
      ]
    },

    organ: {
      emoji: '🎹', name: 'Organ',
      beginner: [
        {
          id:'organ-b1', title:'The King of Instruments', duration:'10 min', xp:75,
          content:`<h3>The Organ</h3>
<p>The pipe organ has been called "the king of instruments" — it can produce enormous volumes, incredible dynamics, and has the widest range of any instrument. The Hammond organ brought this power to jazz, rock, and gospel.</p>
<h3>Drawbars</h3>
<p>The Hammond organ is controlled by drawbars — sliders that control the volume of different harmonics. Pull a drawbar out to add that harmonic to the sound. The combination creates the organ's characteristic tone.</p>
<h3>Drawbar Positions (8' = fundamental)</h3>
<ul>
<li><strong>Drawbar fully out (8):</strong> Maximum volume for that harmonic</li>
<li><strong>Fully in (0):</strong> Silent</li>
<li><strong>Presets:</strong> Try "Gospel," "Jazz," and "Full" to hear the difference</li>
</ul>
<div class="lesson-tip"><strong>Jimmy Smith:</strong> Widely considered the greatest Hammond organist, Jimmy Smith single-handedly established the Hammond B-3 as a jazz instrument in the 1950s. His technique was groundbreaking and still influences organists today.</div>`,
          instrument: 'organ'
        }
      ],
      intermediate: [
        {
          id:'organ-i1', title:'Gospel and Rock Organ', duration:'15 min', xp:125,
          content:`<h3>Playing Styles</h3>
<p>The organ appears in wildly different musical styles, each with distinctive playing approaches:</p>
<ul>
<li><strong>Gospel:</strong> Rich full chords, powerful runs in the right hand, heavy bass pedal</li>
<li><strong>Jazz:</strong> Sparse, swinging, lots of space, often single-note lines</li>
<li><strong>Rock:</strong> Sustained chords, "bark" articulations, Leslie speaker wobble</li>
<li><strong>Classical:</strong> Full registration, complex counterpoint, Bach-style</li>
</ul>
<div class="lesson-tip"><strong>The Leslie Effect:</strong> The characteristic "wobble" of the Hammond organ comes from a Leslie speaker cabinet that physically rotates, creating Doppler effect pitch variation. Our "Leslie" control simulates this.</div>`,
          instrument: 'organ'
        }
      ],
      advanced: [
        {
          id:'organ-a1', title:'Registration and Improvisation', duration:'20 min', xp:200,
          content:`<h3>Advanced Registration</h3>
<p>Choosing drawbar settings ("registration") is an art form. Different registrations suit different musical contexts:</p>
<ul>
<li>All drawbars out: Full, powerful, overwhelming — for climaxes</li>
<li>Just 8' and 4': Clean, clear, classical</li>
<li>Lots of upper harmonics: Bright, cutting through a band mix</li>
<li>Sub + 8': Huge, dark, powerful bass sound</li>
</ul>
<div class="lesson-tip"><strong>Keith Emerson:</strong> ELP's Keith Emerson combined classical piano technique with rock organ power. His technique of stabbing knives into the organ's keys to sustain them while rearranging the instrument on stage remains legendary.</div>`,
          instrument: 'organ'
        }
      ]
    }
  };

  let initialized = false;

  function levelTag(level) {
    const map = { beginner:'tag-beginner', intermediate:'tag-intermediate', advanced:'tag-advanced' };
    return `<span class="lesson-card-tag ${map[level] || ''}">${level}</span>`;
  }

  function buildLearnPage() {
    const wrap = document.getElementById('learnWrap');
    if (!wrap) return;
    wrap.innerHTML = '';

    Object.entries(LESSONS).forEach(([instrKey, instr]) => {
      const section = document.createElement('div');
      section.className = 'learn-instrument-section';

      const header = document.createElement('div');
      header.className = 'learn-inst-header';
      header.innerHTML = `<span class="emoji">${instr.emoji}</span><h3>${instr.name}</h3>`;
      section.appendChild(header);

      const levels = document.createElement('div');
      levels.className = 'learn-levels';

      ['beginner','intermediate','advanced'].forEach(level => {
        if (!instr[level]) return;
        instr[level].forEach(lesson => {
          const card = document.createElement('div');
          card.className = 'learn-card' + (Storage.isLessonCompleted(lesson.id) ? ' completed' : '');
          const levelColors = { beginner:'var(--accent)', intermediate:'var(--warning)', advanced:'var(--danger)' };
          card.innerHTML = `
            <div class="learn-card-header">
              <span class="learn-card-level" style="background:${levelColors[level]}20;color:${levelColors[level]}">${level}</span>
              <span class="learn-card-icon">${Storage.isLessonCompleted(lesson.id) ? '✓' : '○'}</span>
            </div>
            <div class="learn-card-title">${lesson.title}</div>
            <div class="learn-card-meta">
              <span>⏱ ${lesson.duration}</span>
              <span class="learn-card-xp">+${lesson.xp} XP</span>
            </div>
          `;
          card.addEventListener('click', () => openLesson(lesson, level));
          levels.appendChild(card);
        });
      });

      section.appendChild(levels);
      wrap.appendChild(section);
    });
  }

  function openLesson(lesson, level) {
    const levelColors = { beginner:'var(--accent)', intermediate:'var(--warning)', advanced:'var(--danger)' };
    const completed = Storage.isLessonCompleted(lesson.id);

    const wrap = document.getElementById('lessonWrap');
    if (!wrap) return;

    wrap.innerHTML = `
      <div class="lesson-back">
        <button class="btn btn-ghost btn-sm" id="lessonBackBtn">← Back to Lessons</button>
      </div>
      <div class="lesson-tag" style="background:${levelColors[level]}20;color:${levelColors[level]}">${level}</div>
      <h1 class="lesson-title">${lesson.title}</h1>
      <div class="lesson-meta">
        <span>⏱ ${lesson.duration}</span>
        <span>🎵 ${LESSONS[lesson.instrument]?.name || lesson.instrument}</span>
        <span class="learn-card-xp">+${lesson.xp} XP</span>
        ${completed ? '<span style="color:var(--accent)">✓ Completed</span>' : ''}
      </div>
      <div class="lesson-content">${lesson.content}</div>
      <div class="lesson-actions">
        ${!completed ? `<button class="btn btn-primary btn-lg" id="lessonCompleteBtn">Mark Complete (+${lesson.xp} XP)</button>` : '<span style="color:var(--accent);font-weight:700">✓ Lesson Completed!</span>'}
        <button class="btn btn-surface" id="lessonPlayBtn">Open ${LESSONS[lesson.instrument]?.name || 'Instrument'}</button>
      </div>
    `;

    document.getElementById('lessonBackBtn').addEventListener('click', () => Router.navigate('learn'));

    const completeBtn = document.getElementById('lessonCompleteBtn');
    if (completeBtn) {
      completeBtn.addEventListener('click', () => {
        const result = Storage.completeLesson(lesson.id, lesson.xp);
        if (result) {
          UI.floatXP(lesson.xp);
          UI.updateXPDisplay();
          if (result.leveledUp) UI.showLevelUp(result.level);
          UI.toast('+' + lesson.xp + ' XP earned!');
          completeBtn.textContent = '✓ Completed!';
          completeBtn.disabled = true;
          Storage.unlockAchievement('first_lesson') && UI.showAchievement('First Lesson!', '📚');
          if (typeof App !== 'undefined' && App.checkProgressAchievements) App.checkProgressAchievements();
        }
      });
    }

    const playBtn = document.getElementById('lessonPlayBtn');
    if (playBtn && lesson.instrument) {
      playBtn.addEventListener('click', () => Router.navigate(lesson.instrument));
    }

    Router.navigate('lesson');
  }

  function buildFeaturedLessons() {
    const wrap = document.getElementById('featuredLessons');
    if (!wrap) return;
    wrap.innerHTML = ''; // clear to avoid duplicate cards on revisit

    const featured = [
      { ...LESSONS.piano.beginner[0], level:'beginner' },
      { ...LESSONS.guitar.beginner[0], level:'beginner' },
      { ...LESSONS.drums.beginner[0], level:'beginner' },
      { ...LESSONS.synth.beginner[0], level:'beginner' },
      { ...LESSONS.violin.beginner[0], level:'beginner' },
    ];

    featured.forEach(lesson => {
      const card = document.createElement('div');
      card.className = 'lesson-card';
      const levelColors = { beginner:'tag-beginner', intermediate:'tag-intermediate', advanced:'tag-advanced' };
      card.innerHTML = `
        <div class="lesson-card-tag ${levelColors[lesson.level]}">${lesson.level}</div>
        <div class="lesson-card-title">${lesson.title}</div>
        <div class="lesson-card-meta">
          <span>⏱ ${lesson.duration}</span>
          <span class="lesson-card-xp">+${lesson.xp} XP</span>
        </div>
      `;
      card.addEventListener('click', () => openLesson(lesson, lesson.level));
      wrap.appendChild(card);
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;
    buildFeaturedLessons();
  }

  function initLearnPage() {
    buildLearnPage();
  }

  return { init, initLearnPage, buildLearnPage, buildFeaturedLessons, openLesson, LESSONS };
})();
