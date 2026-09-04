\# Stock Analysis \& Market Intelligence Platform



A full-stack stock analysis platform that allows administrators to upload stock-market screenshots, extract stock information using OCR, review and publish selected stocks, and provide users with a dashboard to view published stocks and their historical price information.



The long-term goal is to build an independent stock intelligence and prediction engine that combines technical indicators, market data, fundamentals, news, sentiment, and machine learning.



\---



\## 1. Project Overview



The platform currently supports two main roles:



\### Admin



Admins can:



\* Log in securely.

\* Upload stock-market screenshots.

\* Extract stock information using OCR.

\* Review parsed stock data.

\* Publish selected stocks.

\* Make published stocks available to users.



\### User



Users can:



\* Register and log in.

\* View stocks published by the admin.

\* Filter stocks by trading date.

\* Open individual stock details.

\* View current stock information.

\* View available historical price data and charts.



\---



\## 2. Current Workflow



```text

Admin Login

&#x20;    ↓

Admin Dashboard

&#x20;    ↓

Upload Stock Screenshot

&#x20;    ↓

OpenCV Image Preprocessing

&#x20;    ↓

Tesseract OCR

&#x20;    ↓

Stock Data Parser

&#x20;    ↓

Extracted Stock Table

&#x20;    ↓

Admin Reviews Stocks

&#x20;    ↓

Admin Publishes Selected Stocks

&#x20;    ↓

MongoDB

&#x20;    ↓

User Dashboard

&#x20;    ↓

Published Stocks

&#x20;    ↓

Stock Details

&#x20;    ↓

Historical Chart

```



\---



\## 3. Long-Term Vision



The current application is the foundation for a larger stock intelligence system.



The future system will analyze admin-posted stocks using independent algorithms and machine-learning models.



For each stock, the platform is expected to provide information such as:



\* Up/Down direction

\* Prediction confidence

\* Expected movement over multiple time horizons

\* Short-term momentum

\* Volatility

\* Trading volume behavior

\* Relative strength

\* Technical indicators

\* Fundamental information

\* News analysis

\* Market sentiment

\* Sector/market context

\* Expected recovery or bounce-back period after a decline

\* Overall stock intelligence score



Predictions will be probabilistic and will require proper validation and backtesting. They should not be treated as guaranteed investment advice.



\---



\## 4. High-Level Architecture



```text

&#x20;                   ┌─────────────────────┐

&#x20;                   │   External Sources  │

&#x20;                   │ Market / News /     │

&#x20;                   │ Fundamental Data    │

&#x20;                   └──────────┬──────────┘

&#x20;                              │

&#x20;                              ↓

┌───────────────┐      ┌──────────────────┐

│ Admin Upload  │ ───→ │ Data Ingestion   │

│ Screenshot    │      │ OCR + Validation │

└───────────────┘      └────────┬─────────┘

&#x20;                               │

&#x20;                               ↓

&#x20;                      ┌─────────────────┐

&#x20;                      │    MongoDB      │

&#x20;                      │ Stock Data      │

&#x20;                      │ Snapshots       │

&#x20;                      │ Published Posts │

&#x20;                      └────────┬────────┘

&#x20;                               │

&#x20;                               ↓

&#x20;                      ┌─────────────────┐

&#x20;                      │ Analysis Engine │

&#x20;                      │ Technical       │

&#x20;                      │ Fundamental     │

&#x20;                      │ News/Sentiment  │

&#x20;                      └────────┬────────┘

&#x20;                               │

&#x20;                               ↓

&#x20;                      ┌─────────────────┐

&#x20;                      │ ML Prediction   │

&#x20;                      │ Direction       │

&#x20;                      │ Confidence      │

&#x20;                      │ Time Horizon    │

&#x20;                      └────────┬────────┘

&#x20;                               │

&#x20;                   ┌───────────┴───────────┐

&#x20;                   ↓                       ↓

&#x20;            ┌─────────────┐         ┌─────────────┐

&#x20;            │    Admin    │         │    Users    │

&#x20;            │   Dashboard │         │  Dashboard  │

&#x20;            └─────────────┘         └─────────────┘

```



\---



\## 5. Technology Stack



\### Frontend



\* React

\* React DOM

\* Vite

\* Tailwind CSS



\### Backend



\* Python

\* FastAPI

\* Uvicorn

\* Pydantic



