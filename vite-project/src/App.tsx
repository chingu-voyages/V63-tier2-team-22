import { useState } from "react";
import Header from "./assets/components/Header";

import Footer from "./assets/components/Footer";

function App() {
  return (
    <>
      <section className="flex flex-col items-center justify-center bg-gray-100 min-h-screen">
        <Header></Header>
        <div className="flex flex-col items-center justify-center gap-4 h-64"> 
          <p>Page Content</p>
        </div>
        <div className = "flex flex-row items-center justify-center gap-4 pb-20">
          <button className="bg-blue-500 text-white px-4 py-2 rounded"> Guest</button>
          <button className="bg-green-500 text-white px-4 py-2 rounded"> Auth Login</button>
        </div>
        <div className="flex flex-row items-center justify-center gap-34 ">
          <Footer></Footer>
          <h3>AI Chat Icon</h3>
        </div>
      </section>
      
    </>
  );
}

export default App;
