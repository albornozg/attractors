# Minimalist Attractor Visualization System

This project creates an interactive 3D visualization of four different mathematical attractors (Lorenz, Rössler, Aizawa, and Thomas) with a minimalistic user interface inspired by the aesthetics of Blade Runner and the original Alien movie.

## Features

- 3D visualization of four different strange attractors:
  - Lorenz System
  - Rössler System
  - Aizawa System
  - Thomas System
- Interactive 360-degree rotation and zoom controls
- Real-time display of particle coordinates (X, Y, Z)
- Minimalist UI with retro-futuristic terminal aesthetic
- Simulation time tracking
- Responsive design that works on different screen sizes

## Technologies Used

- HTML5
- CSS3 (with minimalist styling)
- JavaScript
- Three.js for 3D rendering
- OrbitControls for camera manipulation

## How to Use

1. Open `index.html` in a modern web browser
2. Use the buttons at the bottom to switch between different attractors
3. Click and drag to rotate the view
4. Scroll to zoom in and out
5. Use the "RESET" button to return to the default camera position

## Design Inspiration

The UI design is inspired by the minimalist computer interfaces seen in classic sci-fi films:
- The green monochrome terminal displays from the original Alien movie (MU/TH/UR 6000 computer system)
- The clean, functional interfaces from Blade Runner
- Retro-futuristic typography and layout

## Mathematical Background

The visualizations are based on systems of differential equations that exhibit chaotic behavior:

### Lorenz System
Discovered by Edward Lorenz in 1963, the Lorenz system is described by the following equations:
- dx/dt = σ(y - x)
- dy/dt = x(ρ - z) - y
- dz/dt = xy - βz

### Rössler System
Developed by Otto Rössler in 1976, the Rössler system is described by:
- dx/dt = -y - z
- dy/dt = x + ay
- dz/dt = b + z(x - c)

### Aizawa System
The Aizawa system is described by:
- dx/dt = (z - b)x - dy
- dy/dt = dx + (z - b)y
- dz/dt = c + az - z³/3 - (x² + y²)(1 + ez) + fzx³

### Thomas System
The Thomas system is a 3D strange attractor described by:
- dx/dt = sin(y) - bx
- dy/dt = sin(z) - by
- dz/dt = sin(x) - bz

Where b is a parameter that controls the damping in the system. The default value of b = 0.208186 produces elegant spiral patterns.

## License

This project is open source and available for educational and personal use.
