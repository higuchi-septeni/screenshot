# スクロールスクリーンショットツール

Webページをスクロールしながらスクリーンショットを撮影し、それらを1つのPDFファイルに結合するツールです。

## 機能

- 指定したURLのWebページをスクロールしながらスクリーンショットを撮影
- スクリーンショットを自動的にPDFファイルに結合
- カスタマイズ可能なビューポートサイズとディレイ設定
- オーバーラップ機能による連続的なキャプチャ

## 必要条件

- Node.js
- npm または yarn

## インストール

```bash
# 依存パッケージのインストール
npm install
# または
yarn install
```

## 使用方法

1. `screenshot.js`の設定を必要に応じて変更します
2. スクリプトを実行します：

```bash
node screenshot.js
```

## 設定オプション

`screenshot.js`の先頭で以下の設定を変更できます：

```javascript
const TARGET_URL = "https://example.com"; // スクリーンショットを撮影するURL
const OUTPUT_DIR = "./output"; // 出力ディレクトリ
const INITIAL_DELAY = 2000; // 初期ロード待ちミリ秒数
const SCROLL_DELAY = 10; // スクロール後待ちミリ秒数
const VIEWPORT_WIDTH = 1280; // ビューポートの幅
const VIEWPORT_HEIGHT = 4000; // ビューポートの高さ
const CAPTURE_HEIGHT = 2000; // キャプチャする高さ
const OVERLAP_RATE_PCT = 3; // オーバーラップ率(%)
```

### 設定の説明

- `TARGET_URL`: スクリーンショットを撮影するWebページのURL
- `OUTPUT_DIR`: スクリーンショットとPDFファイルの出力先ディレクトリ
- `INITIAL_DELAY`: ページ読み込み後の待機時間（ミリ秒）
- `SCROLL_DELAY`: スクロール後の待機時間（ミリ秒）
- `VIEWPORT_WIDTH`: ブラウザのビューポートの幅（ピクセル）
- `VIEWPORT_HEIGHT`: ブラウザのビューポートの高さ（ピクセル）
- `CAPTURE_HEIGHT`: 1回のスクリーンショットでキャプチャする高さ（ピクセル）
- `OVERLAP_RATE_PCT`: スクリーンショット間のオーバーラップ率（パーセント）

## 出力

- スクリーンショット: `output/screenshot-part-XX.png`（XXは連番）
- PDFファイル: `output/output.pdf`

## 注意事項

- 動的なコンテンツやアニメーションがある場合は、`SCROLL_DELAY`を適切に設定してください
- ページの高さが大きい場合は、`VIEWPORT_HEIGHT`と`CAPTURE_HEIGHT`のバランスを考慮してください
- オーバーラップ率は、スクリーンショット間の継続性を確保するために使用されます 