import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
function analyzeMetric(metric) {
  const { name, value } = metric;

  let rating = "";
  let hint = "";

  switch (name) {
    case "LCP":
      if (value < 2500) {
        rating = "GOOD";
      } else if (value < 4000) {
        rating = "NEEDS IMPROVEMENT";
      } else {
        rating = "BAD";
      }
      hint = "Main content load speed (focus on images, bundle size)";
      break;

    case "FID":
      if (value < 100) {
        rating = "GOOD";
      } else if (value < 300) {
        rating = "NEEDS IMPROVEMENT";
      } else {
        rating = "BAD";
      }
      hint = "Interactivity delay (JS blocking issue)";
      break;

    case "CLS":
      if (value < 0.1) {
        rating = "GOOD";
      } else if (value < 0.25) {
        rating = "NEEDS IMPROVEMENT";
      } else {
        rating = "BAD";
      }
      hint = "Layout shifting (UI jumping issue)";
      break;

    case "FCP":
      if (value < 1800) {
        rating = "GOOD";
      } else if (value < 3000) {
        rating = "NEEDS IMPROVEMENT";
      } else {
        rating = "BAD";
      }
      hint = "First paint speed";
      break;

    case "TTFB":
      if (value < 800) {
        rating = "GOOD";
      } else if (value < 1800) {
        rating = "NEEDS IMPROVEMENT";
      } else {
        rating = "BAD";
      }
      hint = "Server response time";
      break;

    default:
      rating = "UNKNOWN";
  }

  console.warn(
    `%c${name}: ${value} → ${rating}`,
    `color: ${
      rating === "GOOD"
        ? "green"
        : rating === "NEEDS IMPROVEMENT"
        ? "orange"
        : "red"
    }; font-weight: bold;`
  );

  console.warn("👉", hint);
}
reportWebVitals(analyzeMetric);