\### Database



\* MongoDB Atlas

\* PyMongo



\### OCR / Image Processing



\* Tesseract OCR

\* OpenCV

\* NumPy

\* Python image processing



\### Authentication



\* JWT

\* Passlib

\* bcrypt

\* Role-based authorization



\---



\## 6. Project Structure



```text

stock-analysis/

│

├── backend/

│   ├── app/

│   │   ├── api/

│   │   │   └── routes/

│   │   │       ├── admin\_stocks.py

│   │   │       ├── auth.py

│   │   │       ├── stocks.py

│   │   │       ├── upload.py

│   │   │       └── user\_stocks.py

│   │   │

│   │   ├── core/

│   │   │   └── auth.py

│   │   │

│   │   ├── database/

│   │   │   └── mongodb.py

│   │   │

│   │   ├── models/

│   │   │   ├── admin\_stock\_post.py

│   │   │   └── stock.py

│   │   │

│   │   ├── schemas/

│   │   │   ├── auth.py

│   │   │   └── stock.py

│   │   │

│   │   └── services/

│   │       ├── auth\_service.py

│   │       ├── image\_service.py

│   │       ├── ocr\_service.py

│   │       └── parser\_service.py

│   │

│   ├── create\_admin.py

│   ├── requirements.txt

│   ├── run.py

│   └── uploads/

│

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   ├── UserDashboard/

│   │   ├── services/

│   │   ├── App.jsx

│   │   ├── Login.jsx

│   │   └── main.jsx

│   │

│   ├── package.json

│   └── vite.config.js

│

├── .gitignore

└── README.md

```



\---



\## 7. Prerequisites



Install the following before running the project:



\* Python 3.10+

\* Node.js 18+

\* npm

\* MongoDB Atlas account

\* Tesseract OCR



Verify Python:



```bash

python --version

```



Verify Node:



```bash

node --version

```



Verify npm:



```bash

npm --version

```



Verify Tesseract:



```bash

tesseract --version

```



\---



\## 8. Clone the Repository



```bash

git clone <YOUR\_GITHUB\_REPOSITORY\_URL>

cd stock-analysis

```



\---



\## 9. Backend Setup



Move into the backend:



```bash

cd backend

```



Create a virtual environment:



\### Windows



```powershell

python -m venv venv

```



Activate it:



```powershell

.\\venv\\Scripts\\Activate.ps1

```



Install dependencies:



```powershell

pip install -r requirements.txt

```



\---



\## 10. Backend Environment Variables



Create:



```text

backend/.env

```



Do not commit this file to GitHub.



Use the following structure:



```env

MONGODB\_URI=your\_mongodb\_connection\_string

DATABASE\_NAME=stock\_analysis



JWT\_SECRET\_KEY=your\_random\_secret\_key

JWT\_ALGORITHM=HS256

JWT\_ACCESS\_TOKEN\_EXPIRE\_MINUTES=60

```



Each developer should create their own local `.env`.



\---



\## 11. MongoDB Setup



Create or use a MongoDB Atlas cluster.



Create a database named:



```text

stock\_analysis

```



The application uses collections including:



```text

users

stocks

stock\_snapshots

uploads

admin\_stock\_posts

```



Add your MongoDB connection string to:



```text

backend/.env

```



Example:



```env

MONGODB\_URI=<your MongoDB Atlas connection string>

```



Do not commit credentials or connection strings.



\---



\## 12. Tesseract OCR Setup



The backend uses Tesseract to extract stock information from screenshots.



Install Tesseract OCR on your system and make sure the executable is available to the application.



Verify installation:



```bash

tesseract --version

```



If Tesseract is installed but not available through the system PATH, configure the Tesseract executable path in the OCR service for your local machine.



\---



\## 13. Create an Admin Account



From the backend directory:



```powershell

python create\_admin.py

```



This creates an administrator account in MongoDB.



For security, production credentials should not be hard-coded. Use environment variables or a secure administrative setup when deploying.



\---



\## 14. Run the Backend



From:



```text

stock-analysis/backend

```



run:



```powershell

python run.py

```



The backend should run at:



```text

http://127.0.0.1:8000

```



FastAPI documentation:



```text

http://127.0.0.1:8000/docs

```



\---



\## 15. Frontend Setup



Open another terminal.



Move to the frontend:



```powershell

cd frontend

```



