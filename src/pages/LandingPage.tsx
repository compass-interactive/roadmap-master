import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface LandingPageProps {
  navigate: (path: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 w-screen">
    <Header />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 w-screen">
        <main className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 text-center">
          <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto space-y-6 px-2 sm:px-6 md:px-8">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl sm:text-3xl">R</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">RoadMaster</h1>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              The easiest way to <span className="text-blue-600 font-semibold">share</span> and <span className="text-purple-600 font-semibold">track</span> learning roadmaps.<br/>
              Create, explore, and follow curated paths to master any skill.
            </p>
            <div className="flex flex-col gap-4 justify-center mt-8 w-full sm:flex-row sm:items-center sm:gap-4 md:gap-6">
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg shadow hover:from-blue-600 hover:to-purple-700 transition"
                onClick={() => navigate('/auth')}
              >
                Get Started
              </button>
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-lg border border-blue-500 text-blue-600 font-semibold text-lg hover:bg-blue-50 transition"
                onClick={() => navigate('/auth')}
              >
                Login
              </button>
            </div>
          </div>
        </main>
      </div>
    <Footer />
  </div>
);

export default LandingPage; 