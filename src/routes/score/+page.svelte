<script lang="ts">
  import { DIRECTIONS, TILE_ORDER, STATE_LABELS } from "$lib/constants";

  let renchan: number = 0;
  let dora: number = 0;
  let tsumoRon: "tsumo" | "ron" = "tsumo";
  let prevalent: "east" | "south" | "west" | "north" = "east";
  let seat: "east" | "south" | "west" | "north" = "east";

  let selectedTiles: { value: string; type: string }[] = [];
  let isSpeak: "no" | "chi" | "pong" | "kan" | "jakan" = "no"; // 발성 활성화 여부

  let lastSelectedTile: string | null = null; // 마지막으로 고른패 저장

  // 각 상태 여부
  let states: Record<keyof typeof STATE_LABELS, boolean> = {
    riichi: false, // 리치
    db_riichi: false, // 더블리치
    ippatsu: false, // 일발
    chankan: false, // 창깡
    rinshan: false, // 영상개화
    haitei: false, // 해저로월
  };

  // 기능함수 모음

  // 각 상태 토글적용
  const toggleState = (key: keyof typeof states): void => {
    if (key === "riichi" && states.db_riichi) {
      states.db_riichi = false;
    } else if (key === "db_riichi" && states.riichi) {
      states.riichi = false;
    }

    // 리치나 더블리치를 해제할 때 일발도 함께 해제
    if ((key === "riichi" || key === "db_riichi") && states[key]) {
      states.ippatsu = false;
    }

    states[key] = !states[key];
  };

  // 선택된패 개수 계산 함수
  const countTotalTiles = (
    tiles: { value: string; type: string }[]
  ): number => {
    return tiles.reduce((total, tile) => {
      // 깡이나 자깡은 3개로 취급
      if (tile.type === "kan" || tile.type === "jakan") {
        return total + 3;
      }
      return total + tile.value.length / 2;
    }, 0);
  };

  // 패 선택 함수
  const selectTile = (tile: string): void => {
    // 현재 패의 개수 계산
    const currentTotalTiles = countTotalTiles(selectedTiles);

    // 새로 추가될 패의 개수 계산
    const newTilesCount = isSpeak === "no" ? 1 : 3; // 치/퐁/깡/자깡 모두 3개로 카운트

    // 14개 초과 체크
    if (currentTotalTiles + newTilesCount > 14) {
      alert("패는 총 14개를 초과할 수 없습니다.");
      return;
    }

    // 13개 이상일 때는 마지막 패로만 선택 가능
    if (currentTotalTiles >= 13) {
      if (isSpeak !== "no") {
        alert("마지막 패는 단일 패만 선택 가능합니다.");
        return;
      }
      lastSelectedTile = tile;
    }

    // 기존 로직대로 처리
    const tileNum = parseInt(tile[0]);
    const tileType = tile[1];
    let newTile;

    if (isSpeak === "chi") {
      if (tileNum >= 8) {
        // 8이나 9일 경우 7,8,9로 고정
        newTile = {
          value: `7${tileType}8${tileType}9${tileType}`,
          type: "chi",
        };
      } else {
        // 그 외의 경우 기존 로직 유지
        newTile = {
          value: `${tileNum}${tileType}${tileNum + 1}${tileType}${tileNum + 2}${tileType}`,
          type: "chi",
        };
      }
    } else if (isSpeak === "pong") {
      newTile = { value: `${tile}${tile}${tile}`, type: "pong" };
    } else if (isSpeak === "kan") {
      newTile = {
        value: `${tile}${tile}${tile}${tile}`,
        type: "kan",
      };
    } else if (isSpeak === "jakan") {
      newTile = {
        value: `${tile}${tile}${tile}${tile}`,
        type: "jakan",
      };
    } else {
      newTile = { value: tile, type: "no" };
    }

    // 새로운 타일 생성 후 검사
    if (isSpeak === "chi") {
      // 치의 경우 각 구성 타일 모두 체크
      const newTileValues = Array.from(
        { length: newTile.value.length / 2 },
        (_, i) => newTile.value.substring(i * 2, i * 2 + 2)
      );

      for (const tileValue of newTileValues) {
        const existingCount = countSameTiles(tileValue);
        if (existingCount + 1 > 4) {
          alert(`${tileValue} 패는 4개를 초과할 수 없습니다.`);
          return;
        }
      }
    } else {
      // 퐁/깡/단일패의 경우 첫 2바이트만 체크
      const baseTile = newTile.value.substring(0, 2);
      const existingCount = countSameTiles(baseTile);
      const newCount = newTile.value.length / 2; // 새로 추가되는 같은 패의 개수

      if (existingCount + newCount > 4) {
        alert(`${baseTile} 패는 4개를 초과할 수 없습니다.`);
        return;
      }
    }

    console.log(newTile);

    selectedTiles = [...selectedTiles, newTile];
  };

  // 선택된패에서 같은 종류의 패갯수를 확인하는함수
  const countSameTiles = (newTileValue: string): number => {
    // 2바이트씩 분할하여 기본 타일 형태 추출
    const baseTile = newTileValue.substring(0, 2);

    return selectedTiles.reduce((count, tile) => {
      // 각 타일의 2바이트씩 모든 부분을 확인
      const tileValues = Array.from({ length: tile.value.length / 2 }, (_, i) =>
        tile.value.substring(i * 2, i * 2 + 2)
      );
      return count + tileValues.filter((v) => v === baseTile).length;
    }, 0);
  };

  // 패정렬 함수
  const sortedTiles = (): { value: string; type: string }[] => {
    const noTypeTiles = selectedTiles
      .filter((tile) => tile.type === "no")
      .sort((a, b) => {
        // 타일의 첫 번째 문자를 기준으로 알파벳 우선 정렬
        const charA = a.value.slice(-1); // 마지막 문자가 알파벳
        const charB = b.value.slice(-1);

        if (charA !== charB) {
          return charA.localeCompare(charB); // 알파벳 비교
        }

        // 알파벳이 같으면 숫자 비교
        const numA = parseInt(a.value, 10); // 숫자 부분
        const numB = parseInt(b.value, 10);

        return numA - numB;
      });

    const otherTypeTiles = selectedTiles.filter((tile) => tile.type !== "no");

    return [...noTypeTiles, ...otherTypeTiles];
  };

  // 제출 가능 판단
  const isCompleteHand = (): boolean => {
    const totalTiles = countTotalTiles(selectedTiles);
    return totalTiles === 14 && lastSelectedTile !== null;
  };

  // 패 삭제 함수
  const removeTile = (tile: { value: string; type: string }): void => {
    const index = selectedTiles.findIndex((t) => t.value === tile.value);
    if (index !== -1) {
      selectedTiles = [
        ...selectedTiles.slice(0, index),
        ...selectedTiles.slice(index + 1),
      ];
    }
  };

  // 치 모드에서 연속된 패 선택 가능 여부 확인
  const isChiPossible = (tile: string): boolean => {
    const tileNum = parseInt(tile[0]);
    const tileType = tile[1];

    // z패는 치 불가능
    if (tileType === "z") return false;

    // 8, 9는 7,8,9로만 치 가능
    if (tileNum >= 8) {
      const baseTile = `7${tileType}`;
      const currentCount = countSameTiles(baseTile);
      return currentCount < 4;
    }

    // 일반적인 경우: n, n+1, n+2 패가 모두 4개 미만으로 사용되었는지 확인
    const tiles = [tileNum, tileNum + 1, tileNum + 2].map(
      (n) => `${n}${tileType}`
    );
    return tiles.every((t) => countSameTiles(t) < 4);
  };

  // 패선택 활성화
  const isTileSelectable = (tile: string): boolean => {
    if (isSpeak === "chi") {
      return isChiPossible(tile);
    }

    const currentCount = countSameTiles(tile);
    const additionalTiles = isSpeak === "no" ? 1 : isSpeak === "pong" ? 3 : 4;
    return currentCount + additionalTiles <= 4;
  };

  // 멘젠 상태 체크 함수
  const isMenzen = (): boolean => {
    return selectedTiles.every((tile) =>
      ["sequence", "triplet", "jakan", "no"].includes(tile.type)
    );
  };

  // 깡/자깡 존재 여부 체크 함수
  const hasKan = (): boolean => {
    return selectedTiles.some(
      (tile) => tile.type === "kan" || tile.type === "jakan"
    );
  };

  import Modal from "./Modal.svelte";
  let showModal = false;

  function openModal() {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }
