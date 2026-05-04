import React, { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import io from 'socket.io-client';
import Chart from 'chart.js/auto';

function DataChart({
    temp,
    setTemp,
    humi,
    setHumi,
    light,
    setLight,
    label,
    setLabel,
    db,
    setDb,
}) {
    useEffect(() => {
        const socket = io('http://localhost:8688');

        socket.on('temp', (data_received) => {
            const nhietdo = data_received;
            setTemp(nhietdo);

            const currentTime = new Date().toLocaleTimeString();
            setLabel(currentTime);
        });

        socket.on('humi', (data_received) => {
            const doam = data_received;
            setHumi(doam);
        });

        socket.on('light', (data_received) => {
            const anhsang = data_received;
            setLight(anhsang);
        });
        socket.on('db', (data_received) => {
            const dobui = data_received;
            setDb(dobui);
        });
        // Clean up the socket when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, []);

    // const reversedLabel = [...label].reverse();
    const limitDataPoints = (data, limit) => {
        const step = Math.ceil(data.length / limit);
        return data.filter((_, index) => index % step === 0);
      };
      
    const chartData = {
        labels: limitDataPoints(label, 10),
        datasets: [
            {
                label: 'Nhiệt độ',
                data: temp,
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                // fill: true,
                lineTension: 0.3,
            },
            {
                label: 'Độ ẩm',
                data: humi,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                // fill: true,
                lineTension: 0.3,
            },
            {
                label: 'Ánh sáng',
                data: light,
                borderColor: 'yellow',
                backgroundColor: 'rgba(255, 255, 0, 0.2)',
                // fill: true,
                lineTension: 0.3,
            },
        ],
    };
    // const chartData1 = {
    //     labels: limitDataPoints(label, 5),
    //     datasets: [
    //         {
    //             label: 'Độ bụi',
    //             data: db,
    //             borderColor: 'gray',
    //             backgroundColor: 'rgba(255, 255, 666, 0.2)',
    //             // fill: true,
    //             lineTension: 0.3,
    //         },
    //     ],
    // };

    // Cấu hình biểu đồ
    const chartOptions = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Hệ thống IoT',
                },
            },
        },
    };

//     const chartOptions1 = {
//         scales: {
//             x: {
//                 title: {
//                     display: true,
//                     text: 'Hệ thống IoT',
//                 },
//             },
//         },
//    };
//    const chartStyles = {
//     width: '5000px', // Đặt chiều rộng của biểu đồ
//     height: '200px', // Đặt chiều cao của biểu đồ
// };

    return (
        <div className="flex">
            <div className="border w-[1000px] rounded-lg mr-11 ml-[20px]">
                <Line data={chartData} options={chartOptions} />
            </div>
            {/* <div className="border rounded-lg mr-11 ml-[20px]" style={chartStyles}>
                <Line data={chartData1} options={chartOptions1} />
            </div> */}
        </div>
    );
}


export default DataChart;
