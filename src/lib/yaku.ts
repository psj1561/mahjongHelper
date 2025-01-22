import type { WaitingPattern } from "./constants";
import { YAKUMAN_YAKU, YAKU_VALUES } from "./constants";

interface TileSet {
  value: string;
  type: string; // chi(울은 슌쯔), pong(안커), kan(밍깡), jakan(안깡), sequence(울지않은 슌쯔), triplet(밍커)
}

interface YakuAnalysisInput {
  bodyTiles: TileSet[];
  headTiles: TileSet[];
  lastSelectedTile: string;
  dora: number;
  tsumoRon: "tsumo" | "ron";
  prevalent: "east" | "south" | "west" | "north";
  seat: "east" | "south" | "west" | "north";
  states: Record<string, boolean>;
  waitingPattern: WaitingPattern | undefined;
}

// 헬퍼 함수들
const isYaochuTile = (tile: string | undefined) => {
  if (!tile) return false;
  return tile.startsWith('1') || tile.startsWith('9') || tile.endsWith('z');
};

const isTerminalTile = (tile: string | undefined) => {
  if (!tile) return false;
  return (tile.startsWith('1') || tile.startsWith('9')) && !tile.endsWith('z');
};

const isHonorTile = (tile: string | undefined) => {
  if (!tile) return false;
  return tile.endsWith('z');
};

const hasYaochuInSet = (tiles: (string | undefined)[]) => {
  if (!tiles || !Array.isArray(tiles)) return false;
  return tiles.some(isYaochuTile);
};

interface YakuResult {
  yaku: string[];
  total: number;
}

export function analyzeYaku(input: YakuAnalysisInput): YakuResult {
  let yaku: string[] = [];

  // 기본 데이터 준비
  const isMenzen = input.bodyTiles.every(tile => 
    ["sequence", "triplet", "jakan"].includes(tile.type)
  );
  
  const sequences = input.bodyTiles.filter(tile => 
    tile.type === "sequence" || tile.type === "chi"
  );
  
  const triplets = input.bodyTiles.filter(tile => 
    ["pong", "kan", "jakan", "triplet"].includes(tile.type)
  );

  const allTiles = [
    ...input.bodyTiles.flatMap(tile => {
      const tileLength = tile.value?.length || 0;
      if (tileLength < 2) return [];
      return Array.from(
        { length: tileLength / 2 }, 
        (_, i) => tile.value.substring(i * 2, i * 2 + 2)
      ).filter(Boolean);
    }),
    ...input.headTiles.flatMap(tile => {
      const tileLength = tile.value?.length || 0;
      if (tileLength < 2) return [];
      return Array.from(
        { length: tileLength / 2 }, 
        (_, i) => tile.value.substring(i * 2, i * 2 + 2)
      ).filter(Boolean);
    })
  ].filter(Boolean);

  // 모든 역 체크 후 역만이 있는지 확인하고 필터링
  checkStateBasedYaku(input, yaku, isMenzen);
  checkWindAndDragonYaku(input, yaku);
  checkColorBasedYaku(allTiles, yaku, isMenzen);
  checkYaochuBasedYaku(input, allTiles, isMenzen, yaku);
  checkTripletBasedYaku(input, triplets, isMenzen, yaku);
  checkSequenceBasedYaku(input, sequences, isMenzen, yaku);
  checkSpecialYaku(input, allTiles, sequences, isMenzen, yaku);

  // 역만이 있는지 확인
  const hasYakuman = yaku.some(y => YAKUMAN_YAKU.includes(y));

  // 역만이 있으면 역만만 남기고 나머지는 제거
  if (hasYakuman) {
    yaku = yaku.filter(y => YAKUMAN_YAKU.includes(y));
    return {
      yaku,
      total: yaku.length * 13
    };
  }

  // 치또이와 량페코가 동시에 성립할 경우 치또이 제거
  if (yaku.includes("ryanpeiko") && yaku.includes("chitoitsu")) {
    yaku = yaku.filter(y => y !== "chitoitsu");
  }

  // 총 역 수 계산
  const total = yaku.reduce((sum, y) => sum + (YAKU_VALUES[y]?.han || 0), 0) + input.dora;

  // 도라를 제외한 역이 하나도 없으면 역없음 처리
  const hasRealYaku = yaku.some(y => y !== "dora" + input.dora);
  if (!hasRealYaku) {
    return {
      yaku: ["noYaku"],
      total: 0
    };
  }

  // 총 역수가 13 이상이면 카조에 역만으로 처리
  if (total >= 13) {
    yaku = ["kazoe"]; // 카조에 역만만 남김
    return {
      yaku,
      total: 13
    };
  }

  return { yaku, total };
}

