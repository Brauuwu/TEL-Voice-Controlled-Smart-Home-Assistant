import { useState } from 'react';

function useLimitedArray(initialSize) {
    const [arr, setArr] = useState(new Array(initialSize).fill(null));

    const addNewItem = (newItem) => {
        setArr((prevArr) => {
            // Clone mảng trước đó và thêm phần tử mới vào cuối mảng
            const newArr = [...prevArr];
            newArr.push(newItem);

            // Giới hạn kích thước của mảng bằng cách xóa phần tử đầu tiên nếu cần
            if (newArr.length > initialSize) {
                newArr.shift();
            }

            return newArr;
        });
    };

    return [arr, addNewItem];
}

export default useLimitedArray;
