<script>
  // 필요한 스크립트 작성
</script>

<svelte:head>
  <!-- 페이지 공통 메타데이터 -->
  <title>리치마작 점수계산기</title>
  <meta name="description" content="This is my SvelteKit app" />
  <link rel="stylesheet" href="/style.css" />
</svelte:head>

<div id="wrapper">
  <header id="header">
    <div id="top-nav">
      <ul>
        <li><a href="/">TOP</a></li>
        <li><a href="/scorerule">점수계산표</a></li>
        <li><a href="/score">점수계산</a></li>
      </ul>
    </div>
  </header>

  <div id="content">
    <!-- 하위 페이지의 내용이 이곳에 렌더링 -->
    <slot />
  </div>

  <footer id="footer"></footer>
</div>