// 각 카테고리별 체크 함수들
function checkStateBasedYaku(input: YakuAnalysisInput, yaku: string[], isMenzen:boolean) {
  if (input.tsumoRon == "tsumo" && isMenzen) yaku.push("menzen_tsumo");
  if (input.states.riichi) yaku.push("riichi");
  if (input.states.db_riichi) yaku.push("double_riichi");
  if (input.states.ippatsu) yaku.push("ippatsu");
  if (input.states.chankan) yaku.push("chankan");
  if (input.states.rinshan) yaku.push("rinshan_kaihou");
  if (input.states.haitei) yaku.push("haitei_raoyue");
  if (input.dora != 0) yaku.push("dora"+input.dora);
}

function checkWindAndDragonYaku(input: YakuAnalysisInput, yaku: string[]) {
  // 자풍패 체크
  const seatWindNumber = { east: "1", south: "2", west: "3", north: "4" }[input.seat];
  const hasSeatWind = input.bodyTiles.some(tile => 
    tile.value.includes(`${seatWindNumber}z`) && 
    ["pong", "kan", "jakan", "triplet"].includes(tile.type)
  );
  if (hasSeatWind) yaku.push("seat_wind");

  // 장풍패 체크
  const prevalentWindNumber = { east: "1", south: "2", west: "3", north: "4" }[input.prevalent];
  const hasPrevalentWind = input.bodyTiles.some(tile => 
    tile.value.includes(`${prevalentWindNumber}z`) && 
    ["pong", "kan", "jakan", "triplet"].includes(tile.type)
  );
  if (hasPrevalentWind) yaku.push("prevalent_wind");

  // 삼원패 체크
  const hasWhiteDragon = input.bodyTiles.some(tile => 
    tile.value.includes("5z") && 
    ["pong", "kan", "jakan", "triplet"].includes(tile.type)
  );
  const hasGreenDragon = input.bodyTiles.some(tile => 
    tile.value.includes("6z") && 
    ["pong", "kan", "jakan", "triplet"].includes(tile.type)
  );
  const hasRedDragon = input.bodyTiles.some(tile => 
    tile.value.includes("7z") && 
    ["pong", "kan", "jakan", "triplet"].includes(tile.type)
  );
  if (hasWhiteDragon) yaku.push("haku");
  if (hasGreenDragon) yaku.push("hatsu");
  if (hasRedDragon) yaku.push("chun");

  // 바람패 세트 체크
  const hasEastWind = input.bodyTiles.some(tile => 
    tile.value.includes("1z") && ["pong", "kan", "jakan", "triplet"].includes(tile.type)
  );
  const hasSouthWind = input.bodyTiles.some(tile => 
    tile.value.includes("2z") && ["pong", "kan", "jakan", "triplet"].includes(tile.type)
  );
  const hasWestWind = input.bodyTiles.some(tile => 
    tile.value.includes("3z") && ["pong", "kan", "jakan", "triplet"].includes(tile.type)
  );
  const hasNorthWind = input.bodyTiles.some(tile => 
    tile.value.includes("4z") && ["pong", "kan", "jakan", "triplet"].includes(tile.type)
  );

  // 바람패 개수
  const windCount = [hasEastWind, hasSouthWind, hasWestWind, hasNorthWind].filter(Boolean).length;
  const hasWindPair = input.headTiles.some(tile => 
    ["1z", "2z", "3z", "4z"].includes(tile.value.substring(0, 2))
  );

  // 소사희/대사희 체크
  if (windCount === 3 && hasWindPair) {
    yaku.push("shousuushii");
  }
  if (windCount === 4) {
    yaku.push("daisuushii");
  }

  // 삼원패 개수
  const dragonCount = [hasWhiteDragon, hasGreenDragon, hasRedDragon].filter(Boolean).length;
  const hasDragonPair = input.headTiles.some(tile => 
    ["5z", "6z", "7z"].includes(tile.value.substring(0, 2))
  );

  // 소삼원/대삼원 체크
  if (dragonCount === 2 && hasDragonPair) {
    yaku.push("shousangen");
  }
  if (dragonCount === 3) {
    yaku.push("daisangen");
  }
}

