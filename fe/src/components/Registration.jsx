import React, { useState, useEffect } from 'react';
import { enableCheckin, enableRegister, registerUser } from '../services/api';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify'

function Registration(props) {

    const [name, setName] = useState('');
    const [idCard, setIdCard] = useState('');
    const [isCheckin, setIsCheckin] = useState(true);

    const handleSubmit = () => {
        !isCheckin ? enableCheckin() : enableRegister();
    }

    const handleImport = async () => {
        if (window.confirm("Are you sure to register this user ?")) {
            const res = await registerUser({
                name,
                'card_id': idCard
            });
            toast.success(res.message);
        }
    }

    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('/register', (res) => {
            if (Object.keys(res).length === 0 && res.constructor === Object) {
                toast.error('Không thể dùng thẻ này');
                return;
            }
            setIdCard(res);
        });

        socket.on('/enable', () => {
            toast.success('Đã bật chế độ checkin');
            setIsCheckin(true);
        });

        socket.on('/disable', () => {
            toast.success('Đã bật chế độ register');
            setIsCheckin(false);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className='container form-control mt-3' style={{ maxWidth: '400px' }}>
            <div className='d-flex justify-content-between align-items-center mb-3'>
                <input type='text' className='form-control me-2' placeholder='Type your name here...'
                    onChange={(e) => setName(e.target.value)} value={name} />

            </div>
            <div className='d-flex justify-content-between align-items-center mb-3'>
                <div style={{
                    borderBottom: '1px solid gray',
                    width: 240,
                    textAlign: 'center',
                    padding: 6,
                    color: 'gray'
                }}>
                    {idCard || 'Scan your card'}
                </div>
                <button className='btn btn-outline-primary'
                    onClick={handleSubmit}
                >
                    {isCheckin ? 'ScanRFID' : 'Stop'}
                </button>

            </div>
            <div className='d-flex justify-content-center py-2'>
                <button className='btn btn-success'
                    disabled={name == '' || idCard == ''}
                    onClick={handleImport}>
                    Register
                </button>
            </div>
        </div>
    );
}

export default Registration;