Smart Light Digital Twin Project
================================

A 3D interactive digital twin of a smart light system with real-time monitoring, control, and energy analytics.

Features
--------

*   **3D Visualization** of a smart light in a virtual room environment
    
*   **Real-time Control** of light status and brightness
    
*   **Power Monitoring** with consumption analytics
    
*   **Weather-based Automation** that adjusts lighting based on conditions
    
*   **Historical Data Tracking** of usage patterns
    
*   **Cost Estimation** of electricity consumption
    

Technologies Used
-----------------

### Frontend

*   React.js
    
*   Three.js (via @react-three/fiber)
    
*   Recharts for data visualization
    
*   Axios for API calls
    

### Backend

*   Flask (Python)
    
*   Flask-CORS for cross-origin support
    

Installation
------------

### Prerequisites

*   Node.js (v14+)
    
*   Python (3.7+)
    
*   npm/yarn
    

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mahanthb/DTxR-mini-project.git
   cd smart-light-digital-twin
    
2. ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
    
4. ```bash
   cd frontend
   npm install
   npm start
    
6.  **Access the application**
    
    *   Frontend: [http://localhost:3000](http://localhost:3000/)
        
    *   Backend API: [http://localhost:5000](http://localhost:5000/)
        

Usage
-----

1.  **Manual Control**:
    
    *   Toggle the light ON/OFF using the buttons
        
    *   Adjust brightness using the slider
        
2.  **Auto Mode**:
    
    *   Enable Auto Mode to have the system automatically adjust lighting based on:
        
        *   Time of day
            
        *   Weather conditions (cloud cover, daylight)
            
        *   Temperature
            
3.  **Monitoring**:
    
    *   View real-time power consumption
        
    *   Analyze historical usage patterns
        
    *   See the relationship between brightness and power usage
        

API Documentation
-----------------

The backend provides a simple REST API:

*   GET /toggle-light - Get current light state
    
*   POST /toggle-light - Update light state
    
    *   Parameters:
        
        *   state: "ON" or "OFF"
            
        *   brightness: 0-100 (percentage)
            

Contributing
------------

Contributions are welcome! Please follow these steps:

1.  Fork the project
    
2.  Create your feature branch (git checkout -b feature/AmazingFeature)
    
3.  Commit your changes (git commit -m 'Add some AmazingFeature')
    
4.  Push to the branch (git push origin feature/AmazingFeature)
    
5.  Open a Pull Request
    

License
-------

Distributed under the MIT License. See LICENSE for more information.

Contact
-------

Your Name - [mahanthkumarb@gmail.com](https://mailto:your.email@example.com/)

Project Link: [https://github.com/Mahanthb/DTxR-mini-project](https://github.com/your-username/smart-light-digital-twin)

Acknowledgements
----------------

*   [React Three Fiber](https://github.com/pmndrs/react-three-fiber) for 3D rendering
    
*   [Recharts](https://recharts.org/) for data visualization
    
*   [Open-Meteo](https://open-meteo.com/) for weather data API
