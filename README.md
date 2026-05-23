# Sales AI Prediction Dashboard - Frontend

A modern, interactive sales forecasting dashboard for testing LSTM-based next-day sales predictions.

## Features

📊 **Sales Forecasting** - Predict next day's sales from historical data
📈 **Interactive Charts** - Visualize historical sales patterns and forecast trends
⚡ **Multiple Input Modes** - Random test data, manual sales history, or generated sequences
📉 **Forecast Analysis** - Track average, min, max sales forecasts and model performance
🔄 **Backend Health Check** - Real-time connection status monitoring
📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Project Structure

```
frontend/
├── index.html          # Main dashboard layout (Tailwind CSS)
├── app.js             # JavaScript logic and API integration
├── server.py          # Simple HTTP server
└── README.md          # This file
```

## Setup Instructions

### Prerequisites
- Python 3.7+ (for the development server)
- Backend running on `http://localhost:5000`
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Step 1: Start the Backend

In another terminal:
```bash
cd backend
(venv) python main.py
```

You should see:
```
✓ Flask app starting on http://0.0.0.0:5000
✓ Health check: http://0.0.0.0:5000/api/health
✓ Prediction: POST http://0.0.0.0:5000/api/predict
```

### Step 2: Start the Frontend Server

In the frontend folder:
```bash
python server.py
```

You should see:
```
✓ Frontend server starting on http://localhost:3000
✓ Open http://localhost:3000 in your browser
```

### Step 3: Open in Browser

Open http://localhost:3000 in your web browser

## How to Use

### 1. **Dashboard Overview**
   - **Backend Status** - Shows if the API is connected
   - **Last Prediction** - Most recent prediction value
   - **Total Predictions** - Number of predictions made

## Making Predictions

Choose an input type:

**Random Data (Recommended for Testing)**
- Auto-generates 100 random sales values
- Adjust min/max range for different sales scales
- Useful for testing the model quickly

**Manual Input**
- Paste your own 100 days of sales data
- Example: `1000, 1050, 950, ..., 1100` (last 100 days)
- Use actual historical sales values for best results

**Time Series Sequence**
- Generates a realistic sales pattern with trends
- Simulates increasing/decreasing sales over time
- Good for testing with realistic patterns

### 3. **View Results**

After prediction:
- **Prediction Output Chart** - Shows model output
- **Input Data Visualization** - Shows what was sent
- **Statistics** - Average, min, max values and response time
- **Response Details** - Raw API response information

## API Integration Details

The frontend connects to your backend at:
```
http://localhost:5000/api/predict
```

### Request Format
```json
{
  "data": [1.0, 2.0, 3.0, ..., 100 values]
}
```

### Response Format
```json
{
  "status": "success",
  "predictions": [0.123, 0.456, ...],
  "shape": [1, output_size],
  "message": "Prediction successful"
}
```

## Features Breakdown

### Input Handling
- **Automatic Validation** - Checks data length and format
- **Error Messages** - Clear feedback if something goes wrong
- **Multiple Input Methods** - Choose what works best for you

### Visualization
- **Chart.js Integration** - Professional-looking charts
- **Real-time Updates** - Charts update instantly after prediction
- **Responsive Charts** - Scale to any screen size

### Statistics
- **Summary Stats** - Quick overview of results
- **Response Times** - Track API performance
- **Prediction History** - Keep record of all predictions

## Troubleshooting

### "Backend is not running"
- Make sure `python main.py` is running in the backend folder
- Check that it's running on `http://localhost:5000`
- Look for the message "Running on http://127.0.0.1:5000"

### "Please enter exactly 100 values"
- Make sure you're using comma-separated format
- Count your values: `1,2,3,...` should be 100 numbers
- Remove any extra spaces or empty values

### Charts are not showing
- Wait a few seconds after the prediction
- Try refreshing the page (F5)
- Check browser console for errors (F12 → Console)

### Slow predictions
- LSTM models take time to load the first time
- Subsequent predictions should be faster (model is cached)
- Response time is displayed in the statistics

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Local Development Without Server
```bash
# Just open the file directly (limited functionality)
# Some CORS issues may occur
```

### Using Python SimpleHTTPServer
```bash
python -m http.server 3000
```

### Using Node.js http-server
```bash
npm install -g http-server
http-server -p 3000
```

## Next Steps

1. **Customize the Dashboard**
   - Edit colors in `app.js` and `index.html`
   - Add your own logo and branding
   - Customize chart types and styling

2. **Add More Features**
   - Export predictions to CSV
   - Historical data tracking
   - Batch predictions
   - Model comparison

3. **Deploy to Production**
   - Use a proper web server (Nginx, Apache)
   - Add authentication
   - Enable HTTPS
   - Set up proper CORS

## API Documentation

See [../backend/README.md](../backend/README.md) for full backend documentation.

## License

Built for LSTM Model Predictions Dashboard - 2024

---

**Questions?** Check the backend README or the comments in `app.js` for more details.
