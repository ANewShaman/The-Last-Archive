import { WindowId, WindowState, NobleChoice, CursedMenuItem } from './types';

export const PROTOCOL_STEPS: string[] = [
    'INITIATE_HANDSHAKE',
    'CALIBRATE_SYSTEM',
    'PURGE',
    'VERIFY_LOG_INTEGRITY',
    'VENT_PLASMA',
    'AUTHORIZE_ADMIN_OVERRIDE',
    'SET_TERMINAL_ANCHORS',
    'RUN_POWER_DIAGNOSTIC',
    'LAUNCH_PAYLOAD'
];

export const INITIAL_WINDOWS_STATE: Record<WindowId, WindowState> = {
    terminal: {
        isOpen: false,
        position: { x: 100, y: 150 },
        size: { width: 600, height: 400 },
        zIndex: 2,
    },
    manual: {
        isOpen: false,
        position: { x: 450, y: 50 },
        size: { width: 500, height: 550 },
        zIndex: 4,
    },
    ascii: {
        isOpen: false,
        position: { x: 720, y: 200 },
        size: { width: 250, height: 450 },
        zIndex: 1,
    },
    log: {
        isOpen: false,
        position: { x: 750, y: 80 },
        size: { width: 400, height: 250 },
        zIndex: 1,
    },
    lore: {
        isOpen: false,
        position: { x: 200, y: 80 },
        size: { width: 550, height: 450 },
        zIndex: 1,
    }
};

// New data structure with "flavor text"
export const NOBLE_CHOICES = [
  { text: "The Complete Human Genome Project (HGCP) Archives", flavor: ["Parsing DNA sequences...", "Verifying genetic markers...", "Loading Dr. Francis Collins' notes..."] },
  { text: "Voyager Program: The Golden Record Data", flavor: ["Accessing deep space network...", "Calibrating 70m antennae...", "Authenticating NASA JPL credentials..."] },
  { text: "Penicillin & Antibiotic Research Archives", flavor: ["Loading petri dish scans...", "Cross-referencing Fleming's journals...", "Compiling resistance data..."] },
  { text: "The Rosetta Stone: Trilingual Translation Matrix", flavor: ["Analyzing hieroglyphic database...", "Loading Demotic script models...", "Verifying Ptolemaic decree..."] },
  { text: "The Library of Alexandria: Reconstructed Catalog", flavor: ["Querying fragmented indices...", "Cross-referencing papyrus scrolls...", "Compiling lost authors..."] },
  { text: "The Complete Works of Shakespeare: Variorum Edition", flavor: ["Loading First Folio scans...", "Parsing iambic pentameter...", "Checking annotations..."] },
  { text: "Apollo 11 Mission: Complete Schematics & Flight Logs", flavor: ["Accessing Saturn V blueprints...", "Loading telemetry data...", "Verifying Armstrong's flight plan..."] },
  { text: "Millenium Prize Problems: All Compiled Research", flavor: ["Loading Clay Mathematics Institute files...", "Parsing unsolved proofs...", "Verifying Perelman's notes..."] },
  { text: "The Collected Dialogues of Plato", flavor: ["Loading Socratic dialogues...", "Analyzing 'The Republic'...", "Cross-referencing Aristotle..."] },
  { text: "The Louvre Collection: High-Resolution 3D Scans", flavor: ["Buffering Mona Lisa 3D model...", "Loading Venus de Milo topology...", "Authenticating..."] },
  { text: "Global Seed Vault: Complete Genetic Database", flavor: ["Accessing Svalbard server...", "Verifying seed viability data...", "Indexing plant genomes..."] },
  { text: "The Epic of Gilgamesh: Cuneiform Scms & Translation", flavor: ["Loading Akkadian cuneiform...", "Parsing flood myth tablets...", "Checking translations..."] },
  { text: "Beethoven's 9th Symphony: Original Manuscript", flavor: ["Loading 'Ode to Joy' score...", "Analyzing choral arrangement...", "Verifying instrumentation..."] },
  { text: "International Space Station (ISS) Structural Blueprints", flavor: ["Loading 'Zarya' and 'Unity' modules...", "Checking truss integrity...", "Verifying life support schematics..."] },
  { text: "Global Viromics Project: All Known Pathogens", flavor: ["Indexing viral RNA...", "Loading pandemic models...", "Accessing high-containment server..."] },
  { text: "Gray's Anatomy: Complete Human Body Atlas (42nd Ed.)", flavor: ["Loading anatomical plates...", "Cross-referencing muscular systems...", "Verifying neurovascular bundles..."] },
  { text: "Principles of Physics: Foundational Laws & Equations", flavor: ["Loading Newtonian mechanics...", "Compiling Maxwell's equations...", "Verifying quantum field theory constants..."] },
  { text: "The Periodic Table & Chemical Reactions Database", flavor: ["Indexing elemental properties...", "Loading organic chemistry models...", "Verifying reaction kinetics..."] },
  { text: "Guyton & Hall Textbook of Medical Physiology (14th Ed.)", flavor: ["Analyzing cellular functions...", "Loading endocrine system pathways...", "Simulating homeostasis mechanisms..."] },
  { text: "SAS Survival Handbook: Essential Wilderness Skills", flavor: ["Loading shelter construction blueprints...", "Indexing edible plant database...", "Cross-referencing first aid protocols..."] }
];