function checkColorBasedYaku(allTiles: string[], yaku: string[], isMenzen: boolean) {
  // 단일색 체크
  const hasOnlyMan = allTiles.every(tile => tile.endsWith('m'));
  const hasOnlyPin = allTiles.every(tile => tile.endsWith('p'));
  const hasOnlySou = allTiles.every(tile => tile.endsWith('s'));

  // 청일색 체크
  if (hasOnlyMan || hasOnlyPin || hasOnlySou) {
    if (isMenzen)
      yaku.push("chinitsu");
    else
      yaku.push("chinitsu_open");
  }

  // 혼일색 체크
  const nonZiTiles = allTiles.filter(tile => !tile.endsWith('z'));
  const hasZiTiles = allTiles.some(tile => tile.endsWith('z'));
  const isAllSameType = nonZiTiles.every(tile => tile.endsWith(nonZiTiles[0].slice(-1)));
  if (isAllSameType && hasZiTiles && nonZiTiles.length > 0) {
    if (isMenzen) {
      yaku.push("honitsu");
    } else {
      yaku.push("honitsu_open");
    }
  }

  // 자일색 체크 (모든 패가 자패)
  if (allTiles.every(tile => tile.endsWith('z'))) {
    yaku.push("tsuuiisou");
  }
}

function checkYaochuBasedYaku(input: YakuAnalysisInput, allTiles: string[], isMenzen: boolean, yaku: string[]) {
  const bodyTileSets = input.bodyTiles.map(tile => 
    Array.from({ length: tile.value.length / 2 }, (_, i) => 
      tile.value.substring(i * 2, i * 2 + 2)
    )
  );
  const headTiles = input.headTiles.flatMap(tile => 
    Array.from({ length: tile.value.length / 2 }, (_, i) => 
      tile.value.substring(i * 2, i * 2 + 2)
    )
  );

  // 탕야오 체크
  if (allTiles.every(tile => !isYaochuTile(tile))) {
    yaku.push("tanyao");
  }

  // 혼노두 체크 (먼저 체크)
  const isHonroutou = allTiles.every(isYaochuTile) && 
    allTiles.some(isTerminalTile) && 
    allTiles.some(isHonorTile);
  if (isHonroutou) {
    yaku.push("honroutou");
  }

  // 준찬타 체크 (모든 면자와 머리에 노두패가 포함되어 있고, 자패가 없는 경우)
  const isJunchan = bodyTileSets.every(tiles => 
    tiles.some(isTerminalTile)
  ) && 
  isTerminalTile(headTiles[0]) &&
  allTiles.every(tile => !isHonorTile(tile));

  // 찬타 체크
  const isChanta = bodyTileSets.every(hasYaochuInSet) && 
    isYaochuTile(headTiles[0]) &&
    !bodyTileSets.every(tiles => tiles.every(isHonorTile)) &&
    !bodyTileSets.every(tiles => tiles.every(isTerminalTile));

  // 준찬타가 성립하고 혼노두가 아닐 때만 적용
  if (isJunchan && !isHonroutou) {
    if (isMenzen) {
      yaku.push("junchan");
    } else {
      yaku.push("junchan_open");
    }
  } else if (isChanta) {
    if (isMenzen) {
      yaku.push("chanta");
    } else {
      yaku.push("chanta_open");
    }
  }

  // 청노두 체크 (모든 패가 1이나 9이면서 자패가 없어야 함)
  if (allTiles.every(tile => isTerminalTile(tile)) && allTiles.every(tile => !tile.endsWith('z'))) {
    yaku.push("chinroutou");
  }
}

