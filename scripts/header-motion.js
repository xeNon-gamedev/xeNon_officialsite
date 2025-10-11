// 操作したい要素を正しく取得する
const header = document.querySelector('.site-header');
const toggleButton = document.querySelector('.site-header__toggle');

// ハンバーガーボタンがクリックされたときの処理
toggleButton.addEventListener('click', () => {
  // <header> タグに対して .is-menu-open クラスを付け外しする
  header.classList.toggle('is-menu-open');

  // a11y対応: aria-expanded属性の状態を切り替える
  // is-menu-openクラスを持っているか確認
  const isMenuOpen = header.classList.contains('is-menu-open');
  // 状態に合わせてaria-expandedの値を true/false に設定
  toggleButton.setAttribute('aria-expanded', isMenuOpen);
});
