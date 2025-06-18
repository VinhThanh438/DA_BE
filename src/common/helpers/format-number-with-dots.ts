const units: string[] = [
    '',
    'một',
    'hai', 
    'ba',
    'bốn',
    'năm',
    'sáu',
    'bảy',
    'tám',
    'chín',
];

const tens: string[] = [
    '',
    'mười',
    'hai mươi',
    'ba mươi', 
    'bốn mươi',
    'năm mươi',
    'sáu mươi',
    'bảy mươi',
    'tám mươi',
    'chín mươi',
];

const hundreds: string[] = [
    '',
    'một trăm',
    'hai trăm',
    'ba trăm',
    'bốn trăm', 
    'năm trăm',
    'sáu trăm',
    'bảy trăm',
    'tám trăm',
    'chín trăm',
];

const bigNumbers: string[] = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

export const formatNumberWithDots = (number: number): string => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

function readThreeDigits(num: number, isFirst: boolean = false, hasNextGroup: boolean = false): string {
    const hundred = Math.floor(num / 100);
    const ten = Math.floor((num % 100) / 10);
    const unit = num % 10;

    let result = '';

    // Xử lý hàng trăm
    if (hundred > 0) {
        result += hundreds[hundred];
    }

    // Xử lý hàng chục và đơn vị
    if (ten === 0 && unit !== 0) {
        // Trường hợp 10x (x01, x02, ..., x09)
        if (hundred > 0 || (hasNextGroup && !isFirst)) {
            result += ' linh ' + units[unit];
        } else {
            result += units[unit];
        }
    } else if (ten === 1) {
        // Trường hợp 1x (10-19)
        if (unit === 0) {
            result += ' mười';
        } else if (unit === 5) {
            result += ' mười lăm';
        } else {
            result += ' mười ' + units[unit];
        }
    } else if (ten > 1) {
        // Trường hợp 2x-9x (20-99)
        if (unit === 0) {
            result += ' ' + tens[ten];
        } else if (unit === 1 && ten > 1) {
            // Xử lý trường hợp x1 (21, 31, 41, ...)
            result += ' ' + tens[ten] + ' mốt';
        } else if (unit === 5 && ten > 1) {
            // Xử lý trường hợp x5 (25, 35, 45, ...)
            result += ' ' + tens[ten] + ' lăm';
        } else {
            result += ' ' + tens[ten] + ' ' + units[unit];
        }
    }

    return result.trim();
}

export function convertMoneyText(number: number): string {
    if (number === 0) return 'không đồng';
    if (number < 0) return 'âm ' + convertMoneyText(-number);

    // Xử lý số quá lớn
    if (number >= 1000000000000000) {
        return 'số quá lớn';
    }

    const groups: number[] = [];
    let tempNumber = number;

    // Chia thành các nhóm 3 chữ số
    while (tempNumber > 0) {
        groups.unshift(tempNumber % 1000);
        tempNumber = Math.floor(tempNumber / 1000);
    }

    let words = '';
    
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const isFirst = i === 0;
        const hasNextGroup = i < groups.length - 1;
        const scale = groups.length - 1 - i;

        if (group > 0) {
            const groupWords = readThreeDigits(group, isFirst, hasNextGroup);
            
            if (groupWords) {
                // Xử lý trường hợp đặc biệt cho nhóm đầu tiên
                if (isFirst && group < 10 && groups.length > 1) {
                    // Không thêm "linh" ở đầu
                    words += groupWords;
                } else {
                    words += groupWords;
                }
                
                // Thêm đơn vị (nghìn, triệu, tỷ)
                if (scale > 0 && scale < bigNumbers.length) {
                    words += ' ' + bigNumbers[scale];
                }
                
                // Thêm khoảng trắng nếu còn nhóm tiếp theo
                if (hasNextGroup) {
                    words += ' ';
                }
            }
        }
    }

    // Làm sạch khoảng trắng thừa
    words = words.replace(/\s+/g, ' ').trim();
    
    return words + ' đồng';
}

export function capitalizeWords(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}