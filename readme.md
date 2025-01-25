# Pactolus: Multi-Agentic AI Stock Insights

## Overview
Pactolus is a powerful multi-agent AI application designed to provide actionable insights into the stock market. By integrating advanced AI-driven advisory agents with real-time market data, Pactolus helps users make informed financial decisions. The app utilizes a sophisticated stack to consolidate stock prices, analyze financial metrics, and track market trends seamlessly.

![Pactolus Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Preview)

---

## Features
- **Real-Time Stock Prices**: Leveraging Alpaca Markets WebSocket to display live stock prices.
- **AI-Powered Insights**: Multi-agent system that:
  - Analyzes stock metrics (e.g., PE ratio, performance trends) using DeepSeek R1 and V3.
  - Consolidates market news for a holistic financial overview.
- **Market Tracking**: Up-to-date API integrations to monitor stock market movements.
- **News Retrieval**: Fetches relevant stock-related news from Yahoo Finance for comprehensive analysis.
- **User-Friendly Interface**: Built with Next.js and React for a seamless frontend experience.

---

## Tech Stack
### **Frontend**
- **Framework**: Next.js (React-based).
- **Styling**: Tailwind CSS for a modern and responsive UI.
- **Real-Time Updates**: Live price feeds integrated into an interactive and intuitive dashboard.

### **Backend**
- **Framework**: FastAPI for building high-performance APIs.
- **Market Data Integration**:
  - Alpaca Markets WebSocket for real-time price streaming.
  - REST APIs to fetch and track stock market data.
  - Yahoo Finance API for news retrieval.
- **Multi-Agent System**: 
  - DeepSeek V3 for fetching financial data.
  - DeepSeek R1 for consolidating the data and coming up with a comprehensive analysis.

---

## Installation & Setup
Follow these steps to run Pactolus locally:

### **Prerequisites**
- Python 3.9+
- Node.js 16+
- An Alpaca Markets account with API credentials

### **Backend Setup**
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Pactolus-Multi-Agentic-AI-Insights.git
   cd Pactolus-Multi-Agentic-AI-Insights/backend

2. Create a virtual environment:

   ```bash
   python -m venv env
   source env/bin/activate  # On Windows, use `env\Scripts\activate`

3. Install dependencies:

   ```bash
   pip install -r requirements.txt

4. Set up environment variables:
   - Create a `.env` file and include your Alpaca API credentials:

     ```env
     ALPACA_API_KEY=your_api_key
     ALPACA_SECRET_KEY=your_secret_key
     ```
     
5. Start the FastAPI server:

   ```bash
   uvicorn app.main:app --reload

---

### **Frontend Setup**

1. Navigate to the frontend folder:

   ```bash
   cd ../frontend

2. Install dependencies:

   ```bash
   npm install

3. Run the Next.js development server:

   ```bash
   npm run dev

4. Access the app at `http://localhost:3000`.