function checkTripletBasedYaku(input: YakuAnalysisInput, triplets: TileSet[], isMenzen: boolean, yaku: string[]) {
  // 또이또이 체크
  const isAllTriplets = input.bodyTiles.every(tile => 
    ["pong", "kan", "jakan", "triplet"].includes(tile.type)
  );
  if (isAllTriplets) {
    yaku.push("toitoi");
  }

  // 사암각 먼저 체크
  const concealedTriplets = input.bodyTiles.filter(tile => 
    tile.type === "triplet" || tile.type === "jakan"
  );
  if (concealedTriplets.length === 4) {
    // 마지막 패가 머리인 경우 (단기)
    if (input.headTiles.some(tile => tile.value.substring(0, 2) === input.lastSelectedTile)) {
      yaku.push("suuankou_tanki");  // 사암각 단기
    }
    // 마지막 패가 몸통이고 쯔모인 경우
    else if (input.tsumoRon === "tsumo") {
      yaku.push("suuankou");  // 일반 사암각
    }
    else if (input.tsumoRon === "ron") {
      yaku.push("sanankou");  // 론으로 먹으면 삼암각
    }
  }
  // 삼암각 체크 (사암각이 아닐 때)
  else if (concealedTriplets.length === 3) {
    yaku.push("sanankou");
  }

  // 삼깡즈/사깡즈 체크
  const kanCount = input.bodyTiles.filter(tile => 
    tile.type === "kan" || tile.type === "jakan"
  ).length;
  if (kanCount === 3) {
    yaku.push("sankantsu");
  }
  if (kanCount === 4) {
    yaku.push("suukantsu");
  }
}

function checkSequenceBasedYaku(input: YakuAnalysisInput, sequences: TileSet[], isMenzen: boolean, yaku: string[]) {
  // 일기통관 체크
  const hasIkkitsuukan = ['m', 'p', 's'].some(type => {
    const typeSequences = sequences.filter(seq => seq.value.endsWith(type));
    return typeSequences.some(seq1 => 
      typeSequences.some(seq2 => 
        typeSequences.some(seq3 => {
          const s1 = parseInt(seq1.value[0]);
          const s2 = parseInt(seq2.value[0]);
          const s3 = parseInt(seq3.value[0]);
          return (s1 === 1 && s2 === 4 && s3 === 7);
        })
      )
    );
  });
  if (hasIkkitsuukan) {
    if (isMenzen){
      yaku.push("ikkitsuukan");
    }else{
      yaku.push("ikkitsuukan_open");
    }
    
  }

  // 삼색동순 체크
  const hasSanshokuDoujun = sequences.some(seq1 => 
    sequences.some(seq2 => 
      sequences.some(seq3 => {
        if (seq1.value.endsWith('m') && seq2.value.endsWith('p') && seq3.value.endsWith('s')) {
          const num1 = seq1.value.substring(0, 1);
          const num2 = seq2.value.substring(0, 1);
          const num3 = seq3.value.substring(0, 1);
          return num1 === num2 && num2 === num3;
        }
        return false;
      })
    )
  );
  if (hasSanshokuDoujun) {
    if(isMenzen){
      yaku.push("sanshoku_doujun");
    }
    else{yaku.push("sanshoku_doujun_open");}
  }

  // 삼색동각 체크
  const triplets = input.bodyTiles.filter(tile => 
    ["pong", "kan", "jakan", "triplet"].includes(tile.type)
  );
  const hasSanshokuDoukou = triplets.some(trip1 => 
    triplets.some(trip2 => 
      triplets.some(trip3 => {
        if (trip1.value.endsWith('m') && trip2.value.endsWith('p') && trip3.value.endsWith('s')) {
          const num1 = trip1.value.substring(0, 2);
          const num2 = trip2.value.substring(0, 2);
          const num3 = trip3.value.substring(0, 2);
          return num1[0] === num2[0] && num2[0] === num3[0];
        }
        return false;
      })
    )
  );
  if (hasSanshokuDoukou) {
    yaku.push("sanshoku_doukou");
  }

  // 이페코/량페코 체크
  const chiSequences = input.bodyTiles.filter(tile => 
    tile.type === "sequence" && tile.value.length === 6
  );
  const samePatternsCount = chiSequences.reduce((count, seq1, index) => {
    for (let i = index + 1; i < chiSequences.length; i++) {
      const seq2 = chiSequences[i];
      if (seq1.value === seq2.value) {
        count++;
      }
    }
    return count;
  }, 0);
  if (samePatternsCount === 1 && isMenzen) {
    yaku.push("iipeiko");
  } else if (samePatternsCount === 2 && isMenzen) {
    yaku.push("ryanpeiko");
  }
}

