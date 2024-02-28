import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav';
import Registration from './components/Registration';
import Home from './components/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Routes>
        <Route element={<Nav />} path='/'>
          <Route index element={<Home />} />
          <Route element={<Registration />} path='/register' />
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        draggable
        theme="light"
      />
    </>
  );
}

export default App;
