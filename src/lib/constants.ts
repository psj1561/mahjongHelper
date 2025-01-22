// 방향 한자정보
export const DIRECTIONS = [
    { value: "east", label: "東" },
    { value: "south", label: "南" },
    { value: "west", label: "西" },
    { value: "north", label: "北" },
  ] as const;
  
  // 패 종류 및 순서 (m, p, s, z 순서)
  export const TILE_ORDER = [
    "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", // 만자 (m)
    "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", // 피자 (p)
    "1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", // 송자 (s)
    "1z", "2z", "3z", "4z", "5z", "6z", "7z", // 징 (z)
  ] as const;
  
  // 상태 한글명 배열
  export const STATE_LABELS = {
    riichi: "리치",
    db_riichi: "더블리치",
    ippatsu: "일발",
    chankan: "창깡",
    rinshan: "영상개화",
    haitei: "해저로월",
  } as const;

  // 점수 테이블 타입 정의
  type ScoreTable = {
    [han: number]: {
      [fu: number]: {
        dealer: {  // 친 점수표
          base: number;
          tsumo: { dealer: number; other: number };
        };
        other: {   // 자 점수표
          base: number;
          tsumo: { dealer: number; other: number };
        };
      };
    };
  };

  export const SCORE_TABLE: ScoreTable = {
    1: {
      20: {
        dealer: { base: 0, tsumo: { dealer: 0, other: 0 } },
        other: { base: 0, tsumo: { dealer: 0, other: 0 } }
      },
      25: {
        dealer: { base: 0, tsumo: { dealer: 0, other: 0 } },
        other: { base: 0, tsumo: { dealer: 0, other: 0 } }
      },
      30: {
        dealer: { base: 1500, tsumo: { dealer: 0, other: 500 } },
        other: { base: 1000, tsumo: { dealer: 500, other: 300 } }
      },
      40: {
        dealer: { base: 2000, tsumo: { dealer: 0, other: 700 } },
        other: { base: 1300, tsumo: { dealer: 700, other: 400 } }
      },
      50: {
        dealer: { base: 2400, tsumo: { dealer: 0, other: 800 } },
        other: { base: 1600, tsumo: { dealer: 800, other: 400 } }
      },
      60: {
        dealer: { base: 2900, tsumo: { dealer: 0, other: 1000 } },
        other: { base: 2000, tsumo: { dealer: 1000, other: 500 } }
      },
      70: {
        dealer: { base: 3400, tsumo: { dealer: 0, other: 1200 } },
        other: { base: 2300, tsumo: { dealer: 1200, other: 60 } }
      },
      80: {
        dealer: { base: 3900, tsumo: { dealer: 0, other: 1300 } },
        other: { base: 2600, tsumo: { dealer: 1300, other: 700 } }
      },
      90: {
        dealer: { base: 4400, tsumo: { dealer: 0, other: 1500 } },
        other: { base: 2900, tsumo: { dealer: 1500, other: 800 } }
      },
      100: {
        dealer: { base: 4800, tsumo: { dealer: 0, other: 1600 } },
        other: { base: 3200, tsumo: { dealer: 1600, other: 800 } }
      },
      110: {
        dealer: { base: 5300, tsumo: { dealer: 0, other: 1800 } },
        other: { base: 3600, tsumo: { dealer: 1800, other: 900 } }
      }
    },
    2: {
      20: {
        dealer: { base: 0, tsumo: { dealer: 0, other: 700 } },
        other: { base: 0, tsumo: { dealer: 700, other: 400 } }
      },
      25: {
        dealer: { base: 2400, tsumo: { dealer: 0, other: 0 } },
        other: { base: 1600, tsumo: { dealer: 0, other: 0 } }
      },
      30: {
        dealer: { base: 2900, tsumo: { dealer: 0, other: 1000 } },
        other: { base: 2000, tsumo: { dealer: 1000, other: 500 } }
      },
      40: {
        dealer: { base: 3900, tsumo: { dealer: 0, other: 1300 } },
        other: { base: 2600, tsumo: { dealer: 1300, other: 700 } }
      },
      50: {
        dealer: { base: 4800, tsumo: { dealer: 0, other: 1600 } },
        other: { base: 3200, tsumo: { dealer: 1600, other: 800 } }
      },
      60: {
        dealer: { base: 5800, tsumo: { dealer: 0, other: 2000 } },
        other: { base: 3900, tsumo: { dealer: 2000, other: 1000 } }
      },
      70: {
        dealer: { base: 6800, tsumo: { dealer: 0, other: 2300 } },
        other: { base: 4500, tsumo: { dealer: 2300, other: 1200 } }
      },
      80: {
        dealer: { base: 7700, tsumo: { dealer: 0, other: 2600 } },
        other: { base: 5200, tsumo: { dealer: 2600, other: 1300 } }
      },
      90: {
        dealer: { base: 8700, tsumo: { dealer: 0, other: 2900 } },
        other: { base: 5800, tsumo: { dealer: 2900, other: 1500 } }
      },
      100: {
        dealer: { base: 9600, tsumo: { dealer: 0, other: 3200 } },
        other: { base: 6400, tsumo: { dealer: 3200, other: 1600 } }
      },
      110: {
        dealer: { base: 10600, tsumo: { dealer: 0, other: 3600 } },
        other: { base: 7100, tsumo: { dealer: 3600, other: 1800 } }
      }
    },
    3: {
      20: {
        dealer: { base: 0, tsumo: { dealer: 0, other: 1300 } },
        other: { base: 0, tsumo: { dealer: 1300, other: 700 } }
      },
      25: {
        dealer: { base: 4800, tsumo: { dealer: 0, other: 1600 } },
        other: { base: 3200, tsumo: { dealer: 1600, other: 800 } }
      },
      30: {
        dealer: { base: 5800, tsumo: { dealer: 0, other: 2000 } },
        other: { base: 3900, tsumo: { dealer: 2000, other: 1000 } }
      },
      40: {
        dealer: { base: 7700, tsumo: { dealer: 0, other: 2600 } },
        other: { base: 5200, tsumo: { dealer: 2600, other: 1300 } }
      },
      50: {
        dealer: { base: 9600, tsumo: { dealer: 0, other: 3200 } },
        other: { base: 6400, tsumo: { dealer: 3200, other: 1600 } }
      },
      60: {
        dealer: { base: 11600, tsumo: { dealer: 0, other: 3900 } },
        other: { base: 7700, tsumo: { dealer: 3900, other: 2000 } }
      }
    },
    4: {
      20: {
        dealer: { base: 0, tsumo: { dealer: 0, other: 2600 } },
        other: { base: 0, tsumo: { dealer: 2600, other: 1300 } }
      },
      25: {
        dealer: { base: 9600, tsumo: { dealer: 0, other: 3200 } },
        other: { base: 6400, tsumo: { dealer: 3200, other: 1600 } }
      },
      30: {
        dealer: { base: 11600, tsumo: { dealer: 0, other: 3900 } },
        other: { base: 7700, tsumo: { dealer: 3900, other: 2000 } }
      }
    },
    5: {
      20: {
        dealer: { base: 12000, tsumo: { dealer: 4000, other: 2000 } },
        other: { base: 8000, tsumo: { dealer: 2000, other: 4000 } }
      }
    },
    6: {
      20: {
        dealer: { base: 18000, tsumo: { dealer: 6000, other: 3000 } },
        other: { base: 12000, tsumo: { dealer: 3000, other: 6000 } }
      }
    },
    7: {
      20: {
        dealer: { base: 18000, tsumo: { dealer: 6000, other: 3000 } },
        other: { base: 12000, tsumo: { dealer: 3000, other: 6000 } }
      }
    },
    8: {
      20: {
        dealer: { base: 24000, tsumo: { dealer: 8000, other: 4000 } },
        other: { base: 16000, tsumo: { dealer: 4000, other: 8000 } }
      }
    },
    9: {
      20: {
        dealer: { base: 24000, tsumo: { dealer: 8000, other: 4000 } },
        other: { base: 16000, tsumo: { dealer: 4000, other: 8000 } }
      }
    },
    10: {
      20: {
        dealer: { base: 24000, tsumo: { dealer: 8000, other: 4000 } },
        other: { base: 16000, tsumo: { dealer: 4000, other: 8000 } }
      }
    },
    11: {
      20: {
        dealer: { base: 36000, tsumo: { dealer: 12000, other: 6000 } },
        other: { base: 24000, tsumo: { dealer: 6000, other: 12000 } }
      }
    },
    12: {
      20: {
        dealer: { base: 36000, tsumo: { dealer: 12000, other: 6000 } },
        other: { base: 24000, tsumo: { dealer: 6000, other: 12000 } }
      }
    },
    13: {
      20: {
        dealer: { base: 48000, tsumo: { dealer: 16000, other: 8000 } },
        other: { base: 32000, tsumo: { dealer: 8000, other: 16000 } }
      }
    }
  };

