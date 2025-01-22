import type { WaitingPattern } from "./constants";


export interface TileSet {
  value: string;
  type: string;
}

export interface TileAnalysis {
  bodyTiles: TileSet[];
  headTiles: TileSet[];
  waitingPattern?: WaitingPattern;
  isValid: boolean;
}

export function analyzePesan(
  selectedTiles: TileSet[], 
  lastSelectedTile: string | null
): TileAnalysis {
  const bodyTiles: TileSet[] = [];
  const headTiles: TileSet[] = [];
  
  // 이미 선언된 몸통(치/퐁/깡) 먼저 처리
  const declaredSets = selectedTiles.filter(tile => 
    ["chi", "pong", "kan", "jakan"].includes(tile.type)
  );
  bodyTiles.push(...declaredSets);

  // 나머지 일반 패들 처리
  const normalTiles = selectedTiles
    .filter(tile => tile.type === "no")
    .map(tile => tile.value);

  // 일반 패들의 조합 분석
  const { bodies, heads } = identifyHeadAndBody(normalTiles);

  // 찾은 몸통을 bodyTiles에 추가
  bodies.forEach(body => {
    if (Array.isArray(body)) {
      if (body[0] === body[1]) {
        bodyTiles.push({
          value: body.join(''),
          type: 'triplet'
        });
      } else {
        bodyTiles.push({
          value: body.join(''),
          type: 'sequence'
        });
      }
    }
  });

  // 찾은 머리를 headTiles에 추가
  heads.forEach(head => {
    headTiles.push({
      value: `${head}${head}`,
      type: 'pair'
    });
  });

  // 화료 조건 체크: 몸통 4개와 머리 1개가 있어야 함
  if (bodyTiles.length !== 4 || headTiles.length !== 1) {
    return {
      bodyTiles: [],
      headTiles: [],
      waitingPattern: undefined,
      isValid: false
    };
  }

  const waitingPattern = analyzeWaitingPattern(bodyTiles, headTiles, lastSelectedTile);

  return { 
    bodyTiles, 
    headTiles, 
    waitingPattern,
    isValid: true 
  };
}

function identifyHeadAndBody(tiles: string[]): { bodies: string[][]; heads: string[] } {
  const bodies: string[][] = [];
  const heads: string[] = [];
  const tileCount: { [key: string]: number } = {};

  // 타일 개수 세기
  tiles.forEach(tile => {
    tileCount[tile] = (tileCount[tile] || 0) + 1;
  });

  // 같은 패 3개 찾기
  Object.entries(tileCount).forEach(([tile, count]) => {
    while (count >= 3) {
      bodies.push([tile, tile, tile]);
      tileCount[tile] -= 3;
      count = tileCount[tile];
    }
  });

  // 연속된 패 찾기 (m, p, s 각각)
  ['m', 'p', 's'].forEach(type => {
    for (let i = 1; i <= 7; i++) {
      const sequence = [i, i + 1, i + 2].map(n => `${n}${type}`);
      while (sequence.every(tile => (tileCount[tile] || 0) > 0)) {
        bodies.push(sequence);
        sequence.forEach(tile => tileCount[tile]--);
      }
    }
  });

  // 남은 패에서 머리 찾기
  Object.entries(tileCount).forEach(([tile, count]) => {
    if (count === 2) {
      heads.push(tile);
      tileCount[tile] -= 2;
    }
  });

  return { bodies, heads };
}

function analyzeWaitingPattern(bodyTiles: TileSet[], headTiles: TileSet[], lastTile: string | null): WaitingPattern | undefined {
  if (!lastTile) return undefined;

  // 샤보 체크 ( 개의 대기 패가 있는 경우)
  const pairCount = bodyTiles.filter(tile => 
    (tile.type === "triplet" || tile.type === "pong") && 
    tile.value.substring(0, 2) === lastTile
  ).length;
  if (pairCount >= 1) return "shanpon";

  // 단기 체크 (머리에서 대기)
  const isPair = headTiles.some(tile => 
    tile.type === "pair" && tile.value.includes(lastTile)
  );
  if (isPair) return "tanki";

  // 슌쯔에서 대기
  const sequence = bodyTiles.find(tile => 
    (tile.type === "sequence" || tile.type === "chi") && 
    tile.value.includes(lastTile)
  );
  
  if (sequence) {
    const tileNum = parseInt(lastTile[0]);
    const tileType = lastTile[1];
    const seqStart = parseInt(sequence.value[0]);
    
    // 변찬 체크 (1-2-3의 3대기나 7-8-9의 7대기)
    if ((seqStart === 1 && tileNum === 3) || 
        (seqStart === 7 && tileNum === 7)) {
      return "penchan";
    }
    
    // 간찬 체크 (중간 대기)
    if (tileNum === seqStart + 1) {
      return "kanchan";
    }
    
    // 양면 체크
    return "ryanmen";
  }

  return undefined;
} 