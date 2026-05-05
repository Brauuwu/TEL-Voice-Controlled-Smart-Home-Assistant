import React, { useEffect, useState } from 'react';
import Fan_off from '../img/fan_off.png';
import Fan_on from '../img/fan_on.gif';

import io from 'socket.io-client';
import API_URL from '../config';


const Led = ({
    isCheckedLight,
    setIsCheckedLight,
    isCheckedFan,
    setIsCheckedFan,
    isCheckedLight1,
    setIsCheckedLight1,
    lightCard,
    setLightCard,
    bgLed,
    setBgLed,
    bgFan,
    setBgFan
}) => {
    const socket = io(API_URL); 

    useEffect(() => {
        
        // Listen for updates from the server
        socket.on('relay_1', (data_received) => {
            setIsCheckedLight(!data_received);
        });

        socket.on('relay_3', (data_received) => {
            setIsCheckedLight1(!data_received);
        });

        socket.on('relay_2', (data_received) => {
            setIsCheckedFan(!data_received);
            
        });

        // Clean up the socket listener when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, []);

    const handleTurnOnLight = () => {
        setIsCheckedLight(true);
        socket.emit('control_relay_1', 1); 
    };

    const handleTurnOffLight = () => {
        setIsCheckedLight(false);
        socket.emit('control_relay_1', 0);
    };

    const handleTurnOnLight1 = () => {
        setIsCheckedLight1(true);
        socket.emit('control_relay_3', 1);
    };

    const handleTurnOffLight1 = () => {
        setIsCheckedLight1(false);
        socket.emit('control_relay_3', 0);
    };

    const handleTurnOnFan = () => {
        setIsCheckedFan(true);
        socket.emit('control_relay_2', 1);
    };

    const handleTurnOffFan = () => {
       setIsCheckedFan(false);
        socket.emit('control_relay_2', 0);
    };

    return (
        <div className="flex flex-col justify-around">
            <div className="mb-[40px] flex w-[100%] justify-around items-center rounded-xl  bg-clip-border text-gray-700 shadow-md border h-[100px]"
                 style={{ backgroundColor: bgLed }}
            >
                {isCheckedLight ? (
                    <img
                        src="https://webvn.com/wp-content/uploads/2015/08/pic_bulbon.gif"
                        className="object-contain h-[75px] mr-[-50px]"
                        alt="Light is on"
                    />
                ) : (
                    <img
                        src="https://www.w3schools.com/js/pic_bulboff.gif"
                        className="object-contain h-[75px] mr-[-50px]"
                        alt="Light is off"
                    />
                )}
                <div className="ml-[-50px]">
                    <div>
                        <button
                            className={`mr-2 mt-[0.3rem] w-[80px] h-[35px] rounded-[0.4375rem] ${
                                isCheckedLight
                                    ? 'bg-primary text-white'
                                    : 'bg-neutral-300 text-black'
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
                            onClick={
                                isCheckedLight
                                    ? handleTurnOffLight
                                    : handleTurnOnLight
                            }
                        >
                            {isCheckedLight ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-[40px] flex w-[100%] justify-around items-center rounded-xl bg-white bg-clip-border text-gray-700 shadow-md border h-[100px]">
                {isCheckedLight1 ? (
                    <img
                        src="https://webvn.com/wp-content/uploads/2015/08/pic_bulbon.gif"
                        className="object-contain h-[75px] mr-[-50px]"
                        alt="Light is on"
                    />
                ) : (
                    <img
                        src="https://www.w3schools.com/js/pic_bulboff.gif"
                        className="object-contain h-[75px] mr-[-50px]"
                        alt="Light is off"
                    />
                )}
                <div className="ml-[-50px]">
                    <div>
                        <button
                            className={`mr-2 mt-[0.3rem] w-[80px] h-[35px] rounded-[0.4375rem] ${
                                isCheckedLight1
                                    ? 'bg-primary text-white'
                                    : 'bg-neutral-300 text-black'
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
                            onClick={
                                isCheckedLight1
                                    ? handleTurnOffLight1
                                    : handleTurnOnLight1
                            }
                        >
                            {isCheckedLight1 ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex w-[100%] justify-around items-center rounded-xl bg-clip-border text-gray-700 shadow-md border h-[100px]"
                style={{ backgroundColor: bgFan }}
            >
                {isCheckedFan ? (
                    <img
                        src={Fan_on}
                        className="object-contain h-[75px] mr-[-50px]"
                        alt="Fan is on"
                    />
                ) : (
                    <img
                        src={Fan_off}
                        className="object-contain h-[75px] mr-[-48px]"
                        alt="Fan is off"
                    />
                )}
                <div className="ml-[-50px]">
                    <div>
                        <button
                            className={`mr-2 mt-[0.3rem] w-[80px] h-[35px] rounded-[0.4375rem] ${
                                isCheckedFan
                                    ? 'bg-primary text-white'
                                    : 'bg-neutral-300 text-black'
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
                            onClick={
                                isCheckedFan
                                    ? handleTurnOffFan
                                    : handleTurnOnFan
                            }
                        >
                            {isCheckedFan ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Led;
