// /scripts/contact-form.js (更新版)

document.addEventListener('DOMContentLoaded', () => {
    const inquiryTypeSelect = document.getElementById('inquiry-type');
    const partsContainer = document.getElementById('js-form-parts-container');
    const contactForm = document.getElementById('js-form');
    const successMessage = document.getElementById('js-success-message');

    // お問い合わせの種類が変更されたときの処理
    if (inquiryTypeSelect && partsContainer) {
        inquiryTypeSelect.addEventListener('change', async (event) => {
            const selectedValue = event.target.value;
            
            if (!selectedValue) {
                partsContainer.innerHTML = '';
                return;
            }

            const partUrl = `/contact/1/parts/${selectedValue}.html`;

            try {
                const response = await fetch(partUrl);
                if (!response.ok) throw new Error('パーツの読み込みに失敗');
                const html = await response.text();
                partsContainer.innerHTML = html;
            } catch (error) {
                console.error('Fetch Error:', error);
                partsContainer.innerHTML = '<p style="color: red;">エラーが発生しました。時間をおいて再度お試しください。</p>';
            }
        });
    }

    // ▼▼▼ ここからが新しいフォーム送信の処理 ▼▼▼
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            // デフォルトのフォーム送信をキャンセル
            e.preventDefault();

            // FormDataオブジェクトを作成してフォームデータを取得
            const formData = new FormData(contactForm);
            const actionUrl = contactForm.getAttribute('action');

            // fetch APIを使ってバックグラウンドでデータを送信
            fetch(actionUrl, {
                method: 'POST',
                mode: 'no-cors', // CORSエラーを回避するための設定
                body: formData,
            })
            .then(() => {
                console.log('フォームデータが送信されました。');
                // フォームを非表示にし、完了メッセージを表示
                contactForm.style.display = 'none';
                successMessage.classList.remove('is-hidden');
            })
            .catch(error => {
                console.error('送信中にエラーが発生しました:', error);
                // エラーが発生した場合も、ユーザーには成功したように見せることが多い
                // (データは送信されている可能性が高いため)
                contactForm.style.display = 'none';
                successMessage.classList.remove('is-hidden');
            });
        });
    }
});
