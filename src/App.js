import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./App.css";

const API_URL = "http://127.0.0.1:5000/toggle-light";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

// Philips Hue bulb power consumption reference (approximate values)
const getPowerConsumption = (brightness) => {
  if (brightness === 0) return 0;
  return 0.5 + (8.5 * Math.pow(brightness / 100, 1.8));
};

// Generate sample historical data for the past 24 hours
const generateHistoricalData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now);
    time.setHours(now.getHours() - i);
    
    // Simulate usage patterns (more usage in evening hours)
    const hour = time.getHours();
    let brightness = 0;
    let power = 0;
    
    if (hour >= 6 && hour <= 22) {
      brightness = Math.floor(Math.random() * 60) + 20;
      if (hour >= 18) brightness = Math.floor(Math.random() * 80) + 20;
      power = getPowerConsumption(brightness);
    }
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      brightness,
      power
    });
  }
  
  return data;
};

function SmartLight({ isOn, brightness }) {
  const intensity = isOn ? brightness / 20 : 0;
  return (
    <mesh position={[0, 3.5, 0]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial
        emissive={isOn ? "yellow" : "black"}
        emissiveIntensity={intensity}
        color={isOn ? "white" : "gray"}
      />
    </mesh>
  );
}

// 📌 Floor
function Floor() {
  return (
    <mesh position={[0, -1, 0]} receiveShadow>
      <boxGeometry args={[6, 0.1, 6]} />
      <meshStandardMaterial color="lightgray" />
    </mesh>
  );
}

function Walls() {
  return (
    <>
      {/* Back Wall */}
      <mesh position={[0, 1.5, -3]}>
        <boxGeometry args={[6, 5, 0.1]} />
        <meshStandardMaterial color="beige" />
      </mesh>

      {/* Photo Frame 1 */}
      <mesh position={[-1.5, 2.5, -2.9]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.02]} />
        <meshStandardMaterial color="#654321" />
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.76, 0.56]} />
          <meshStandardMaterial color="#f0e0a0" />
        </mesh>
      </mesh>

      {/* Photo Frame 2 */}
      <mesh position={[1.5, 2.5, -2.9]} rotation={[0, 0, Math.PI/12]}>
        <boxGeometry args={[0.7, 0.5, 0.02]} />
        <meshStandardMaterial color="#876543" />
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.66, 0.46]} />
          <meshStandardMaterial color="#d0c0a0" />
        </mesh>
      </mesh>

      {/* Wall Clock */}
      <group position={[0, 2.5, -2.9]}>
        <mesh>
          <cylinderGeometry args={[0.6, 0.6, 0.03, 32]} />
          <meshStandardMaterial color="silver" />
        </mesh>
        <mesh position={[0, 0, 0.015]}>
          <circleGeometry args={[0.58, 32]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[0, 0, 0.02]} rotation={[0, 0, Math.PI/2]}>
          <boxGeometry args={[0.4, 0.02, 0.01]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[0, 0, 0.02]} rotation={[0, 0, Math.PI/4]}>
          <boxGeometry args={[0.3, 0.03, 0.01]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>

      {/* Left Wall */}
      <mesh position={[-3, 1.5, 0]}>
        <boxGeometry args={[0.1, 5, 6]} />
        <meshStandardMaterial color="beige" />
      </mesh>

      {/* Wall Shelf */}
      <group position={[-2.95, 2, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.02, 0.05, 2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[0, 0.5, -0.5]}>
          <boxGeometry args={[0.05, 0.2, 0.2]} />
          <meshStandardMaterial color="green" />
        </mesh>
        <mesh position={[0, 0.5, 0.5]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 32]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      </group>

      {/* Right Wall */}
      <mesh position={[3, 1.5, 0]}>
        <boxGeometry args={[0.1, 5, 6]} />
        <meshStandardMaterial color="beige" />
      </mesh>

      {/* Wall Art */}
      <mesh position={[2.95, 2.5, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.02]} />
        <meshStandardMaterial color="#543210" />
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.16, 0.76]} />
          <meshStandardMaterial color="#a0a0ff" />
        </mesh>
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[6, 0.1, 6]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </>
  );
}

