import React from "react";
import "./App.css";
import WebcamStream from "./components/webcam";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>Facial Recognition Website</h2>
      </header>
      <main>
        <WebcamStream />
      </main>
    </div>
  );
}

export default App;