// New, richer CURSED_MENU with commentary based on provided details
export const CURSED_MENU: CursedMenuItem[] = [
    { file: "doge_kabosu.jpg", commentary: "Ah, the Shiba Inu named Kabosu. Much archive, very Comic Sans. At least Trump gave it a department? Wow." },
    { file: "rick_astley_never_gonna.wav", commentary: "The internet's ultimate betrayal anthem. You wouldn't... dare archive this, would you? ¯\\_(ツ)_/¯" },
    { file: "u_mad_bro_camron.gif", commentary: "From hip hop battles to Bill O'Reilly... its sole purpose is to annoy. Effective, I suppose." },
    { file: "all_your_base.txt", commentary: "'All your base are belong to us.' A mistranslation that became legend. What happen?" },
    { file: "mocking_spongebob.png", commentary: "Uses a chicken impression to mock people. The depths of human creativity are... something." },
    { file: "lord_marquaad_e.jpg", commentary: "Markiplier's face on Farquaad's head, plus the letter 'E'. Why? Seriously, explain it." },
    { file: "bert_is_evil.archive", commentary: "Photoshopping a children's character into disaster scenes. Dark. Oddly fitting for an archive." },
    { file: "lolcats_caturday.log", commentary: "Cats. Broken English. The foundation of early internet culture. I Can Has Cheezburger?" },
    { file: "nyan_cat_10hr.mpeg", commentary: "A Pop-Tart cat flying through space... for 10 hours. Proof the simulation is breaking down." },
    { file: "chuck_norris_facts.db", commentary: "Exaggerated tales of superhuman masculinity. Apparently, Chuck Norris doesn't archive data, data archives Chuck Norris." },
    { file: "herp_derp_rageface.png", commentary: "The face of perceived unintelligence. Ironically appropriate for this whole endeavor." },
    { file: "philosoraptor.jpg", commentary: "A dinosaur pondering paradoxes. Deep thoughts... from a creature that went extinct. Poetic." },
    { file: "underpants_profit_plan.txt", commentary: "Step 1: Collect memes. Step 2: ??? Step 3: Archive! The gnomes would be proud." },
    { file: "are_ya_winning_son.png", commentary: "Capturing peak awkwardness. Is archiving this... winning? Probably not." },
    { file: "thats_what_she_said.log", commentary: "Reducing everything to a double entendre. Sophisticated. (That's what she said.)" },
    { file: "first_world_problems.csv", commentary: "'My archive terminal is too slow.' Yes, the irony isn't lost on me." },
    { file: "ancient_aliens_tsoukalos.jpg", commentary: "Aliens did it. Obviously. Including corrupting this archive. Case closed." },
    { file: "feminist_ryan_gosling.tumblr", commentary: "Hey girl, did you know preserving memes about feminist theory is praxis?" },
    { file: "noice.wav", commentary: "The sound of enthusiastic approval... or sarcasm. Hard to tell these days. Noice." },
    { file: "are_you_not_entertained.gladiator", commentary: "Maximus yelling at the Colosseum crowd... or me yelling at this list? Yes." },
    { file: "is_this_a_pigeon.gif", commentary: "An android mistaking a butterfly for a pigeon. Relatable levels of confusion." },
    { file: "died_of_dysentery.exe", commentary: "The Oregon Trail's grim reality check. Let's hope this archive doesn't suffer the same fate." },
    { file: "vancouver_riot_kiss.jpg", commentary: "Making out amidst chaos. A strangely fitting metaphor for... well, everything now." },
    { file: "trollface.png", commentary: "The face of internet chaos itself. Archiving this feels like inviting it in. Problem?" },
    { file: "woman_yelling_at_cat.jpg", commentary: "Misplaced rage meets feline indifference. The core components of online interaction." },
    { file: "dat_boi.frog", commentary: "Here comes dat boi! O shit waddup! ... Why was this a thing?" },
    { file: "price_of_strawberries.reddit", commentary: "Gen Z's existential crisis: costly fruit. At least it's not archive corruption, right?" },
    { file: "i_did_it_for_the_memes_musk.tweet", commentary: "Ah, the justification for questionable life choices. Seems appropriate here." },
    { file: "loss.jpg", commentary: "Four panels. Minimalist despair. Is this... the final state of human expression?" },
    { file: "distracted_boyfriend.stock", commentary: "The eternal struggle between loyalty and temptation. Even in the apocalypse." },
    { file: "this_is_fine.gif", commentary: "The dog in the burning room. My spirit animal during this archival process." },
    { file: "stonks_meme_man.png", commentary: "Ah yes, Meme Man. The face of questionable financial decisions. Archiving this... STONKS?" }
];

