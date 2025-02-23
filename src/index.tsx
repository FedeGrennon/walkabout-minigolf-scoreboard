import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import './css/normalize.css';
import './css/skeleton.css';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux';
import { Router } from './router';
import reportWebVitals from './reportWebVitals';
import { store } from './redux';
import { ToastContainer } from 'react-toastify';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ToastContainer limit={1} />
            <Router />
        </Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
