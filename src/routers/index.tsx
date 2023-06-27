import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '@/page/Home';
import Pay from '@/page/Pay';
import Uploader from '@/page/UploadPage';
// import Choose from '@/page/choose';
import Error404 from '@/page/Error404';

function Routers() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/"
          element={<Choose />}
        /> */}

        <Route path="/"
          element={<Home />}
        />
        <Route path="/Pay"
          element={<Pay />}
        />
        <Route path="/Uploader"
          element={<Uploader/>}
        />
        <Route path="*"
          element={<Error404 />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;
