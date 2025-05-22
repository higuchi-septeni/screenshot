// scroll-screenshot.js
const { chromium } = require("playwright");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

const TARGET_URL = "https://example.com";
const OUTPUT_DIR = "./output";
const INITIAL_DELAY = 2000; // 初期ロード待ちミリ秒数
const SCROLL_DELAY = 10; // スクロール後待ちミリ秒数
const VIEWPORT_WIDTH = 1280; // ビューポートの幅
const VIEWPORT_HEIGHT = 4000; // ビューポートの高さ
const CAPTURE_HEIGHT = 2000; // 先のページまでスクロールしないとアニメーションが完了しない場合にCAPTURE_HEIGHT<VIEWPORT_HEIGHTに設定
const OVERLAP_RATE_PCT = 3; // オーバーラップ率(%)

// 出力ディレクトリの作成
async function ensureOutputDir() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

// 画像をPDFに変換
async function convertImagesToPDF(imagePaths, outputPath) {
  const pdfDoc = await PDFDocument.create();

  for (const imagePath of imagePaths) {
    // 画像を読み込んでPNGに変換
    const imageBuffer = await fs.readFile(imagePath);
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();

    // PNGをPDFに埋め込み
    const image = await pdfDoc.embedPng(pngBuffer);
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  // PDFを保存
  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
}

(async () => {
  await ensureOutputDir();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // ビューポートサイズを設定
  await page.setViewportSize({
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
  });

  await page.goto(TARGET_URL); // 任意のURLに変更
  await page.waitForTimeout(INITIAL_DELAY); // 初期アニメーション待ち

  // オーバーラップを設定（画像の継続性を確保するため）
  const overlap = Math.floor(CAPTURE_HEIGHT * (OVERLAP_RATE_PCT / 100));
  const scrollStep = CAPTURE_HEIGHT - overlap;

  const totalHeight = await page.evaluate(() => {
    return document.body.scrollHeight;
  });

  let scrollPosition = 0;
  let index = 0;
  const imagePaths = [];

  while (scrollPosition < totalHeight) {
    // スクロール位置へ移動
    await page.evaluate((y) => window.scrollTo(0, y), scrollPosition);

    // アニメーション待ち
    await page.waitForTimeout(SCROLL_DELAY);

    // 2桁でゼロパディング
    const paddedIndex = String(index).padStart(2, "0");
    const imagePath = path.join(
      OUTPUT_DIR,
      `screenshot-part-${paddedIndex}.png`
    );
    imagePaths.push(imagePath);

    // キャプチャ（ビューポートの上部の一部だけをキャプチャ）
    await page.screenshot({
      path: imagePath,
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: VIEWPORT_WIDTH,
        height: CAPTURE_HEIGHT,
      },
    });

    scrollPosition += scrollStep;
    index++;
  }

  // 最後にビューポートの未キャプチャ領域があれば取得
  let i = 1;
  while (i * CAPTURE_HEIGHT < VIEWPORT_HEIGHT) {
    // ビューポートの下部部分をキャプチャ

    // 2桁でゼロパディング
    const paddedIndex = String(index).padStart(2, "0");
    const imagePath = path.join(
      OUTPUT_DIR,
      `screenshot-part-${paddedIndex}.png`
    );
    imagePaths.push(imagePath);

    await page.screenshot({
      path: imagePath,
      fullPage: false,
      clip: {
        x: 0,
        y: i * CAPTURE_HEIGHT,
        width: VIEWPORT_WIDTH,
        height: CAPTURE_HEIGHT,
      },
    });
    i++;
    index++;
  }

  await browser.close();

  // 画像をPDFに変換
  await convertImagesToPDF(imagePaths, path.join(OUTPUT_DIR, "output.pdf"));
})();
