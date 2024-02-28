import axios from "axios";
import { toast } from 'react-toastify'

export const api = axios.create({
    baseURL: 'http://localhost:5000/'
})

export const createConfig = () => {
    const token = sessionStorage.getItem('token');

    return {
        headers: {
            "Content-Type": "application/json",
            'Accept': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    }
}

export const formatDate = (timeStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    const dateTime = new Date(timeStr);
    return dateTime.toLocaleString('en-US', options);
}

export async function fetchEntryLogs() {
    return await api.get('/get-list-entry-logs')
        .then(res => res.data)
        .catch(error => { toast.error(error.response.data.message); return []; });
}

export async function registerUser(payload) {
    return await api.post('/register', payload)
        .then(res => res.data)
        .catch(error => { toast.error(error.response.data.message); })
}

export async function enableCheckin() {
    await api.get('/enable-checkin').catch(error => toast.error(error.response));
}

export async function enableRegister() {
    await api.get('/enable-register').catch(error => toast.error(error.response));
}