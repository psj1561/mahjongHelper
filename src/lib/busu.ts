import type { WaitingPattern } from "./constants";
import type { TileSet } from "./pesan";

export interface FuDetails {
  base: number;
  tsumoRon: number;
  waiting: number;
  heads: number;
  bodyFu: { type: string; value: string; fu: number }[];
}

export interface BusuResult {
  total: number;
  details: FuDetails;
}

// 요구패(노두패/자패) 체크 함수
const isYaochuTile = (tile: string): boolean => {
  return tile.startsWith('1') || tile.startsWith('9') || tile.endsWith('z');
};

// 부수 계산 함수
export function calculateFu(
  bodyTiles: TileSet[], 
  headTiles: TileSet[], 
  tsumoRon: "tsumo" | "ron",
  waitingPattern: WaitingPattern | undefined,
  seat: "east" | "south" | "west" | "north",
  prevalent: "east" | "south" | "west" | "north"
): BusuResult {
    
  const details: FuDetails = {
    base: 20,
    tsumoRon: 0,
    waiting: 0,
    heads: 0,
    bodyFu: [] as { type: string; value: string; fu: number }[]
  };

  // 화료 방식에 따른 fu 계산
  if (tsumoRon === "tsumo") {
    details.tsumoRon = 2;  // 멘젠 츠모는 2부
  } else {
    // 멘젠 론인 경우에만 10부 추가
    const hasMeldedSets = bodyTiles.some(tile => 
      ["chi", "pong", "kan"].includes(tile.type)
    );
    if (!hasMeldedSets) {
      details.tsumoRon = 10;
    }
  }

  // 대기 형태 부수
  if (waitingPattern === "tanki" || waitingPattern === "kanchan" || waitingPattern === "penchan") {
    details.waiting = 2;
  }

  // 머리 부수
  headTiles.forEach(tile => {
    const value = tile.value.substring(0, 2);
    const windValue = value[0];
    const isWind = value.endsWith('z') && windValue >= "1" && windValue <= "4";

    // 자풍패 체크
    if (isWind && windValue === String({ east: "1", south: "2", west: "3", north: "4" }[seat])) {
      details.heads += 2;
    }
    // 장풍패 체크
    if (isWind && windValue === String({ east: "1", south: "2", west: "3", north: "4" }[prevalent])) {
      details.heads += 2;
    }
    // 삼원패 체크
    if (["5z", "6z", "7z"].includes(value)) {
      details.heads += 2;
    }
  });

  // 몸통 부수
  bodyTiles.forEach(tile => {
    if (tile.type === "triplet") {
      const value = tile.value.substring(0, 2);
      if (isYaochuTile(value)) {
        details.bodyFu.push({ type: "안커(요구패)", value, fu: 8 });
      } else {
        details.bodyFu.push({ type: "안커(중장패)", value, fu: 4 });
      }
    } else if (tile.type === "pong") {
      const value = tile.value.substring(0, 2);
      if (isYaochuTile(value)) {
        details.bodyFu.push({ type: "밍커(요구패)", value, fu: 4 });
      } else {
        details.bodyFu.push({ type: "밍커(중장패)", value, fu: 2 });
      }
    } else if (tile.type === "jakan") {
      const value = tile.value.substring(0, 2);
      if (isYaochuTile(value)) {
        details.bodyFu.push({ type: "안깡(요구패)", value, fu: 32 });
      } else {
        details.bodyFu.push({ type: "안깡(중장패)", value, fu: 16 });
      }
    } else if (tile.type === "kan") {
      const value = tile.value.substring(0, 2);
      if (isYaochuTile(value)) {
        details.bodyFu.push({ type: "밍깡(요구패)", value, fu: 16 });
      } else {
        details.bodyFu.push({ type: "밍깡(중장패)", value, fu: 8 });
      }
    }
  });

  const total = Math.ceil((
    details.base + 
    details.tsumoRon + 
    details.waiting + 
    details.heads + 
    details.bodyFu.reduce((sum, item) => sum + item.fu, 0)
  ) / 10) * 10;

  return { total, details };
}
