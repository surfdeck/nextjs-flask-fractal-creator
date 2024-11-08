Next.js + Flask / Python -  3D Fractal Model Generator

⚠️ Confidentiality Notice
This code and accompanying resources are provided solely for the purpose of my job application. Sharing, distributing, or using this code outside the context of recruiting is strictly prohibited.

This project combines Next.js and Flask to create an interactive 3D fractal model generator. Users can choose different fractal types, sizes, and details to customize models in real-time, all rendered with Three.js in a responsive frontend.

Overview
This app is a hybrid setup that uses Next.js with TailwindCSS for the frontend and Flask as the backend for model generation. The Flask API is integrated with Next.js via /api/ routing, allowing seamless interaction between the frontend and backend.

Frontend: Next.js with React and TailwindCSS provides a smooth UI with customizable controls.
Backend: Flask handles fractal generation using Python’s mathematical capabilities.
Key Features
Interactive 3D Fractal Model Customization: Choose fractal types (e.g., Mandelbulb, Klein Bottle), sizes, and segments to create unique 3D models.
Three.js Integration: Models are rendered in real-time with adjustable lighting, colors, and effects such as bloom and vignette.
Python-Powered Backend: Flask processes complex fractal generation functions to generate the 3D model data.
Frontend/Backend Integration: Next.js routes API calls to the Flask backend, making interaction seamless.
Prerequisites

Node.js and npm: Required for Next.js and TailwindCSS.
Python 3: Required for the Flask backend.
Setup Instructions

1. Install Node.js Dependencies
Install all frontend dependencies:

npm install
2. Set Up Python Environment
Navigate to the api folder and create a Python virtual environment:

cd api
python3 -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
3. Install Python Dependencies
Install Flask and other necessary Python libraries:

pip install -r requirements.txt
4. Run the Development Server
Start both the Flask and Next.js servers concurrently:

npm run dev
This will launch the Next.js frontend at http://localhost:3000 and the Flask API backend at http://127.0.0.1:5328.

Project Structure

├── api                    # Backend (Flask) code
│   └── app.py             # Flask app for fractal generation
├── components             # Reusable Next.js components
├── pages                  # Next.js page routes
├── public                 # Static files
└── .env                   # Environment variables (if any)
API Endpoints

The Flask backend provides key API endpoints:

POST /api/generate-model: Generates a 3D model based on fractal type and parameters.
GET /api/view-model: Fetches the most recent 3D model data for rendering.
POST /api/update-settings: Updates model generation settings dynamically.
Usage

Launch the Interface: Open http://localhost:3000 in your browser.
Customize Models: Use the form to select fractal types, adjust parameters, and apply effects (like lighting or bloom).
View 3D Models: Generated models are displayed in real-time with Three.js, allowing for rotations, color adjustments, and more.
Notes
Environment Variables: If required, add environment variables in a .env file.
Production: For production deployment, ensure to update configurations in Next.js and Flask.
License

This project is licensed under the MIT License.

Contributions

Contributions are welcome! If you have ideas for enhancements or fixes, feel free to open an issue or submit a pull request.

Acknowledgments

Thanks to OpenAI, Three.js, and Vercel for their tools and APIs that made this project possible.