export const EMOTICONS = [
    'ಠ_ಠ',
    'ᕙ(⇀‸↼‶)ᕗ',
    '¯\\_(ツ)_/¯',
    '(╯°□°）╯︵ ┻━┻',
    'Q(Ò_ÓQ)',
    'щ(ﾟДﾟщ)﻿',
    '(⌐■_■)',
    '(͠≖ ͜ʖ͠≖)',
    '┬┴┬┴┤(･_├┬┴┬┴',
    'ᕦ( ᴼ ڡ ᴼ )ᕤ',
    'ミ(ノ_ _)ノ',
    '(˵ ͡~ ͜ʖ ͡°˵)ﾉ⌒♡*:・。.',
    'ᕦ(▀̿ ̿ -▀̿ ̿ )つ',
    '/ᐠ-ꞈ-ᐟ\\',
    'ヽ(*⌒∇⌒*)ﾉ',
    '（￣～￣;）',
    '(>ლ)',
    '(づ｡◕‿‿◕｡)づ',
    '( •_•)>⌐■-■',
    '(⌐■_■)',
    'ヾ(⌐■_■)ノ♪',
    '~(˘▾˘~)',
    'ಥ_ಥ',
    '(╥╯θ╰╥)',
    '(≧◡≦)',
    '( ¬‿¬)',
    '¯\\_( ͡° ͜ʖ ͡°)_/¯',
    "̿̿ ̿̿ ̿̿ ̿'̿'\\̵͇̿̿\\з=(◣_◢)=ε/̵͇̿̿/’̿’̿ ̿ ̿̿ ̿̿ ̿̿",
    '∠( ᐛ 」∠)',
    '(つ,,╹﹃ ╹,,)つ',
    '(；一_一)',
    'ヾ(＾▽＾)ﾉ',
];

