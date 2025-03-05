import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import React, { useRef, useState } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";

//該child componet渲染每三小時的天氣資訊
function EachweatherInfo({ animate, weatherforthreeHours }) {
  const alltimeweather = weatherforthreeHours.map((weather, index) => (
    <div className={`detailsInfo ${animate ? "animate" : ""}`} key={index}>
      <h3>{weather.description_weather}</h3>
      <div>
        {weather.temp_min}&#8451;<span>-</span>
        {weather.temp_max}&#8451;
      </div>
      <h3>{weather.date_time}</h3>
    </div>
  ));
  return <div className="displayInfo">{alltimeweather}</div>;
}

function App() {
  const [inputcity, setInputcity] = useState("");
  const [savedValue, setSavedValue] = useState("");
  const [weatherforthreeHours, setWeatherforthreeHours] = useState([]);
  // const [child_layout, setChild_layout] = useState(false);
  const [animate, setAnimate] = useState(false);
  const typeLayout = useRef(null);

  const geocodingAPICall = `http://api.openweathermap.org/geo/1.0/direct`;
  const weatherCall = `https://api.openweathermap.org/data/2.5/forecast?`; 

  // 只有當輸入框有內容才執行 GetWeather() 函數
/*     useEffect(() => {
    async function GetWeather() {
      const geocodingAPICall = `http://api.openweathermap.org/geo/1.0/direct`;
      //const weatherCall = `https://api.openweathermap.org/data/2.5/weather`;  //此API呼叫為當前天氣狀態(資訊較為詳細)
      const weatherCall = `https://api.openweathermap.org/data/2.5/forecast?`; //此API為預測每三小時的天氣狀態
      try {

        // 第一次API請求，獲取經緯度的資訊。
        const coordinates = await axios.get(geocodingAPICall, {
          params: {
            q: inputcity,
            limit: 5,
            appid: process.env.REACT_APP_WEATHER_API_KEY,
          },
        });

        const cityslatandlon = {
          lat: coordinates.data[0].lat,
          lon: coordinates.data[0].lon,
        };

        // 第二次API請求，獲取天氣資訊
        const responseWeather = await axios.get(weatherCall, {
          params: {
            lat: cityslatandlon.lat,
            lon: cityslatandlon.lon,
            //exclude: "hourly,daily",
            lang: "zh_tw",
            appid: process.env.REACT_APP_WEATHER_API_KEY,
            units: "metric",
          },
        });


        // 過濾獲取的天氣預測資訊，只抓取最低溫度、最高溫度、天氣狀況(如: 小雨、豪雨...)和一天中的每三小時的整點時間
        // 一筆資料只會是一個整點時間(如: 9:00)的預測，只抓18小時也就是6筆資料。
        // 並推入stageweatherInfo[]，用來更新weatherforthreeHours的陣列，往後用方便用map reander。
        const stageweatherInfo = [];
        for (let i = 0; i <= 5; i++) {
          stageweatherInfo.push({
            temp_min: responseWeather.data.list[i].main.temp_min,
            temp_max: responseWeather.data.list[i].main.temp_max,
            description_weather:
              responseWeather.data.list[i].weather[0].description,
            date_time: responseWeather.data.list[i].dt_txt,
          });
        }
        setWeatherforthreeHours(stageweatherInfo);
      } catch (error) {
        console.log(error);
      }
    }
    if (inputcity.trim() !== "") {
      GetWeather();
    }
  }, [inputcity]); */

  const handeleWeatherupdate = async () => {

    //當點擊，向OpenWeatherAPI請求天氣數據
    try {

      // 第一次API請求，獲取經緯度的資訊。
      const coordinates = await axios.get(geocodingAPICall, {
        params: {
          q: inputcity,
          limit: 5,
          appid: process.env.REACT_APP_WEATHER_API_KEY,
        },
      });

      const cityslatandlon = {
        lat: coordinates.data[0].lat,
        lon: coordinates.data[0].lon,
      };

      // 第二次API請求，獲取天氣資訊
      const responseWeather = await axios.get(weatherCall, {
        params: {
          lat: cityslatandlon.lat,
          lon: cityslatandlon.lon,
          //exclude: "hourly,daily",
          lang: "zh_tw",
          appid: process.env.REACT_APP_WEATHER_API_KEY,
          units: "metric",
        },
      });


      // 過濾獲取的天氣預測資訊，只抓取最低溫度、最高溫度、天氣狀況(如: 小雨、豪雨...)和一天中的每三小時的整點時間
      // 一筆資料只會是一個整點時間(如: 9:00)的預測，只抓18小時也就是6筆資料。
      // 並推入stageweatherInfo[]，用來更新weatherforthreeHours的陣列，往後用方便用map reander。
      const stageweatherInfo = [];
      for (let i = 0; i <= 5; i++) {
        stageweatherInfo.push({
          temp_min: responseWeather.data.list[i].main.temp_min,
          temp_max: responseWeather.data.list[i].main.temp_max,
          description_weather:
            responseWeather.data.list[i].weather[0].description,
          date_time: responseWeather.data.list[i].dt_txt,
        });
      }
      setWeatherforthreeHours(stageweatherInfo);
    } catch (error) {
      console.log(error);
    }

    //每一次點擊重置Animate的狀態
    setAnimate(true);
    setTimeout(() => setAnimate(false), 2000);

    setSavedValue(inputcity);

    if (savedValue.trim() !== "") {
      typeLayout.current.style.transform = "translateY(-30px)";
      document.querySelector(".displayInfo").style.display = "flex";
    }
    // else {
    //   document.querySelector(".layouttitle").innerHTML = "Weather App";
    // }
  };

  return (
    <div className="container">
      <div
        className="typeLayout"
        ref={typeLayout}
        style={{ transition: "transform 0.4s ease-in-out" }}
      >
        <h2 className="layouttitle">
          {savedValue === "" ? "Weather App" : `${savedValue}的天氣`}
        </h2>
        <div className="sendcoord">
          <label htmlFor="sendcoord">
            <FontAwesomeIcon
              icon="fa-solid fa-cloud-moon-rain"
              size="2xl"
              className="fontAwesomeStyle"
            />
          </label>
          <input
            id="sendcoord"
            placeholder="請輸入城市名稱"
            onChange={(e) => setInputcity(e.target.value)}
            required
          />
          <button onClick={handeleWeatherupdate}>查詢</button>
        </div>
      </div>
      <EachweatherInfo
        animate={animate}
        weatherforthreeHours={weatherforthreeHours}
      />
    </div>
  );
}

export default App;
library.add(fas);
