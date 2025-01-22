<script lang="ts">
  import { analyzePesan } from "$lib/pesan";
  import { calculateFu } from "$lib/busu";
  import { analyzeYaku } from "$lib/yaku";
  import { YAKU_VALUES } from "$lib/constants";
  import { calculateScore } from "$lib/calculateScore";

  export let show = false;
  export let onClose: () => void;
  export let selectedTiles: { value: string; type: string }[] = [];
  export let dora: number;
  export let tsumoRon: "tsumo" | "ron";
  export let prevalent: "east" | "south" | "west" | "north";
  export let seat: "east" | "south" | "west" | "north";
  export let states: Record<string, boolean>;
  export let lastSelectedTile: string | null = null;

  // 패산분석
  $: pesanResult = analyzePesan(selectedTiles, lastSelectedTile);
  // 부수분석
  $: busuResult = calculateFu(
    pesanResult.bodyTiles,
    pesanResult.headTiles,
    tsumoRon,
    pesanResult.waitingPattern,
    seat,
    prevalent
  );
  // 역분석
  $: yakuResult = analyzeYaku({
    bodyTiles: pesanResult.bodyTiles,
    headTiles: pesanResult.headTiles,
    lastSelectedTile: lastSelectedTile || "",
    dora,
    tsumoRon,
    prevalent,
    seat,
    states,
    waitingPattern: pesanResult.waitingPattern,
  });

  $: isDealer = seat === "east"; // 오야 여부
  // 점수계산
  $: scoreResult = calculateScore(
    yakuResult.total,
    busuResult.total,
    tsumoRon === "tsumo",
    isDealer
  );
  $: displayScore = !pesanResult.isValid
    ? "화료 불가"
    : yakuResult.yaku.includes("noYaku")
      ? "역 없음"
      : tsumoRon === "tsumo"
        ? isDealer
          ? `${scoreResult.tsumo?.other.toLocaleString()}점 ALL`
          : `${scoreResult.tsumo?.dealer.toLocaleString()}/${scoreResult.tsumo?.other.toLocaleString()}점`
        : `${scoreResult.base.toLocaleString()}점`;
</script>

{#if show}
  <div
    class="modal-overlay"
    on:click={onClose}
    on:keydown={(e) => e.key === "Escape" && onClose()}
    role="button"
    tabindex="0"
  >
    <div class="modal-content" role="dialog" tabindex="-1" aria-modal="true">
      <h2>{tsumoRon === "tsumo" ? "쯔모" : "론"}</h2>

      <h3>완성된 패</h3>
      <div id="selected-tiles">
        {#each [...pesanResult.bodyTiles, ...pesanResult.headTiles] as tile}
          <div class="selected-tile">
            <div class="tile_btn">
              {#each Array.from( { length: tile.value.length / 2 }, (_, i) => tile.value.substring(i * 2, i * 2 + 2) ) as tileCode, i}
                <img
                  src={tile.type === "jakan" && (i === 1 || i === 2)
                    ? "/img/back.png"
                    : `/img/${tileCode}.png`}
                  alt={tileCode}
                  class="tile {i === 0 &&
                  ['chi', 'pong', 'kan'].includes(tile.type)
                    ? 'rotated'
                    : ''}"
                />
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <div class="score-line">
        {#if !pesanResult.isValid || yakuResult.yaku.includes("noYaku")}
          <span class="score-value">{displayScore}</span>
        {:else}
          <span>{yakuResult.total}판 / {busuResult.total}부</span>
          <span class="score-value">{displayScore}</span>
        {/if}
      </div>

      {#if !(!pesanResult.isValid || yakuResult.yaku.includes("noYaku"))}
        <h3>역 목록</h3>
        <ul>
          {#each yakuResult.yaku as y}
            {#if y.startsWith("dora")}
              <li>도라 ({y.slice(4)}판)</li>
            {:else}
              <li>{YAKU_VALUES[y].name} ({YAKU_VALUES[y].han}판)</li>
            {/if}
          {/each}
        </ul>

        <h3>부수</h3>
        <div class="fu-details">
          <ul>
            <li>기본: {busuResult.details.base}부</li>
            {#if busuResult.details.tsumoRon > 0 && !yakuResult.yaku.includes("pinfu")}
              <li>
                {tsumoRon === "tsumo" ? "쯔모" : "론"}: {busuResult.details
                  .tsumoRon}부
              </li>
            {/if}
            {#if busuResult.details.waiting > 0}
              <li>
                {#if pesanResult.waitingPattern === "tanki"}
                  단기대기: +{busuResult.details.waiting}부
                {:else if pesanResult.waitingPattern === "kanchan"}
                  간짱대기: +{busuResult.details.waiting}부
                {:else if pesanResult.waitingPattern === "penchan"}
                  변짱대기: +{busuResult.details.waiting}부
                {/if}
              </li>
            {/if}
            {#if busuResult.details.heads > 0}
              <li>머리: +{busuResult.details.heads}부</li>
            {/if}
            {#each busuResult.details.bodyFu as { type, value, fu }}
              <li>{type}({value}): +{fu}부</li>
            {/each}
          </ul>
        </div>
      {/if}

      <button type="button" on:click={onClose}>닫기</button>
    </div>
  </div>
{/if}

<style>
  .score-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0;
  }

  .score-value {
    font-weight: bold;
    color: #e33;
    font-size: 1.2em;
    text-align: right;
  }
</style>