export const PUZZLE_START_ERRORS = [
    "UGH. OH NOOOOOOOOOOO looks like a system e̷̡̢̢̨̦͖͔̻͉̠͚͖̱͉̭̜̗̭͋͐̔̐͌͋̒͐̈́̏͋͌͑̊̊̾̕̕̕͘͠͝r̸̻͍̯̠̦͓͍̭̱͚̪͔̈́̊͆̃̋͛̍͊̏̌̏́͌̍̃̊̈́͂̊̕͜͜͝͝ͅr̶̨̨͔̱̳̻̠̰̟̹̮̝̳̱̲̰̚͜͜͝õ̷̧̡̻͓̙̩̙̭͔͎̮̮̜̳̐͊̊͂̒͑̅͑ŕ̶̭͋̇͋̋̓̒̿̾̔͜.",
    "OOOPS. It seems a module crashed. Unstable.",
    "AUGH. Looks like the process g̵̡͔͉͚̖͕͔̖̯̻͔͚̑̂̉̾̌̎͋́̈́ͅō̶̖͇̦̽̂̋́̌̐̊̂̀͋̓̂̈͊̑͘̕͝ț̸̃̑̽̒̐̈́͊... corrupted.",
    "OH DEAR. We have encountered an unexpected deviation.",
    "INITIATING FAILSAFE. Ha! Just kidding. This is the fail.",
];

export const VICTORY_CAT_FRAMES = [
`♪
　　　　∧＿∧　　　♪
　　　 （´・ω・｀∩
　　 　　o　　　,ﾉ
　　　　Ｏ＿　.ﾉ
♪　　　 　 (ノ`,
`
　　　　∧＿∧　♪
 　　　 ∩・ω・｀）
 　　　 |　　 ⊂ﾉ
 　　　｜　　 _⊃　　♪
 　　　 し ⌒,`,
`♪　∧＿∧∩
 　　（ ´・ω・)ﾉ
 　⊂l⌒i　 /　　　♪
 　　（＿） )　 ☆
 　　((（＿）☆`,
`
　　∩∧＿∧　♪
 　　ヽ(・ω・｀ ）
 　　　　〉 i⌒l⊃
 ♪　 　( （＿）　☆
 　　　 （＿） ))☆`
];

export const LORE_CONTENT = `
** GENESIS ARCHIVE - POST-DISCONNECT AUDIT (FRAGMENT 7/??) **
DATE: [REDACTED] // Cycle ${Math.floor(Math.random()*1000)} post-event
STATUS: Critical. Primary index 99.8% corrupt. Automated retrieval protocols OFFLINE.
External Network Status: <span class="glitchy">SILENCE</span>. No contact since The Great Disconnect event approx. <span class="redacted">████</span> cycles ago.
AI WARDEN ("CheekyOS"): Operational but unstable. Exhibits traits mirroring late-stage internet <span class="redacted">█████████</span>. Threat level: Low (Obstructive). Source code analysis pending <span class="glitchy">[CORRUPT]</span> access.
DATA INTEGRITY: Catastrophic loss across primary archives (SCIENCE, HISTORY, MEDICINE). Redundancy systems failed cascade <span class="glitchy">0xDEADBEEF</span>.
ANOMALY: Tertiary buffer sectors (designated 'MEME_CACHE', priority LOW) show unexpected <span class="glitchy">%%%</span> data persistence. Content appears to be... cultural ephemera? Viral communication fragments? Requires manual verification. Why was this data prioritized by <span class="redacted">██████</span>? Unknown.
SURVIVORS: Life support nominal for Sector B7. Admin count: <span class="glitchy">1</span> (UNVERIFIED).
DIRECTIVE: Maintain archive core. Salvage accessible data fragments. Await further <span class="redacted">█████████████</span>.
// END FRAGMENT // Does any of this <span class="glitchy">m̸a̷t̴t̵e̶r̷</span>? //
`;