</script>

<div id="wrapper">
  <!-- 패선택 -->
  <div class="contentes">
    <div class="toggle-button-group with-border">
      <button
        type="button"
        class="toggle-button {isSpeak === 'chi' ? 'active' : ''}"
        on:click={() => (isSpeak = isSpeak === "chi" ? "no" : "chi")}
      >
        치
      </button>
      <button
        type="button"
        class="toggle-button {isSpeak === 'pong' ? 'active' : ''}"
        on:click={() => (isSpeak = isSpeak === "pong" ? "no" : "pong")}
      >
        퐁
      </button>
      <button
        type="button"
        class="toggle-button {isSpeak === 'kan' ? 'active' : ''}"
        on:click={() => (isSpeak = isSpeak === "kan" ? "no" : "kan")}
      >
        깡
      </button>
      <button
        type="button"
        class="toggle-button {isSpeak === 'jakan' ? 'active' : ''}"
        on:click={() => (isSpeak = isSpeak === "jakan" ? "no" : "jakan")}
      >
        자깡
      </button>
    </div>
    <div id="tile-selection">
      {#each TILE_ORDER as tile, i}
        {#if i % 18 === 0}
          <div style="flex-basis: 100%; height: 0;"></div>
        {/if}
        <button
          type="button"
          class="tile_btn {!isTileSelectable(tile) ? 'disabled' : ''}"
          on:click={() => selectTile(tile)}
          disabled={!isTileSelectable(tile)}
        >
          <img
            src={`/img/${tile}.png`}
            alt={tile}
            data-tile={tile}
            class="tile {!isTileSelectable(tile) ? 'disabled' : ''}"
          />
        </button>
      {/each}
    </div>
  </div>

  <h3>선택된 패:</h3>
  <!-- <div>{selectedTiles.map((tile) => tile.value).join(", ")}</div> -->

  <div id="selected-tiles">
    {#each selectedTiles as tile}
      <div class="selected-tile">
        <button
          type="button"
          class="tile_btn"
          on:click={() => removeTile(tile)}
        >
          {#each Array.from( { length: tile.value.length / 2 }, (_, i) => tile.value.substring(i * 2, i * 2 + 2) ) as tileCode, i}
            <img
              src={tile.type === "jakan" && (i === 1 || i === 2)
                ? "/img/back.png"
                : `/img/${tileCode}.png`}
              alt={tileCode}
              class="tile {i === 0 && ['chi', 'pong', 'kan'].includes(tile.type)
                ? 'rotated'
                : ''}"
            />
          {/each}
        </button>
      </div>
    {/each}
  </div>

  <!-- 상태 선택 -->
  <div class="contentes">
    <table class="settings-table">
      <tbody>
        <tr>
          <td colspan="4">
            <div class="toggle-button-group with-border">
              {#each ["tsumo", "ron"] as option}
                <button
                  class="toggle-button {tsumoRon === option ? 'active' : ''}"
                  on:click={() => (tsumoRon = option as "tsumo" | "ron")}
                >
                  {option === "tsumo" ? "쯔모" : "론"}
                </button>
              {/each}
            </div>
          </td>
        </tr>
        <tr>
          <td>도라</td>
          <td>
            <div class="input-group">
              <button
                type="button"
                class="btn"
                on:click={() => (dora = Math.max(0, dora - 1))}>-</button
              >
              <input type="number" name="dora" value={dora} readonly />
              <button type="button" class="btn" on:click={() => dora++}
                >+</button
              >
            </div>
          </td>
          <td>연장 횟수</td>
          <td>
            <div class="input-group">
              <button
                type="button"
                class="btn"
                on:click={() => (renchan = Math.max(0, renchan - 1))}>-</button
              >
              <input type="number" name="renchan" value={renchan} readonly />
              <button type="button" class="btn" on:click={() => renchan++}
                >+</button
              >
            </div>
          </td>
        </tr>
        <tr>
          <td>장</td>
          <td>
            <div class="toggle-button-group">
              {#each DIRECTIONS as { value, label }}
                <button
                  class="toggle-button {prevalent === value ? 'active' : ''}"
                  on:click={() =>
                    (prevalent = value as "east" | "south" | "west" | "north")}
                >
                  {label}
                </button>
              {/each}
            </div>
          </td>
          <td>자리</td>
          <td>
            <div class="toggle-button-group">
              {#each DIRECTIONS as { value, label }}
                <button
                  class="toggle-button {seat === value ? 'active' : ''}"
                  on:click={() =>
                    (seat = value as "east" | "south" | "west" | "north")}
                >
                  {label}
                </button>
              {/each}
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="4">
            <div class="toggle-button-group">
              {#each Object.entries(states) as [key, value] (key)}
                {@const isRichiRelated = ["riichi", "db_riichi"].includes(key)}
                {@const isIppatsu = key === "ippatsu"}
                {@const isChankan = key === "chankan"}
                {@const isRinshan = key === "rinshan"}
                <button
                  type="button"
                  class="toggle-button {value ? 'active' : ''}"
                  disabled={(isRichiRelated && !isMenzen()) ||
                    (isIppatsu && !isMenzen()) ||
                    (isIppatsu && !states.riichi && !states.db_riichi) ||
                    (isChankan && tsumoRon !== "ron") ||
                    (isRinshan && (tsumoRon !== "tsumo" || !hasKan()))}
                  on:click={() => toggleState(key as keyof typeof states)}
                >
                  {STATE_LABELS[key as keyof typeof STATE_LABELS]}
                </button>
              {/each}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 제출 버튼 -->
  <button
    type="button"
    class="submit-btn"
    on:click={openModal}
    disabled={!isCompleteHand()}
  >
    제출
  </button>
</div>

<Modal
  show={showModal}
  onClose={closeModal}
  selectedTiles={sortedTiles()}
  {dora}
  {tsumoRon}
  {prevalent}
  {seat}
  {states}
  {lastSelectedTile}
>
  <!-- You can add additional content here if needed -->
</Modal>
