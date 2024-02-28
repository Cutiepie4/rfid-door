import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { enableCheckin, fetchEntryLogs, formatDate } from '../services/api';

function Home() {
    const [listEntryLogs, setListEntryLogs] = useState([]);
    const [sectionEntryLogs, setSectionEntryLogs] = useState([]);
    const [message, setMessage] = useState('');

    function groupLogsByDate(logs) {
        const groupedArray = [];
        const groupedLogs = {};

        logs.forEach(log => {
            const date = log.time.split('T')[0];
            if (!groupedLogs[date]) {
                groupedLogs[date] = [log];
            } else {
                groupedLogs[date].push(log);
            }
        });

        Object.keys(groupedLogs).forEach(date => {
            groupedLogs[date].sort((a, b) => {
                return new Date(b.time) - new Date(a.time);
            });

            groupedArray.push({
                date,
                logs: groupedLogs[date]
            });
        });

        return groupedArray;
    }

    function getTimeFromTimestamp(timestamp) {
        const dateObj = new Date(timestamp);

        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();

        const formattedHours = hours < 10 ? `0${hours}` : hours;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${formattedHours}:${formattedMinutes}`;
    }

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetchEntryLogs();
            setListEntryLogs(res);
        };

        enableCheckin();

        fetchData();
    }, []);

    useEffect(() => {
        setSectionEntryLogs(groupLogsByDate(listEntryLogs));
    }, [listEntryLogs]);

    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('/checkin', (log) => {
            console.log(log);
            setMessage(log.name + ' vừa mới mở cửa lúc ' + getTimeFromTimestamp(log.time) + '!!!');
            setListEntryLogs(prev => [...prev, log]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    function isToday(dateString) {
        const inputDate = new Date(dateString);
        const today = new Date();

        return (
            inputDate.getFullYear() === today.getFullYear() &&
            inputDate.getMonth() === today.getMonth() &&
            inputDate.getDate() === today.getDate()
        );
    }

    return (
        <div className="container" style={{ maxWidth: 1000 }}>
            <div className='text-center' style={{ color: 'red' }}>
                {message ?? ''}
            </div>
            {sectionEntryLogs.map((item) => (
                <div className="row py-3" key={item.date}>
                    <div className="col-lg-3 border text-center rounded" style={{ backgroundColor: '#eaff7b', }}>
                        {isToday(item.date) ? 'Hôm nay' : item.date}
                    </div>
                    <div className="col-lg-9">
                        <table className="table border rounded">
                            <thead>
                                <tr>
                                    <th scope="col">Member name</th>
                                    <th scope="col">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {item.logs.map(log => (
                                    <tr key={log._id}>
                                        <td>{log.name}</td>
                                        <td>{formatDate(log.time)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Home;
