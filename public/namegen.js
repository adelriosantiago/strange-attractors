namegen = (() => {
  const namegen = (params) => {
    // Syllable pools (kept from original)
    const vowels = {
      1: [
        "b",
        "c",
        "d",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "p",
        "q",
        "r",
        "s",
        "t",
        "v",
        "w",
        "x",
        "y",
        "z",
      ],
      2: ["a", "e", "o", "u"],
      3: [
        "br",
        "cr",
        "dr",
        "fr",
        "gr",
        "pr",
        "str",
        "tr",
        "bl",
        "cl",
        "fl",
        "gl",
        "pl",
        "sl",
        "sc",
        "sk",
        "sm",
        "sn",
        "sp",
        "st",
        "sw",
        "ch",
        "sh",
        "th",
        "wh",
      ],
      4: [
        "ae",
        "ai",
        "ao",
        "au",
        "a",
        "ay",
        "ea",
        "ei",
        "eo",
        "eu",
        "e",
        "ey",
        "ua",
        "ue",
        "ui",
        "uo",
        "u",
        "uy",
        "ia",
        "ie",
        "iu",
        "io",
        "iy",
        "oa",
        "oe",
        "ou",
        "oi",
        "o",
        "oy",
      ],
      5: [
        "turn",
        "ter",
        "nus",
        "rus",
        "tania",
        "hiri",
        "hines",
        "gawa",
        "nides",
        "carro",
        "rilia",
        "stea",
        "lia",
        "lea",
        "ria",
        "nov",
        "phus",
        "mia",
        "nerth",
        "wei",
        "ruta",
        "tov",
        "zuno",
        "vis",
        "lara",
        "nia",
        "liv",
        "tera",
        "gantu",
        "yama",
        "tune",
        "ter",
        "nus",
        "cury",
        "bos",
        "pra",
        "thea",
        "nope",
        "tis",
        "clite",
      ],
      6: [
        "una",
        "ion",
        "iea",
        "iri",
        "illes",
        "ides",
        "agua",
        "olla",
        "inda",
        "eshan",
        "oria",
        "ilia",
        "erth",
        "arth",
        "orth",
        "oth",
        "illon",
        "ichi",
        "ov",
        "arvis",
        "ara",
        "ars",
        "yke",
        "yria",
        "onoe",
        "ippe",
        "osie",
        "one",
        "ore",
        "ade",
        "adus",
        "urn",
        "ypso",
        "ora",
        "iuq",
        "orix",
        "apus",
        "ion",
        "eon",
        "eron",
        "ao",
        "omia",
      ],
    }

    const mtx = [
      [1, 1, 2, 2, 5, 5],
      [2, 2, 3, 3, 6, 6],
      [3, 3, 4, 4, 5, 5],
      [4, 4, 3, 3, 6, 6],
      [3, 3, 4, 4, 2, 2, 5, 5],
      [2, 2, 1, 1, 3, 3, 6, 6],
      [3, 3, 4, 4, 2, 2, 5, 5],
      [4, 4, 3, 3, 1, 1, 6, 6],
      [3, 3, 4, 4, 1, 1, 4, 4, 5, 5],
      [4, 4, 1, 1, 4, 4, 3, 3, 6, 6],
    ]

    // Create deterministic RNG seed string from numeric params
    const seedStr = (() => {
      const p = params || {}
      const keys = ["a", "b", "c", "x", "y", "z"]
      return keys
        .map((k) => {
          const v =
            p[k] !== undefined && Number.isFinite(Number(p[k]))
              ? Number(p[k])
              : 0
          return `${k}:${v}`
        })
        .join("|")
    })()

    // 32-bit FNV-1a hash
    const hfn = (s) => {
      let h = 2166136261 >>> 0
      for (let k = 0; k < s.length; k++) {
        h ^= s.charCodeAt(k)
        h = Math.imul(h, 16777619) >>> 0
      }
      return h >>> 0
    }

    // Mulberry32 PRNG factory
    const mulberry32 = (a) => {
      return () => {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }

    const _seed = hfn(seedStr)
    const rand = mulberry32(_seed)
    const fn = (i) => Math.floor(rand() * vowels[i].length)

    // Determine desired number of syllable blocks based on numeric params
    let desiredSyllables
    if (params) {
      const vals = []
      ;["a", "b", "c", "x", "y", "z"].forEach((k) => {
        if (params[k] !== undefined && Number.isFinite(Number(params[k]))) {
          vals.push(Math.abs(Number(params[k])))
        }
      })
      if (vals.length > 0) {
        const avg = vals.reduce((s, v) => s + v, 0) / vals.length
        // Map average magnitude to syllable count: gentle growth with log10
        desiredSyllables = 1 + Math.min(9, Math.floor(Math.log10(avg + 1) * 4))
      }
    }

    // Fallback to original behavior: use the length of the first pattern
    if (!desiredSyllables || desiredSyllables < 1) {
      const comp0 = mtx[0]
      desiredSyllables = Math.max(1, comp0.length / 2)
    }

    // Helper: build one word of N syllable-blocks
    const makeWord = (syllables) => {
      let w = ""
      for (let si = 0; si < syllables; si++) {
        const comp = mtx[Math.floor(rand() * mtx.length)]
        const pairIndex = Math.floor(rand() * (comp.length / 2))
        const t = comp[pairIndex * 2]
        const v = comp[pairIndex * 2 + 1]
        w += vowels[t][fn(v)]
      }
      return w.replace(/[^a-zA-Z]/g, "").toUpperCase()
    }

    // Format selection (deterministic): choose number of words (1..4)
    const maxWords = Math.min(4, Math.max(1, Math.floor(desiredSyllables / 1)))
    const wordsCount = 1 + Math.floor(rand() * maxWords)

    // Distribute syllables across words (round-robin)
    const base = Math.floor(desiredSyllables / wordsCount)
    const extra = desiredSyllables - base * wordsCount
    const words = []
    for (let wi = 0; wi < wordsCount; wi++) {
      let syll = base + (wi < extra ? 1 : 0)
      // Ensure at least 1 syllable per word
      syll = Math.max(1, syll)
      words.push(makeWord(syll))
    }

    // Optionally append a numeric or roman suffix: probability grows with desiredSyllables
    const appendChance = Math.min(0.6, 0.15 + desiredSyllables / 20)
    const doAppend = rand() < appendChance
    let suffix = ""
    if (doAppend) {
      // Choose upper bound based on desiredSyllables
      const maxNum = Math.max(
        9,
        Math.min(9999, Math.floor(Math.pow(10, Math.min(6, desiredSyllables))))
      )
      // Pick a number deterministically
      const num = 1 + Math.floor(rand() * maxNum)
      // Decide arabic vs roman
      const useRoman = rand() < 0.5
      if (useRoman) {
        const toRoman = (n) => {
          const romans = [
            [1000, "M"],
            [900, "CM"],
            [500, "D"],
            [400, "CD"],
            [100, "C"],
            [90, "XC"],
            [50, "L"],
            [40, "XL"],
            [10, "X"],
            [9, "IX"],
            [5, "V"],
            [4, "IV"],
            [1, "I"],
          ]
          let r = ""
          for (let i = 0; i < romans.length; i++) {
            const v = romans[i][0]
            const s = romans[i][1]
            while (n >= v) {
              r += s
              n -= v
            }
          }
          return r
        }
        suffix = ` ${toRoman(Math.max(1, Math.min(3999, num)))}`
      } else {
        suffix = ` ${String(num)}`
      }
    }

    // Join words with spaces
    const finalName = words.join(" ") + suffix
    return finalName
  }
  return namegen
})()