Install dependencies:



```powershell

npm install

```



Run the development server:



```powershell

npm run dev

```



The frontend will normally be available at:



```text

http://localhost:5173

```



\---



\## 16. Authentication



The application uses JWT-based authentication.



\### Registration



Users can register through:



```text

POST /api/auth/register

```



\### Login



```text

POST /api/auth/login

```



The backend returns an access token and user role.



The frontend stores the token locally and uses it for protected API requests.



\---



\## 17. API Endpoints



\### Authentication



```text

POST /api/auth/register

POST /api/auth/login

```



\### Stock Data



```text

GET /api/stocks

GET /api/stocks/date/{trading\_date}

GET /api/stocks/{ticker}/history

```



\### Admin



```text

POST /api/upload

POST /api/admin/stocks/publish

```



\### User



```text

GET /api/user/stocks

```



User stock data is restricted to stocks published by the admin.



\---



\## 18. OCR Data Pipeline



The current OCR pipeline works approximately as follows:



```text

Uploaded Screenshot

&#x20;       ↓

Image Validation

&#x20;       ↓

OpenCV Preprocessing

&#x20;       ↓

Tesseract OCR

&#x20;       ↓

OCR Text

&#x20;       ↓

Stock Parser

&#x20;       ↓

Data Validation

&#x20;       ↓

Duplicate Detection

&#x20;       ↓

MongoDB Snapshot

```



The parser extracts fields such as:



```text

Ticker

Price

Change

Change %

Volume Change %

Trading Date

```



The parser also contains handling for common OCR errors and malformed percentage/change values.



\---



\## 19. MongoDB Data Flow



Stock snapshots are stored using fields such as:



```text

ticker

price

change

changePercent

volumeChangePercent

tradingDate

uploadId

capturedAt

```



A unique index is maintained for:



```text

ticker + tradingDate

```



This helps prevent duplicate daily stock snapshots.



Published admin posts are stored separately from the raw stock snapshot data.



\---



\## 20. Current Features



\### Completed



\* React frontend

\* FastAPI backend

\* MongoDB Atlas integration

\* User registration

\* User login

\* Admin authentication

\* JWT authentication

\* Role-based authorization

\* Admin dashboard

\* Screenshot upload

\* OpenCV preprocessing

\* Tesseract OCR

\* Stock data parsing

\* OCR error handling

\* Duplicate detection

\* Daily stock snapshots

\* Admin stock publishing

\* User dashboard

\* Date filtering

\* Stock details page

\* Historical stock API

\* Historical stock chart

\* Git-ready project structure



\---



\## 21. Planned Analysis Engine



The next major development area is the stock analysis engine.



\### Technical Analysis



Potential indicators include:



\* SMA

\* EMA

\* RSI

\* MACD

\* ATR

\* ADX

\* Relative Volume

\* Volume Moving Average

\* OBV

\* Relative Strength

\* Trend Direction



Example pipeline:



```text

Price Data

&#x20;   ↓

Technical Indicators

&#x20;   ↓

Feature Engineering

&#x20;   ↓

Technical Score

```



\---



\## 22. Prediction Engine



The prediction system will eventually combine multiple signals.



```text

Market Data

&#x20;    ↓

Data Cleaning

&#x20;    ↓

Feature Engineering

&#x20;    ↓

Technical Features

&#x20;    ↓

Fundamental Features

&#x20;    ↓

News Features

&#x20;    ↓

Sentiment Features

&#x20;    ↓

ML Model

&#x20;    ↓

Prediction

```



Possible prediction outputs:



```text

Direction: UP / DOWN

Confidence: 0 - 100%

Expected Return

1-Day Outlook

3-Day Outlook

5-Day Outlook

10-Day Outlook

Recovery Estimate

Overall Score

```



\---



\## 23. Potential Machine Learning Models



\### Classification



\* Logistic Regression

\* Random Forest

\* XGBoost

\* LightGBM

\* SVM

\* Neural Networks



\### Regression



\* Linear Regression

\* Random Forest Regression

\* XGBoost Regression

\* LightGBM Regression

\* Neural Networks



\### Time-Series Models



\* ARIMA

\* SARIMA

\* Exponential Smoothing

\* Prophet

\* LSTM

\* GRU

\* Transformer-based models



The final model should be selected based on validation and backtesting performance rather than assuming that a more complex model is automatically better.



