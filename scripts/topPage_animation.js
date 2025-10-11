document.addEventListener('DOMContentLoaded', () => {
  // アニメーションの初期化だけを行う
  initReveal();
});

/**
 * スクロールに応じた表示アニメーションを初期化する関数
 */
function initReveal() {
  // IntersectionObserverをサポートしているかチェック
  const supportsObserver = 'IntersectionObserver' in window;
  if (!supportsObserver) {
    // サポートしていないブラウザでは、すべてのアニメーション要素を最初から表示する
    document.querySelectorAll('[data-animate]').forEach((el) => {
      el.classList.add('is-visible');
    });
    // 何も監視しないダミーの関数を返す
    return {
      observe: () => { /* noop */ },
    };
  }

  // 要素が画面に入ったかを監視するオブザーバーを作成
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // 要素が画面内に入ったら
      if (entry.isIntersecting) {
        // is-visibleクラスを追加してアニメーションを発火
        entry.target.classList.add('is-visible');
        // 一度表示したら、もう監視しない
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -10%', // 画面の下10%くらいに入ったら発火
    threshold: 0.2, // 要素が20%見えたら発火
  });

  // 指定された要素（デフォルトはページ全体）の中からアニメーション対象を探して監視する関数
  const observe = (scope = document) => {
    scope.querySelectorAll('[data-animate]').forEach((element) => {
      // すでに監視済みの場合は何もしない
      if (element.dataset.animateBound === 'true') {
        return;
      }
      element.dataset.animateBound = 'true'; // 監視済みフラグを立てる
      observer.observe(element); // 監視を開始
    });
  };

  // ページ読み込み時に、ページ全体を対象に監視を開始
  observe(document);

  // 他の場所からでも監視を追加できるように、observe関数を返す
  return { observe };
}
