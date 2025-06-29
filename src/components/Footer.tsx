import React from 'react';

const Footer = () => (
  <footer className="w-full py-4 bg-gradient-to-r from-blue-50 to-yellow-50 text-center text-sm text-gray-500 font-medium" style={{fontFamily: 'Inter, Rubik, sans-serif'}}>
    <div className="flex flex-col items-center justify-center gap-2">
      <span className="flex items-center gap-2">
       
        © RoadMaster 2025 built by Compass Interactives. All rights reserved.
      </span>
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs shadow hover:bg-yellow-100 hover:text-yellow-700 transition"
        style={{textDecoration: 'none'}}
      >
        <img src="/favicon-32x32.png" alt="Built on Bolt" className="h-5 w-5" />
        Built on Bolt
      </a>
    </div>
  </footer>
);

export { Footer };
