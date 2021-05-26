# Buzz Stock .com

## サイト概要

[サイト](https://buzz-stock.com/)<br>
株で繋がる SNS
株式チャートの確認・銘柄に関するユーザーのつぶやきを見ることができる情報ハブ

### サイトテーマ

現状、Yahoo ファイナンスや twitter に分散しているネット投資家の情報スペースの統合を目指す、モダンな UI デザインの総合株式情報 SNS

### テーマを選んだ理由

株式の値動きを確認するサイト（証券サイト・yahoo ファイナンスなど）とそれらの投資家のリアクションを見る SNS（twitter など）が現状、分離しており、それらを統合したプラットフォームをつくれば、より市場のダイナミクスを感じられるような情報空間が出来るのではないかと思った。

### ターゲットユーザ

ネットで株式・仮想通貨取引などを行っている個人投資家

### 主な利用シーン

ウォッチリストの株式市場の値動きを一括で確認したいとき
フォローしている株式に対する情報をストリームで見ることができるので、こまぎれの隙間時間などの情報収集時

## 設計書

[API 設計](https://docs.google.com/spreadsheets/d/1nVxSBZcZD90IaEu8aTSGJ7LG71RndOzKpVPTrfhpWCo/edit)
<br>
<br>
サービス構成図
<br>
![stock-graph](https://user-images.githubusercontent.com/24717695/119268484-347c2200-bc2e-11eb-93bf-741c8f756f01.jpg)

## チャレンジ要素一覧

[機能一覧](https://docs.google.com/spreadsheets/d/1CKBFeNrOqsrLOffS6QvcRCTWcm7kYWbaGxoShlwGPnY/edit#gid=0)

## 開発環境

- OS：macOS (Big Sur)
- 言語：SCSS,JavaScript,JSX,TypeScript
- フレームワーク：Next.js, Nest.js
- JS ライブラリ：[react-stockcharts](https://github.com/rrag/react-stockcharts)
- IDE：Visual Studio Code
- 外部 API Yahoo Finance APi

## 使用素材

- Flaticon