// 📌 Table
function Table() {
  return (
    <>
      <mesh position={[0, 0, 1]} castShadow>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      {[[-0.9, -0.5, 0.5], [0.9, -0.5, 0.5], [-0.9, -0.5, 1.5], [0.9, -0.5, 1.5]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
          <meshStandardMaterial color="brown" />
        </mesh>
      ))}
    </>
  );
}

// 📌 Chair
function Chair() {
  return (
    <>
      <mesh position={[-1.5, -0.2, 1]} castShadow>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshStandardMaterial color="darkblue" />
      </mesh>
      {[[-1.3, -0.6, 0.7], [-1.7, -0.6, 0.7], [-1.3, -0.6, 1.3], [-1.7, -0.6, 1.3]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 16]} />
          <meshStandardMaterial color="darkblue" />
        </mesh>
      ))}
    </>
  );
}


export default function App() {
  const [lightState, setLightState] = useState({
    status: "OFF",
    brightness: 50,
    currentPower: 0
  });
  
  const [historicalData, setHistoricalData] = useState(generateHistoricalData());
  const [powerData, setPowerData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [autoMode, setAutoMode] = useState(false);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(WEATHER_API_URL, {
          params: {
            "latitude": 12.9716,
            "longitude": 77.5946,
            hourly: "temperature_2m,relativehumidity_2m,cloudcover,is_day",
            timezone: "auto",
            forecast_days: 1
          }
        });
        setWeatherData(response.data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
    
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 3600000); // Update hourly
    
    return () => clearInterval(weatherInterval);
  }, []);

  // Auto-adjust lighting based on weather and time
  useEffect(() => {
    if (!autoMode || !weatherData) return;
    
    const adjustLighting = async () => {
      const now = new Date();
      const hour = now.getHours();
      const isDaytime = weatherData.hourly.is_day[hour];
      const cloudCover = weatherData.hourly.cloudcover[hour];
      const temperature = weatherData.hourly.temperature_2m[hour];
      
      let newBrightness = lightState.brightness;
      let newStatus = lightState.status;
      
      // Basic rules for auto mode
      if (!isDaytime) {
        // Night time - turn on with moderate brightness
        newStatus = "ON";
        newBrightness = 60;
      } else if (cloudCover > 70) {
        // Cloudy day - turn on with lower brightness
        newStatus = "ON";
        newBrightness = 40;
      } else if (hour >= 18 || hour <= 6) {
        // Evening/morning - turn on with warm light
        newStatus = "ON";
        newBrightness = 50;
      } else {
        // Bright day - turn off
        newStatus = "OFF";
      }
      
      // Adjust for temperature (warmer light for colder temps)
      if (temperature < 15) {
        newBrightness = Math.min(newBrightness + 10, 100);
      }
      
      try {
        const response = await axios.post(API_URL, { 
          state: newStatus,
          brightness: newBrightness
        });
        const calculatedPower = newStatus === "ON" ? getPowerConsumption(newBrightness) : 0;
        setLightState({
          ...response.data,
          currentPower: calculatedPower
        });
      } catch (error) {
        console.error("Error adjusting lighting:", error);
      }
    };
    
    adjustLighting();
    const autoAdjustInterval = setInterval(adjustLighting, 300000); // Check every 5 minutes
    
    return () => clearInterval(autoAdjustInterval);
  }, [autoMode, weatherData]);

  useEffect(() => {
    async function fetchLightState() {
      try {
        const response = await axios.get(API_URL);
        const data = response.data;
        // Calculate realistic power consumption based on brightness
        const calculatedPower = getPowerConsumption(data.brightness);
        setLightState({
          ...data,
          currentPower: data.status === "ON" ? calculatedPower : 0
        });
        
        // Update power data for visualization
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setPowerData(prev => {
          const newData = [...prev, {
            time: timeString,
            power: calculatedPower,
            brightness: data.brightness
          }];
          // Keep only the last 10 readings
          return newData.slice(-10);
        });
      } catch (error) {
        console.error("Error fetching light state:", error);
      }
    }
    
    fetchLightState();
    
    const interval = setInterval(() => {
      if (lightState.status === "ON") {
        fetchLightState();
      }
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [lightState.status]);

  const toggleLight = async (status) => {
    try {
      const response = await axios.post(API_URL, { 
        state: status,
        brightness: lightState.brightness
      });
      const calculatedPower = status === "ON" ? getPowerConsumption(lightState.brightness) : 0;
      setLightState({
        ...response.data,
        currentPower: calculatedPower
      });
    } catch (error) {
      console.error("Error toggling light:", error);
    }
  };

  const handleBrightnessChange = async (e) => {
    const newBrightness = parseInt(e.target.value);
    try {
      const response = await axios.post(API_URL, { 
        state: lightState.status,
        brightness: newBrightness
      });
      const calculatedPower = lightState.status === "ON" ? getPowerConsumption(newBrightness) : 0;
      setLightState({
        ...response.data,
        currentPower: calculatedPower
      });
    } catch (error) {
      console.error("Error updating brightness:", error);
    }
  };

  // Data for power vs brightness chart
  const brightnessPowerData = Array.from({ length: 10 }, (_, i) => {
    const brightness = (i + 1) * 10;
    return {
      brightness,
      power: getPowerConsumption(brightness)
    };
  });

  return (
    <div className="app-container">
      <h1 style={{ color: "white" }}>Smart Light Digital Twin</h1>
      <div className="dashboard">
        <div className="control-panel">
          <div className="status-display">
            <h3>Current Status</h3>
            <p>Light Status: <strong>{lightState.status}</strong></p>
            <p>Brightness: <strong>{lightState.brightness}%</strong></p>
            <p>Current Power: <strong>{lightState.currentPower.toFixed(2)} Watts</strong></p>
            <p>Estimated Cost: <strong>${(lightState.currentPower * 0.12 / 1000).toFixed(4)}/hr</strong></p>
            
            {weatherData && (
              <div className="weather-info">
                <h4>Weather Conditions</h4>
                <p>Temperature: <strong>{weatherData.hourly.temperature_2m[new Date().getHours()]}°C</strong></p>
                <p>Cloud Cover: <strong>{weatherData.hourly.cloudcover[new Date().getHours()]}%</strong></p>
                <p>Daylight: <strong>{weatherData.hourly.is_day[new Date().getHours()] ? 'Day' : 'Night'}</strong></p>
              </div>
            )}
          </div>
          
          <div className="controls">
            <button onClick={() => toggleLight("ON")} disabled={lightState.status === "ON"}>Turn ON</button>
            <button onClick={() => toggleLight("OFF")} disabled={lightState.status === "OFF"}>Turn OFF</button>
            <div className="slider-container">
              <label htmlFor="brightness">Brightness: {lightState.brightness}%</label>
              <input
                type="range"
                id="brightness"
                min="10"
                max="100"
                value={lightState.brightness}
                onChange={handleBrightnessChange}
                disabled={lightState.status === "OFF" || autoMode}
              />
            </div>
            <div className="auto-mode">
              <label>
                <input
                  type="checkbox"
                  checked={autoMode}
                  onChange={() => setAutoMode(!autoMode)}
                />
                Auto Mode (Weather-based)
              </label>
            </div>
          </div>
        </div>

        <div className="visualizations">
          <div className="chart-container">
            <h3>Power Consumption (Last 10 Readings)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={powerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: 'Watts', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="power" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Power vs Brightness</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={brightnessPowerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brightness" label={{ value: 'Brightness (%)', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="power" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Historical Usage (Last 24 Hours)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" label={{ value: 'Brightness', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Power (W)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="brightness" stroke="#8884d8" />
                <Line yAxisId="right" type="monotone" dataKey="power" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="canvas-container">
        <Canvas shadows camera={{ position: [0, 2, 7], fov: 50 }}>
          <ambientLight intensity={0.3} />
          <pointLight 
            position={[0, 2.5, 0]} 
            intensity={lightState.status === "ON" ? lightState.brightness / 20 : 0} 
            castShadow 
          />
          
          <SmartLight isOn={lightState.status === "ON"} brightness={lightState.brightness} />
          <Floor />
          <Walls />
          <Table />
          <Chair />
          
          <OrbitControls />
          <ContactShadows position={[0, -1, 0]} opacity={0.4} />
        </Canvas>
      </div>
    </div>
  );
}