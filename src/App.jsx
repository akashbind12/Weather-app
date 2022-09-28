import { useState } from 'react'
import './App.css';
import React from "react";
import { FiSearch } from 'react-icons/fi';
import { ImLocation } from 'react-icons/im';
import { Input, InputGroup, InputRightElement, InputLeftElement } from '@chakra-ui/react'
import axios from "axios"
import { useEffect } from 'react';
import { Chart } from './Components/chart';

function App() {
  const [city, setCity] = useState("delhi")
  const [data, setData] = useState([])
  const [days, setDays] = useState([])
  const [weekdata, setWeekData] = useState([])
  const [p, setP] = useState(1000)
  const [h, setU] = useState("80%")
  const [t, setT] = useState(26)
  const [icon, setIcon] = useState("10d")
  const [chart, setChart] = useState([])
  const [filtercity, setFilterCity] = useState([]);
  const [sunrise, setSunrise] = useState("")
  const [sunset, setSet] = useState("")
  const key = "69c1b91b85c4012b9c77fc8025524a5f";

  useEffect(() => {
    UserLocation()
  }, [])
  
  useEffect(() => {
    fetchdata()
  },[filtercity])


  const UserLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${key}`)
      .then((res) => {
      // console.log("res :",res.data)
      setCity(res.data.name)
      fetchdata()
    }).catch((err) => console.log(err))
    })
  }

  
  const ConvertInTime = (dt) => {
    const milliseconds = dt * 1000;
    const date = new Date(milliseconds)
    const day = date.toLocaleString("en-US", { timeZone: "UTC" })
    const time = day.split(",")[1]
    return time
  }

  const fetchdata = () => {
    console.log(city)
    axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&cnt=7&appid=${key}&units=metric`)
      .then((data) => {
        console.log("citydata :", data.data)
        console.log(data.data.city.sunrise)
        console.log(data.data.city.sunset)
        setSunrise(ConvertInTime(data.data.city.sunrise))
        setSet(ConvertInTime(data.data.city.sunset))
        setData(data.data)
        setP(data.data.list[0].main.pressure)
        setU(data.data.list[0].main.humidity)
        setT(data.data.list[0].main.temp)
        setIcon(data.data.list[0].weather[0].icon)
        console.log("icon :",data.data.list[0].weather[0].icon)
        getdata(data.data.city.coord.lat, data.data.city.coord.lon, data.data.cnt)
    }).catch((err) => console.log(err))
  }

  const getdata = (lat,lon,cnt) => {
    axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${key}&units=metric`)
      .then((data) => {
      console.log
      console.log(data.data.hourly.slice(0, 25))
      let a = data.data.hourly.slice(0, 25)
      let c = []
      for (let i = 0; i < a.length; i++){
        let obj = {
          hour: 0,
          temp: 0,
          amt: 1
        }
        obj.hour = i
        obj.temp = a[i].temp
        c.push(obj)
      }
      console.log("chartdata:",c)
      setChart(c)
      setWeekData(data.data.daily)
      let arr = []
      for (let i = 0; i < data.data.daily.length; i++){
        let ele = data.data.daily[i]
        let  milliseconds = ele.dt * 1000
        let dateObject = new Date(milliseconds);
        let day = dateObject.toLocaleString("en-US", { weekday: "short" });
        arr.push(day);
      }
      setDays(arr)
    }).catch((err) => console.log(err))
  }

  const handlechange = (e) => {
    console.log(e.target.value)
    setCity(e.target.value)
    axios.get(`https://assignments-backend2.herokuapp.com/cities?q=${e.target.value}`)
      .then((res) => {
        console.log(res.data)
        setFilterCity(res.data)
    }).catch((err)=> console.log(err))
  }


  const handleDropdownCity = (value) => {
    console.log(value)
    setCity(value)
    setFilterCity([])
    fetchdata()
  }

  return (
    <div className="App">
      <div className='serchbar'>
      <InputGroup size='lg'>
        <Input
          pr='5rem'
          placeholder='Search'
          value={city}
          onChange={handlechange}
        />
        <InputRightElement width='4.5rem'>
          <FiSearch onClick={() => fetchdata()} ></FiSearch  >
        </InputRightElement>
        <InputLeftElement width='3.5rem' mr="20px">
          <ImLocation />
        </InputLeftElement>
        </InputGroup>
        <div className='dropdown-div'>
          {filtercity.map((e) => {
            return (
              <div onClick={()=> handleDropdownCity(e.city)} >{e.city}, { e.state }</div>
            )
          })}
        </div>
      </div>
      <div className='weather-forcast-div'>
        <div className='weather-forcast'>
          {weekdata.map((e,i) => {
            return(
              <div key={i}>
              <p>{days[i]}</p>
              <p>{e.temp.day}°</p>
              <p>
                  <img className='img' src={`http://openweathermap.org/img/wn/${e.weather[0].icon}.png`} alt="img-icon" />
              </p>
              <p>{e.weather[0].main}</p>
            </div>
            )
          } )}
    
        </div>
      </div>
      <div className='Chart-div'>
        <div className='temp-div'>
          <div>{t}° C</div>
          <div style={{marginLeft : "20px"}}>
            <img style={{ width : "80px"}} src={`http://openweathermap.org/img/wn/${icon}.png`} alt="img-icon" />
          </div>
        </div>
        <div className='chart-div'>
          <Chart chart={chart} ></Chart>
        </div>
        <div className='detail-div'>
          <div>
            <h2>Pressure</h2>
            <p>{p}</p>
          </div>
          <div>
            <h2>Humidity</h2>
            <p>{h}</p>
          </div>
        </div>
        <div className='detail-div'>
          <div style={{backgroundColor : "white"}} >
            <h2>Sunnrise</h2>
            <p>{ sunrise}</p>
          </div>
          <div style={{backgroundColor : "white"}} >
            <h2>sunset</h2>
            <p>{ sunset}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
