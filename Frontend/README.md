# Assignment Hub

A unified platform for professors and students — where students can seamlessly view and submit their assignments, and professors can efficiently track student progress. Designed to simplify and enhance the academic workflow for both students and educators.

## Project Setup Instructions

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd joineasy
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

5. **Preview the production build**
   ```bash
   npm run preview
   # or
   yarn preview
   ```

### Demo Credentials
- **Student Access**: 
  - Email: `alice@student.edu`
  - Password: `student123`
  
- **Professor Access**:
  - Email: `emily@prof.edu`
  - Password: `admin123`

## Folder Structure Overview

```
joineasy/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── animations/         # Custom animation components
│   ├── components/         # React components organized by user role
│   │   ├── Admin/          # Professor/Instructor components
│   │   ├── Login/          # Authentication components
│   │   ├── Navigationbar/  # Navigation components
│   │   └── Student/        # Student components
│   ├── context/            # Application state management
│   ├── App.css             # Global styles
│   ├── App.tsx             # Main application component and routing
│   ├── index.css           # Base styles and Tailwind directives
│   └── main.tsx            # Application entry point
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```
# Flow Diagram
<img width="1722" height="800" alt="workflow" src="https://github.com/user-attachments/assets/bb1babfc-7a94-4929-9af8-db5ea2a72cb1" />


## Component Structure and Design Decisions

### Architecture Overview

The application follows a role-based architecture with a clear separation of concerns:

1. **Authentication Layer**
   - Centralized login component that handles user authentication
   - Role-based routing that directs users to appropriate dashboards

2. **State Management**
   - React Context API for global state management
   - localStorage for data persistence across sessions
   - Mock data initialization for demonstration purposes

3. **Component Organization**
   - Role-specific component folders (Admin, Student, Login)
   - Reusable UI components (Navigation, Animation utilities)
   - Modular design for easy maintenance and scalability

### Key Design Decisions

1. **Role-Based Access Control**
   - Implementation of conditional rendering based on user roles
   - Separate dashboards for students and professors with tailored functionality

2. **Data Persistence**
   - localStorage implementation for mock data persistence
   - Automatic cleanup of orphaned submissions
   - Data initialization with sample assignments and users

3. **UI/UX Enhancements**
   - Custom animation components for interactive user experience
   - Scroll-based animations for smooth content transitions
   - Interactive background elements for visual appeal
   - Responsive design for cross-device compatibility

4. **Component Design Patterns**
   - Reusable card components for consistent data display
   - Modal patterns for creation flows
   - Confirmation dialogs for destructive actions
   - Progress visualization components

### Technical Stack

- **Core Technologies**
  - React 19.1.1: Frontend library for building user interfaces
  - TypeScript ~5.9.3: Typed superset of JavaScript for enhanced development experience
  - Vite 7.1.7: Fast build tool and development server

- **UI Libraries and Styling**
  - Tailwind CSS 4.1.16: Utility-first CSS framework for rapid UI development
  - Lucide React 0.548.0: Icon library with consistent, scalable vector icons
  - GSAP 3.13.0: Animation library for creating high-performance animations

- **State Management**
  - React Context API: Built-in state management solution for sharing data across components
  - LocalStorage: Client-side data persistence for mock assignment system

- **Development Tools**
  - ESLint 9.36.0: Code quality and consistency enforcement
  - PostCSS 8.5.6: CSS processing and transformation tool
  - Autoprefixer 10.4.21: Vendor prefixing for cross-browser compatibility

### Key Features

- **Responsive Design**: Mobile-friendly interface using Tailwind's responsive utilities
- **Interactive Animations**: Custom GSAP-based animations for enhanced UX
- **Role-Based Access Control**: Different views and permissions for students vs. professors
- **Persistent Data Storage**: Mock data system using localStorage
- **Visual Progress Tracking**: Progress bars and statistics visualization
- **Assignment Management**: Create, view, and delete assignments (professors only)
- **Submission Tracking**: Monitor student submissions and progress (professors only)






# Preview

- Login Page
&nbsp;&nbsp;&nbsp;&nbsp;<img width="1919" height="859" alt="image" src="https://github.com/user-attachments/assets/7020dbd3-a449-491e-8ae9-49d4f930bf78" />
<br>

- Student Dashboard
&nbsp;<img width="1918" height="868" alt="image" src="https://github.com/user-attachments/assets/27399e51-3b80-4430-a03b-73f2d79aecc0" />
<br>

- Professor's DashBoard
&nbsp;<img width="1918" height="871" alt="image" src="https://github.com/user-attachments/assets/25893b59-39f6-4dcd-9d5d-26cc6868d2db" />


