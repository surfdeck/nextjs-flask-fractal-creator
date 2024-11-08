# app.py
from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)
 
# Fractal generation functions with NaN checks
def generate_mandelbulb(size, segments):
    vertices, faces = [], []
    for i in range(segments):
        theta = np.pi * i / segments
        for j in range(segments):
            phi = 2 * np.pi * j / segments
            r = size * (1.0 + 0.2 * np.cos(3 * phi))
            x = r * np.sin(theta) * np.cos(phi)
            y = r * np.sin(theta) * np.sin(phi)
            z = r * np.cos(theta)
            if not (np.isfinite(x) and np.isfinite(y) and np.isfinite(z)):
                continue
            vertices.append([x, y, z])

    for i in range(segments - 1):
        for j in range(segments - 1):
            first = i * segments + j
            second = first + segments
            faces.extend([[first, second, first + 1], [second, second + 1, first + 1]])
    return vertices, faces

def generate_mandelbox(size, segments):
    vertices, faces = [], []
    for i in np.linspace(-size, size, segments):
        for j in np.linspace(-size, size, segments):
            for k in np.linspace(-size, size, segments):
                x, y, z = float(i), float(j), float(k)
                if not (np.isfinite(x) and np.isfinite(y) and np.isfinite(z)):
                    continue
                vertices.append([x, y, z])

    for i in range(segments - 1):
        for j in range(segments - 1):
            for k in range(segments - 1):
                first = i * segments**2 + j * segments + k
                second = first + segments
                faces.extend([[first, second, first + 1], [second, second + 1, first + 1]])
    return vertices, faces

def generate_torus_knot(size, segments):
    vertices, faces = [], []
    p, q = 2.0, 3.0
    for i in range(segments):
        theta = i * 2.0 * np.pi / segments
        for j in range(segments):
            phi = j * 2.0 * np.pi / segments
            r = size + (0.2 * size * np.cos(p * theta))
            x = r * np.cos(q * theta) * np.cos(phi)
            y = r * np.sin(q * theta) * np.cos(phi)
            z = size * np.sin(phi)
            if not (np.isfinite(x) and np.isfinite(y) and np.isfinite(z)):
                continue
            vertices.append([x, y, z])

    for i in range(segments - 1):
        for j in range(segments - 1):
            first = i * segments + j
            second = (i + 1) % segments * segments + j
            faces.extend([[first, second, first + 1], [second, second + 1, first + 1]])
    return vertices, faces

def generate_apollonian_gasket(size, segments):
    vertices, faces = [], []
    for i in range(segments):
        theta = np.pi * i / segments
        for j in range(segments):
            phi = 2 * np.pi * j / segments
            r = size * (1 + 0.5 * np.cos(4 * theta))
            x = r * np.sin(theta) * np.cos(phi)
            y = r * np.sin(theta) * np.sin(phi)
            z = r * np.cos(theta)
            if not (np.isfinite(x) and np.isfinite(y) and np.isfinite(z)):
                continue
            vertices.append([x, y, z])

    for i in range(segments - 1):
        for j in range(segments - 1):
            first = i * segments + j
            second = first + segments
            faces.extend([[first, second, first + 1], [second, second + 1, first + 1]])
    return vertices, faces

def generate_klein_bottle(size, segments):
    vertices, faces = [], []
    for i in range(segments):
        theta = 2 * np.pi * i / segments
        for j in range(segments):
            phi = 2 * np.pi * j / segments
            r = size / 2
            x = r * (np.cos(theta) * (1 + np.sin(phi)) - np.sin(theta) * np.cos(phi) * np.cos(theta))
            y = r * (np.sin(theta) * (1 + np.sin(phi)) + np.cos(theta) * np.cos(phi) * np.sin(theta))
            z = r * np.cos(phi) * np.sin(phi)
            if not (np.isfinite(x) and np.isfinite(y) and np.isfinite(z)):
                continue
            vertices.append([x, y, z])

    for i in range(segments - 1):
        for j in range(segments - 1):
            first = i * segments + j
            second = (i + 1) % segments * segments + j
            faces.extend([[first, second, first + 1], [second, second + 1, first + 1]])
    return vertices, faces

@app.route('/api/generate-model', methods=['POST'])
def generate_model():
    data = request.get_json()
    fractal_type = data.get("type")
    size = float(data.get("size", 1.0))
    segments = int(data.get("segments", 10))

    if size <= 0 or segments <= 1:
        return jsonify({"error": "Invalid size or segments provided."}), 400

    fractal_map = {
        "mandelbulb": generate_mandelbulb,
        "mandelbox": generate_mandelbox,
        "torus_knot": generate_torus_knot,
        "apollonian_gasket": generate_apollonian_gasket,
        "klein_bottle": generate_klein_bottle
    }

    generate_func = fractal_map.get(fractal_type)
    if not generate_func:
        return jsonify({"error": f"Fractal type '{fractal_type}' not recognized."}), 400

    vertices, faces = generate_func(size, segments)
    flat_vertices = [coordinate for vertex in vertices for coordinate in vertex]
    flat_faces = [index for face in faces for index in face]

    if not all(np.isfinite(flat_vertices)) or not all(np.isfinite(flat_faces)):
        return jsonify({"error": "Generated data contains invalid values."}), 500

    return jsonify({
        "vertices": flat_vertices,
        "faces": flat_faces,
        "message": f"{fractal_type.replace('_', ' ').capitalize()} generated successfully!"
    })

