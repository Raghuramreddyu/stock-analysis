const API_BASE_URL = "http://127.0.0.1:8000/api";


export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}


export async function registerUser(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Registration failed");
  }

  return data;
}


export function getAccessToken() {
  return localStorage.getItem("access_token");
}


export function getCurrentUser() {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  return JSON.parse(user);
}


export function logoutUser() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}


export async function uploadStockImage(file) {
  const token = getAccessToken();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Upload failed");
  }

  return data;
}

export async function getUserStocks(tradingDate = "") {

  const token = getAccessToken();

  let url = `${API_BASE_URL}/user/stocks`;

  if (tradingDate) {
    url += `?trading_date=${encodeURIComponent(tradingDate)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch stocks"
    );
  }

  return data;
}

export async function publishStock(stock) {

  const token = getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/admin/stocks/publish`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        ticker: stock.ticker,
        price: stock.price,
        change: stock.change,
        change_percent: stock.change_percent,
        volume_change_percent: stock.volume_change_percent,
        trading_date: stock.trading_date,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to publish stock"
    );
  }

  return data;
}

export async function publishAllStocks(stocks) {

  const token = getAccessToken();

  const response = await fetch(
    "http://127.0.0.1:8000/api/admin/stocks/publish-all",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify(stocks)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to publish stocks"
    );
  }

  return data;
}

export async function getStockHistory(ticker) {

  const token = getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/stocks/${encodeURIComponent(ticker)}/history`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch stock history"
    );
  }

  return data;
}

export async function getStockAnalysis(ticker) {

  const token = getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/stocks/${encodeURIComponent(ticker)}/analysis`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch stock analysis"
    );
  }

  return data;
}