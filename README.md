# 主要用來存放REACT的學習資源和一些小專案

## [簡易計算機](./simple-calculator/)
* 目前進度 : css還沒有寫完

原本主要是想試著用Redux寫，但寫著就發現很多問題如 **複數值相乘(111x777) 、 負數相減(-1--1) 、 x / % 優先權 、 + - x / %數值混合運算**，

前兩個問題我是用 **regExp解決**；

_數值混合運算_ : 先看運算式有無 x / %，有優先運算沒有就接著傳遞給下個函數做 + - 運算，若只有x / 運算完回傳regExp的第一個值。

_優先權_ : 我是用 indexOf 先找出各個 x / % 位置，%一定要優先於 x / 轉換，之後再來比較 x / 位置先出現的優先算；

## [實作考試題](./employee-test/)
這是我在面試一家公司出的題目，主要需求是從 **網絡請求數據**，並顯示在表格中，必須要可以 **新增行數(row)**，要可以提交到後端並響應status 200 和接收到數據，雖然沒有要求 **可以刪除** 行但我還是有做。

## [井字遊戲](./tic_tac_toe/)
用來練習useEffect，在cell狀態改變後檢查輸贏或平手

## [查詢天氣工具](./simple-weatherapp/) 
主要用來練習 **axios** 的用法，用來請求OpenWeather API並回傳每三小時的天氣狀況。

## [簡易表單](./useform-example/)
主要用來練習useForm hook，讓製作表單提交、驗證等等變簡單，這是簡易的表單和範例有包含一個簡易後端，用來看提交後的狀況。

## [遊戲計數工具](./maplestory-starcount/)
算是我的第一個小專案，用來計算遊戲內裝備的強化花費，簡單的數值運算。