\---



\## 24. Model Validation



ML predictions must be evaluated using historical data.



```text

Historical Data

&#x20;     ↓

Train / Validation / Test Split

&#x20;     ↓

Feature Engineering

&#x20;     ↓

Model Training

&#x20;     ↓

Validation

&#x20;     ↓

Backtesting

&#x20;     ↓

Performance Metrics

&#x20;     ↓

Model Selection

&#x20;     ↓

Production Prediction

```



Important concerns:



\* Avoid data leakage.

\* Avoid look-ahead bias.

\* Avoid overfitting.

\* Use time-aware validation.

\* Compare against simple baselines.

\* Measure performance over different market conditions.



\---



\## 25. Future Full-Market Scanner



After validating the prediction engine on admin-posted stocks, the platform can be expanded to analyze a larger market universe.



```text

Entire Market

&#x20;     ↓

Market Data APIs

&#x20;     ↓

Data Processing

&#x20;     ↓

Technical Analysis

&#x20;     ↓

Fundamental Analysis

&#x20;     ↓

News Analysis

&#x20;     ↓

Sentiment Analysis

&#x20;     ↓

ML Prediction

&#x20;     ↓

Stock Ranking

&#x20;     ↓

Top Candidates

&#x20;     ↓

Admin Review

&#x20;     ↓

Publish

&#x20;     ↓

Users

```



The goal is to eventually allow the platform to identify potentially interesting stocks instead of relying only on manually posted candidates.



\---



\## 26. Suggested Team Division



\### Developer 1 — Core Backend / Data



Responsibilities:



\* FastAPI

\* Authentication

\* Admin workflow

\* OCR pipeline

\* Parser

\* MongoDB

\* API development

\* Data models



\### Developer 2 — Analysis / ML



Responsibilities:



\* Historical market data

\* Technical indicators

\* Feature engineering

\* Scoring system

\* ML models

\* Prediction pipeline

\* Backtesting

\* Model evaluation



\### Developer 3 — Frontend / Intelligence UI



Responsibilities:



\* User dashboard

\* Stock details

\* Charts

\* Technical analysis UI

\* News section

\* Sentiment section

\* Prediction UI

\* Report generation

\* API integration



Responsibilities can be adjusted as the project evolves.



\---



\## 27. Git Workflow



Do not directly develop on `main`.



Create a feature branch:



```bash

git checkout -b feature/your-feature-name

```



After completing the work:



```bash

git add .

git commit -m "Add your feature"

git push -u origin feature/your-feature-name

```



Then create a Pull Request to `main`.



Example branches:



```text

main

│

├── feature/technical-analysis

├── feature/ml-prediction

├── feature/news-analysis

└── feature/user-dashboard

```



\---



\## 28. Important Security Rules



Never commit:



```text

.env

MongoDB credentials

JWT secrets

Passwords

API keys

Private credentials

Generated upload files

```



The repository `.gitignore` is configured to exclude environment files, virtual environments, caches, Node modules, logs, and runtime uploads.



\---



\## 29. Development Philosophy



The project should be developed incrementally.



```text

Build

&#x20; ↓

Test

&#x20; ↓

Validate

&#x20; ↓

Measure

&#x20; ↓

Improve

&#x20; ↓

Expand

```



The prediction engine should not be considered successful simply because it produces predictions.



It should demonstrate measurable performance through historical testing and backtesting before being relied upon.



\---



\## 30. Current Project Status



```text

Authentication              ✅

Role Management             ✅

Admin Dashboard             ✅

User Dashboard              ✅

Screenshot Upload           ✅

OCR                         ✅

Stock Parser                ✅

MongoDB Storage             ✅

Duplicate Detection         ✅

Admin Publishing            ✅

Date Filtering              ✅

Stock Details               ✅

Historical Data API         ✅

Historical Chart            ✅



Technical Analysis          🔄 Planned

Fundamental Analysis        🔄 Planned

News Analysis               🔄 Planned

Sentiment Analysis          🔄 Planned

Prediction Engine           🔄 Planned

ML Backtesting              🔄 Planned

Full Market Scanner         🔄 Future

```



\---



\## 31. Important Note



This project is intended as a stock research and market intelligence platform.



Any prediction generated by the future ML system should be treated as a probabilistic research signal, not a guaranteed prediction of future market prices or investment advice.



