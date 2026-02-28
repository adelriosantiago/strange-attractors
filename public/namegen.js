namegen = (() => {
  function namegen(params) {
    // Syllable pools (kept from original)
    var vowels = {
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

    var mtx = [
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

    // simple RNG helper (mulberry32) with seed derived from params when available
    // create a canonical seed string from numeric params (a,b,c,x,y,z)
    var seedStr = (function () {
      var p = params || {}
      var keys = ["a", "b", "c", "x", "y", "z"]
      return keys
        .map(function (k) {
          var v = p[k] != null && !isNaN(Number(p[k])) ? Number(p[k]) : 0
          return k + ":" + v
        })
        .join("|")
    })()
    var hfn = function (s) {
      var h = 2166136261 >>> 0
      for (var k = 0; k < s.length; k++) {
        h ^= s.charCodeAt(k)
        h = Math.imul(h, 16777619) >>> 0
      }
      return h >>> 0
    }
    var mulberry32 = function (a) {
      return function () {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        var t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }

    var _seed = hfn(seedStr)
    var rand = mulberry32(_seed)
    var fn = function (i) {
      return Math.floor(rand() * vowels[i].length)
    }

    // Determine desired number of syllable blocks based on numeric params
    var desiredSyllables
    if (params) {
      var vals = []
      ;["a", "b", "c", "x", "y", "z"].forEach(function (k) {
        if (params[k] != null && !isNaN(Number(params[k])))
          vals.push(Math.abs(Number(params[k])))
      })
      if (vals.length) {
        var avg =
          vals.reduce(function (s, v) {
            return s + v
          }, 0) / vals.length
        // map average magnitude to syllable count: gentle growth with log10
        desiredSyllables = 1 + Math.min(9, Math.floor(Math.log10(avg + 1) * 4))
      }
    }

    // fallback to original behavior: use the length of the first pattern
    if (!desiredSyllables || desiredSyllables < 1) {
      var c = 0
      var comp0 = mtx[c % mtx.length]
      desiredSyllables = Math.max(1, comp0.length / 2)
    }

    // build name from syllable blocks (use patterns to keep pronounceable structure)
    var name = ""
    for (var s = 0; s < desiredSyllables; s++) {
      var comp = mtx[Math.floor(rand() * mtx.length)]
      // Pick a pair within the pattern (driven by seeded rand)
      var pairIndex = Math.floor(rand() * (comp.length / 2))
      var t = comp[pairIndex * 2]
      var v = comp[pairIndex * 2 + 1]
      name += vowels[t][fn(v)]
    }

    // sanitize and return in upper-case for consistency
    return name.replace(/[^a-zA-Z]/g, "").toUpperCase()
  }

  return namegen
})()
