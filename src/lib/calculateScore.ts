import { SCORE_TABLE } from "./constants";

export function calculateScore(
  han: number,
  fu: number,
  isTsumo: boolean,
  isDealer: boolean
): {
  base: number;
  tsumo?: { dealer: number; other: number };
} {
  // 부수 올림 처리
  fu = Math.ceil(fu / 10) * 10;
  if (fu < 20) fu = 20;
  if (fu > 110) fu = 110;

  // 특수한 경우 처리 (만관 이상)
  if (han >= 13) {han = 13; fu = 20;}
  else if (han >= 11) {han = 11; fu = 20;}
  else if (han >= 8) {han = 8; fu = 20;}
  else if (han >= 6) {han = 6; fu = 20;}
  else if (han >= 5) {han = 5; fu = 20;}

  const score = SCORE_TABLE[han]?.[fu];
  if (!score) return { base: 0 };

  const playerScore = isDealer ? score.dealer : score.other;

  if (isTsumo) {
    return {
      base: playerScore.base,
      tsumo: {
        dealer: playerScore.tsumo.dealer,
        other: playerScore.tsumo.other
      }
    };
  }
  return { base: playerScore.base };
}