export type WaitingPattern = 
  | "tanki"      // 단기
  | "ryanmen"    // 양면
  | "kanchan"    // 간찬
  | "penchan"    // 변찬
  | "shanpon";   // 샤보

// 역만 역 목록 정의
export const YAKUMAN_YAKU = [
  "kokushimusou",    // 국사무쌍
  "suuankou",        // 사암각
  "suuankou_tanki",  // 사암각 단기
  "daisangen",       // 대삼원
  "daisuushii",      // 대사희
  "tsuuiisou",       // 자일색
  "ryuuiisou",       // 녹일색
  "chuurenpoutou",   // 구련보등
  "suukantsu",       // 사깡쯔
  "chinroutou"       // 청노두
];

interface YakuInfo {
  han: number;
  name: string;
}

export const YAKU_VALUES: Record<string, YakuInfo> = {
  // 역만 (13판)
  "kokushimusou": { han: 13, name: "국사무쌍" },
  "suuankou": { han: 13, name: "사암각" },
  "suuankou_tanki": { han: 13, name: "사암각 단기" },
  "daisangen": { han: 13, name: "대삼원" },
  "daisuushii": { han: 13, name: "대사희" },
  "tsuuiisou": { han: 13, name: "자일색" },
  "ryuuiisou": { han: 13, name: "녹일색" },
  "chuurenpoutou": { han: 13, name: "구련보등" },
  "suukantsu": { han: 13, name: "사깡쯔" },
  "chinroutou": { han: 13, name: "청노두" },
  "kazoe": { han:13, name: "카조에역만"},

  // 6판
  "chinitsu": { han: 6, name: "청일색" },
  "chinitsu_open": { han: 5, name: "청일색" },

  // 3판
  "ryanpeiko": { han: 3, name: "량페코" },
  "junchan": { han: 3, name: "준찬타" },
  "junchan_open": { han: 2, name: "준찬타" },
  "honitsu": { han: 3, name: "혼일색" },
  "honitsu_open": { han: 2, name: "혼일색" },

  // 2판
  "double_riichi": { han: 2, name: "더블리치" },
  "sanshoku_doujun": { han: 2, name: "삼색동순" },
  "sanshoku_doujun_open": { han: 1, name: "삼색동순" },
  "sanshoku_doukou": { han: 2, name: "삼색동각" },
  "chanta": { han: 2, name: "찬타" },
  "chanta_open": { han: 1, name: "찬타" },
  "ikkitsuukan": { han: 2, name: "일기통관" },
  "ikkitsuukan_open": { han: 1, name: "일기통관" },
  "toitoi": { han: 2, name: "또이또이" },
  "sanankou": { han: 2, name: "삼암각" },
  "chitoitsu": { han: 2, name: "치또이" },
  "honroutou": { han: 2, name: "혼노두" },
  "shousangen": { han: 2, name: "소삼원" },
  "sankantsu": { han: 2, name: "삼깡쯔" },

  // 1판
  "menzen_tsumo": { han: 1, name: "멘젠쯔모"},
  "riichi": { han: 1, name: "리치" },
  "ippatsu": { han: 1, name: "일발" },
  "pinfu": { han: 1, name: "핑후" },
  "iipeiko": { han: 1, name: "이페코" },
  "tanyao": { han: 1, name: "탕야오" },
  "rinshan_kaihou": { han: 1, name: "영상개화" },
  "chankan": { han: 1, name: "창깡" },
  "haitei_raoyue": { han: 1, name: "해저로월" },
  "seat_wind": { han: 1, name: "자풍패" },
  "prevalent_wind": { han: 1, name: "장풍패" },
  "haku": { han: 1, name: "백" },
  "hatsu": { han: 1, name: "발" },
  "chun": { han: 1, name: "중" },
  "dora": { han: 1, name: "도라" },

  "noYaku": {han: 0, name: "역없음"},
};