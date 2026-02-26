import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes/AppRoutes.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;