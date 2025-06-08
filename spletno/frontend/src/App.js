import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard';
import NotAuthorized from './pages/NotAuthorized';
import NotFound from './pages/NotFound';
import Partners from './pages/Partners';
import Logout from './components/Logout'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<UserDashboard/>}/>
        <Route path="/admin" element={<AdminDashboard/>}/>
        <Route path="/partners" element={<Partners/>}/>
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route path="/logout" element={<Logout/>}></Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
