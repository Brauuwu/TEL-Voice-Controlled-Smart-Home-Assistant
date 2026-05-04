import React, { useState, useEffect } from 'react';

function Clock() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const formattedTime = currentTime.toLocaleTimeString();
    return <div className="text-black ml-[1100px]">{formattedTime}</div>;
}
export default Clock;
