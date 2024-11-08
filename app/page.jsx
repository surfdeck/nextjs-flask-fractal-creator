// Home.js
"use client";

import { useState } from 'react';
import ThreeDModelViewer from './three-js-model';

export default function Home() {
  const [fractalType, setFractalType] = useState('mandelbulb');
  const [size, setSize] = useState(2.0);
  const [segments, setSegments] = useState(5);
  const [desiredVertices, setDesiredVertices] = useState('');
  const [desiredFaces, setDesiredFaces] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [responseData, setResponseData] = useState(null);

  const MODEL_API_URL = "/api/generate-model";


  const handleModelSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setResponseData(null);

    let adjustedSegments = segments;

    // Adjust segments based on desired vertices or faces
    if (desiredVertices) {
      adjustedSegments = Math.max(2, Math.floor(Math.sqrt(desiredVertices)));
    } else if (desiredFaces) {
      adjustedSegments = Math.max(2, Math.floor(Math.sqrt(desiredFaces)));
    }

    const requestBody = {
      size: parseFloat(size),
      segments: adjustedSegments,
      type: fractalType,
    };

    console.log("Request Body:", requestBody); // Debugging

    try {
      const response = await fetch(MODEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate model');
      }

      const data = await response.json();
      setResponseData(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-r from-gray-800 to-gray-900 py-10 px-4">
      <h1 className="text-5xl font-bold mb-8 text-white">3D Model Generator Preview</h1>
      <form onSubmit={handleModelSubmit} className="w-full max-w-lg space-y-6 p-8 bg-gray-800 bg-opacity-75 rounded-lg shadow-2xl backdrop-blur-lg">
        {/* Fractal Type Selection */}
        <div>
          <label htmlFor="fractalType" className="block mb-2 text-white font-semibold">Fractal Type</label>
          <select
            id="fractalType"
            value={fractalType}
            onChange={(e) => setFractalType(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="mandelbulb">Mandelbulb</option>
            <option value="torus_knot">Torus Knot</option>
            <option value="apollonian_gasket">Apollonian Gasket</option>
            <option value="klein_bottle">Klein Bottle</option>
          </select>
        </div>

        {/* Size Input */}
        <div>
          <label htmlFor="size" className="block mb-2 text-white font-semibold">Size</label>
          <input
            type="number"
            id="size"
            min="0.1"
            step="0.1"
            value={size}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setSize(!isNaN(val) && val > 0 ? val : 0.1);
            }}
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Segments Input */}
        <div>
          <label htmlFor="segments" className="block mb-2 text-white font-semibold">Segments</label>
          <input
            type="number"
            id="segments"
            min="2"
            value={segments}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSegments(!isNaN(val) && val > 1 ? val : 2);
            }}
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
          <small className="text-gray-400">
            Increase the number of segments to add more detail to the model (more vertices and faces).
          </small>
        </div>

        {/* Desired Vertices Input */}
        <div>
          <label htmlFor="desiredVertices" className="block mb-2 text-white font-semibold">Desired Vertices</label>
          <input
            type="number"
            id="desiredVertices"
            min="1"
            value={desiredVertices}
            onChange={(e) => setDesiredVertices(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <small className="text-gray-400">
            Enter desired number of vertices (approximate).
          </small>
        </div>

       

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Generate Model'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 w-full max-w-lg bg-red-600 text-white rounded-lg">
          {error}
        </div>
      )}

      {/* Response Data and Model Viewer */}
      <div className="mt-8 w-full max-w-3xl p-6 bg-gray-800 bg-opacity-75 rounded-lg shadow-2xl backdrop-blur-lg">
        {responseData ? (
          <>
            <h2 className="text-3xl font-bold mb-4 text-white">{responseData.message}</h2>
            {responseData.vertices && responseData.faces && (
              <>
                <p className="text-white">
                  <strong>Vertices:</strong> {responseData.vertices.length / 3}
                </p>
                <p className="text-white">
                  <strong>Faces:</strong> {responseData.faces.length / 3}
                </p>
              </>
            )}
          </>
        ) : (
          <p className="text-white">No model generated yet. Generate a model to view it here.</p>
        )}
        <ThreeDModelViewer
          vertices={responseData && responseData.vertices ? responseData.vertices : []}
          faces={responseData && responseData.faces ? responseData.faces : []}
          renderMode="solid"
        />
      </div>
    </div>
  );
}
