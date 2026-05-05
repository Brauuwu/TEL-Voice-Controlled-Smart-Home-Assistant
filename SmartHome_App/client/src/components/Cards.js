import React, { useEffect } from 'react';
import nhietDo from '../img/nhietdo.png';
import humidity from '../img/humidity.png';
import sun from '../img/sun.png';
import dobui from '../img/dobui.png';

import io from 'socket.io-client';
import API_URL from '../config';

const Cards = ({
    tempCard,
    setTempCard,
    humiCard,
    setHumiCard,
    lightCard,
    setLightCard,
    bgHumi,
    setBgHumi,
    bgTemp,
    setBgTemp,
    bgLight,
    setBgLight,
    dbCard, 
    setDbCard,
    bgDb,
    setBgDb
}) => {
    const socket = io(API_URL);
    useEffect(() => {
        socket.on('temp', (data) => {
            setTempCard(data);
            if (data <= 25) {
                setBgTemp('blue');
            } else if (data <= 35) {
                setBgTemp('orange');
            } else {
                setBgTemp('#E33539');
            }
        });
        socket.on('humi', (data) => {
            setHumiCard(data);
            if (data <= 10) {
                setBgHumi('lightcyan');
            } else if (data <= 65) {
                setBgHumi('lightblue');
            } else {
                setBgHumi('mediumturquoise');
            }
        });
        socket.on('db', (data) => {
            setDbCard(data);
            if (data <= 20) {
                setBgDb('#FFFFFF');
            } else if (data <= 60) {
                setBgDb('#DDDDDD');
            } else {
                setBgDb('#AAAAAA');
            }
        });
        socket.on('light', (data) => {
            setLightCard(data);
            if (data <= 25) {
                setBgLight('#A0A0A0');
            } 
            else if (data <= 50) {
                setBgLight('lightgoldenrodyellow');
            } 
            else {
                setBgLight("red");
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    return (
        <div className="flex justify-around">
            <div
                style={{ backgroundColor: bgTemp }}
                className="flex w-[25%] h-[150px] justify-around items-center rounded-xl  bg-clip-border text-gray-700 shadow-md border"
            >
                <img
                    src={nhietDo}
                    className={`object-contain h-[75px] mr-[-50px]`}
                />
                <div className="ml-[-50px]">
                    <p className="mb-4 text-base text-neutral-600">Nhiệt độ</p>
                    <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800 ">
                        {tempCard} &deg; C
                    </h5>
                </div>
            </div>

            {/* <div
                style={{ backgroundColor: bgDb }}
                className="flex w-[20%] justify-around items-center rounded-xl  bg-clip-border text-gray-700 shadow-md border"
            >
                <img src={dobui} className="object-contain h-[90px] mr-[-50px]" />
                <div className="ml-[-50px]">
                    <p className="mb-4 text-base text-neutral-600">Độ bụi</p>
                    <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800">
                        {dbCard} %
                    </h5>
                </div>
            </div> */}

            <div
                style={{ backgroundColor: bgHumi }}
                className="flex w-[25%] justify-around items-center rounded-xl bg-clip-border text-gray-700 shadow-md border"
            >
                <img
                    src={humidity}
                    className="object-contain h-[75px] mr-[-50px]"
                />
                <div className="ml-[-50px]">
                    <p className="mb-4 text-base text-neutral-600">Độ ẩm</p>
                    <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800">
                        {humiCard} %
                    </h5>
                </div>
            </div>

            <div
                style={{ backgroundColor: bgLight }}
                className="flex w-[25%] justify-around items-center rounded-xl  bg-clip-border text-gray-700 shadow-md border"
            >
                <img src={sun} className="object-contain h-[75px] mr-[-50px]" />
                <div className="ml-[-50px]">
                    <p className="mb-4 text-base text-neutral-600">Ánh sáng</p>
                    <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800">
                        {lightCard} lux
                    </h5>
                </div>
            </div>

        </div>
    );
};

export default Cards;