function checkSpecialYaku(input: YakuAnalysisInput, allTiles: string[], sequences: TileSet[], isMenzen: boolean, yaku: string[]) {
    const checkPinfuYaku = (input: YakuAnalysisInput, sequences: TileSet[], isMenzen: boolean, yaku: string[]) => {
        // 핑후 조건:
        // 1. 멘젠 상태여야 함
        if (!isMenzen) return false;
      
        // 2. 모든 면자가 슌쯔여야 함
        const hasOnlySequences = input.bodyTiles.every(tile => 
          tile.type === "sequence" || tile.type === "chi"
        );
        if (!hasOnlySequences) return false;
      
        // 3. 머리가 있어야 하고 역패가 아니어야 함
        if (!input.headTiles || !input.headTiles[0]) return false;
        
        const head = input.headTiles[0].value;
        const isValueHead = head.endsWith('z') && (
          head.startsWith(String({ east: "1", south: "2", west: "3", north: "4" }[input.seat])) ||
          head.startsWith(String({ east: "1", south: "2", west: "3", north: "4" }[input.prevalent])) ||
          ["5", "6", "7"].includes(head[0])
        );
        if (isValueHead) return false;
      
        // 4. 대기가 양면대기여야 함
        if (input.waitingPattern !== "ryanmen") return false;
      
        yaku.push("pinfu");
        return true;
    }
    
    // 핑후 체크
    checkPinfuYaku(input, sequences, isMenzen, yaku);

    // 치또이 체크 (7개의 서로 다른 쌍)
    const isChitoitsu = () => {
      // 멘젠이 아니면 치또이 불가
      if (!isMenzen) return false;

      // 모든 패를 쌍으로 분리
      const pairs = new Set<string>();
      const pairCounts: Record<string, number> = {};

      allTiles.forEach(tile => {
        if (!tile) return;
        pairCounts[tile] = (pairCounts[tile] || 0) + 1;
      });

      // 각 패의 개수가 2개씩이고, 서로 다른 패가 7개여야 함
      for (const [tile, count] of Object.entries(pairCounts)) {
        if (count !== 2) return false;  // 모든 패가 2개씩 있어야 함
        pairs.add(tile);
      }

      return pairs.size === 7;  // 서로 다른 패가 7개여야 함
    };

    if (isChitoitsu()) {
      yaku.push("chitoitsu");
    }

    // 국사무쌍 체크
    const yaochuTiles = ['1m', '9m', '1p', '9p', '1s', '9s', '1z', '2z', '3z', '4z', '5z', '6z', '7z'];
    const hasAllYaochu = yaochuTiles.every(tile => allTiles.includes(tile));
    const hasYaochuPair = yaochuTiles.some(tile => 
      allTiles.filter(t => t === tile).length === 2
    );
    if (hasAllYaochu && hasYaochuPair) {
      yaku.push("kokushimusou");
    }

    // 녹일색 체크 (2s, 3s, 4s, 6s, 8s, 발)
    const isGreenTile = (tile: string) => {
      const validSouzu = ['2s', '3s', '4s', '6s', '8s'];
      const hatsu = '6z';
      return validSouzu.includes(tile) || tile === hatsu;
    };
    if (allTiles.every(isGreenTile)) {
      yaku.push("ryuuiisou");
    }

    // 구련보등 체크
    const isChuurenpoutou = (tiles: string[]) => {
      if (!tiles || !tiles.length) return false;
      
      const suit = tiles[0].slice(-1);
      if (!tiles.every(tile => tile.endsWith(suit)) || suit === 'z') {
        return false;
      }
      const counts: Record<string, number> = {};
      tiles.forEach(tile => {
        const num = tile[0];
        counts[num] = (counts[num] || 0) + 1;
      });
      if ((counts['1'] || 0) < 3 || (counts['9'] || 0) < 3) {
        return false;
      }
      for (let i = 2; i <= 8; i++) {
        if ((counts[i.toString()] || 0) < 1) {
          return false;
        }
      }
      return true;
    };

    const manTiles = allTiles.filter(tile => tile?.endsWith('m'));
    const pinTiles = allTiles.filter(tile => tile?.endsWith('p'));
    const souTiles = allTiles.filter(tile => tile?.endsWith('s'));

    if ((isChuurenpoutou(manTiles) || isChuurenpoutou(pinTiles) || isChuurenpoutou(souTiles)) && isMenzen) {
      yaku.push("chuurenpoutou");
    }
}

