/*
Ð”Ð¾Ð±Ð°Ð²Ð¸Ð» Ð² ÑƒÑÐ»Ð¾Ð²Ð¸Ðµ ÑÑ€Ð°Ð·Ñƒ Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÑƒ Ð½Ð° Ð¾Ð±ÑŠÐµÐºÑ‚ Ð¸Ð· Ñ„ÑƒÐ½ÐºÑ†Ð¸Ð¸ processUserData(userdata)

    const main = () => {
        const data = fetchData();
        if (data) {
            processUserData(data);
        } else {
            console.log('Data not available.');
        }
    };
*/
const main = () => {
    const data = fetchData(); // Ñ„ÑƒÐ½ÐºÑ†Ð¸Ñ Ð½Ðµ ÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÐµÑ‚
    if (data && typeof data === 'object') {
        processUserData(data);
    } else {
        console.log('Data not available.');
    }
};

// main(); Ð½Ðµ Ð²Ñ‹Ð·Ñ‹Ð²Ð°ÐµÐ¼ Ñ‚Ð°Ðº ÐºÐ°Ðº Ð½Ðµ ÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÐµÑ‚ Ñ„ÑƒÐ½ÐºÑ†Ð¸Ð¸ fetchData()



/*
Ð£Ð±Ñ€Ð°Ð» Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÑƒ Ð½Ð° Ð¾Ð±ÑŠÐµÐºÑ‚, Ñ‚Ð°Ðº ÐºÐ°Ðº Ð¿ÐµÑ€ÐµÐ½ÐµÑ ÐµÑ‘ Ð² Ñ„ÑƒÐ½ÐºÑ†Ð¸ÑŽ main()

    function processUserData(userdata) {
        if (userdata && typeof userdata === 'object') {
            validateAndSave(userdata);
            renderUI();
        }
    }
*/
function processUserData(userdata) {
    validateAndSave(userdata);
    renderUI(); // Ñ„ÑƒÐ½ÐºÑ†Ð¸Ñ Ð½Ðµ ÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÐµÑ‚
}



/*
Ð¡Ð´ÐµÐ»Ð°Ð» Ð½ÐµÐ¼Ð½Ð¾Ð³Ð¾ Ð»ÑƒÑ‡ÑˆÐµ Ñ‡Ð¸Ñ‚Ð°ÐµÐ¼Ñ‹Ð¼ ÑƒÑÐ»Ð¾Ð²Ð¸Ðµ

    function validateAndSave(data) {
        if (!data.username || data.username.length < 4) {
            showError('Username must be at least 4 characters long.');
        } else {
            saveData(data);
        }
    }
*/
function validateAndSave(data) {
    if (data.username && data.username.length >= 4) {
        saveData(data); // Ñ„ÑƒÐ½ÐºÑ†Ð¸Ñ Ð½Ðµ ÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÐµÑ‚
    } else {
        showError('Username must be at least 4 characters long.'); // Ñ„ÑƒÐ½ÐºÑ†Ð¸Ñ Ð½Ðµ ÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÐµÑ‚
    }
}



/*
ÐŸÐµÑ€ÐµÐ¿Ð¸ÑÐ°Ð» Ñ„ÑƒÐ½ÐºÑ†Ð¸ÑŽ Ð½Ð° Ð±Ð¾Ð»ÐµÐµ Ñ‡Ð¸Ñ‚Ð°ÐµÐ¼ÑƒÑŽ (Ð¿ÐµÑ€ÐµÐ¸Ð¼ÐµÐ½Ð¾Ð²Ð°Ð» Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ñ‹Ðµ ÑÐ¾ÑÑ‚Ð¾ÑÑ‰Ð¸Ðµ
Ð¸Ð· Ð±ÑƒÐºÐ² Ð½Ð° Ð±Ð¾Ð»ÐµÐµ Ð¿Ð¾Ð½ÑÑ‚Ð½Ñ‹Ðµ ÑÐ»Ð¾Ð²Ð°)
ÐŸÐµÑ€ÐµÐ¸Ð¼ÐµÐ½Ð¾Ð²Ð°Ð» Ñ„ÑƒÐ½ÐºÑ†Ð¸ÑŽ, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð±Ñ‹Ð»Ð¾ Ð¿Ð¾Ð½ÑÑ‚Ð½Ð¾, Ñ‡Ñ‚Ð¾ Ð¾Ð½Ð° Ð´ÐµÐ»Ð°ÐµÑ‚
Ð¡Ð¾ÐºÑ€Ð°Ñ‚Ð¸Ð» reduce
Ð”Ð¾Ð±Ð°Ð²Ð¸Ð» Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÑƒ Ð½Ðµ Ð¿ÑƒÑÑ‚Ð¾Ð¹ Ð»Ð¸ Ð¼Ð°ÑÑÐ¸Ð²

    function s_d(d) {
        if (d && Array.isArray(d)) {
            return d.reduce(function (a, b) {
                return a + b;
            });
        }
        return 0;
    }
*/
function calculateArraySum(numbers) {
    if (numbers && Array.isArray(numbers) && numbers.length != 0) {
        return numbers.reduce((acc, num) => acc + num);
    }
    return 0;
}



/*
Ð¢ÐµÐ¿ÐµÑ€ÑŒ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ÑÑ Ñ„ÑƒÐ½ÐºÑ†Ð¸Ñ calculateArraySum() Ð´Ð»Ñ ÑÐ»Ð¾Ð¶ÐµÐ½Ð¸Ñ Ð²ÑÐµÑ… Ñ‡Ð¸ÑÐµÐ»

    function calculateAverage(numbers) {
        if (numbers && Array.isArray(numbers)) {
            let sum = 0;
            for (let i = 0; i < numbers.length; i++) {
                sum += numbers[i];
            }
            return sum / numbers.length;
        }
    }
*/
function calculateAverage(numbers) {

    const sum = calculateArraySum(numbers);

    if (sum != 0) {
        return sum / numbers.length;
    }
}



/*
ÐŸÐµÑ€ÐµÐ¿Ð¸ÑÐ°Ð» ÑÑ‚Ð¾Ñ‚ ÐºÐ¾Ð´ Ð² Ð±Ð¾Ð»ÐµÐµ ÐºÐ¾Ñ€Ð¾Ñ‚ÐºÐ¸Ð¹ Ð²Ð°Ñ€Ð¸Ð°Ð½Ñ‚;
ÐŸÐµÑ€ÐµÐ¸Ð¼ÐµÐ½Ð¾Ð²Ð°Ð» displayMessage Ð² displayMessageAlert

    const displayMessage = function(message) {
        alert('Message: ' + message);
    };
*/
const displayMessageAlert = message => alert('Message: ' + message);



// ÐÐµ Ð¿Ð¾Ð½ÑÑ‚Ð½Ð¾ Ð´Ð»Ñ Ñ‡ÐµÐ³Ð¾ Ñ„ÑƒÐ½ÐºÑ†Ð¸Ñ, ÐµÑÐ»Ð¸ Ð¼Ð¾Ð¶Ð½Ð¾ Ð¸ Ð±ÐµÐ· Ð½ÐµÐµ ÑƒÐ¼Ð½Ð¾Ð¶Ð°Ñ‚ÑŒ Ñ‡Ð¸ÑÐ»Ð°
const multiply = (a, b) => a * b;



// doSomething(); - Ñ„ÑƒÐ½ÐºÑ†Ð¸Ñ Ð½Ðµ ÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÐµÑ‚



/*
Ð‘ÐµÐ· ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚Ð° Ð½Ðµ Ð¿Ð¾Ð½ÑÑ‚Ð½Ð¾ Ð´Ð»Ñ Ñ‡ÐµÐ³Ð¾ ÑÑ‚Ð° Ñ„ÑƒÐ½ÐºÑ†Ð¸Ñ
ÐŸÐµÑ€ÐµÐ¸Ð¼ÐµÐ½Ð¾Ð²Ð°Ð»

    function x(y, z) {
        if (y && z) {
            return y + z;
        }
    }
*/
function validSum(y, z) {
    if (y && z) {
        return y + z;
    }
}



/*
Ð¢Ð°Ðº ÐºÐ°Ðº Ñ„ÑƒÐ½ÐºÑ†Ð¸Ñ greet(name) Ð´ÐµÐ»Ð°ÐµÑ‚ Ñ‚Ð¾Ð¶Ðµ ÑÐ°Ð¼Ð¾Ðµ, Ñ‡Ñ‚Ð¾ Ð¸ sayHello(name),
Ñ‚Ð¾ Ð¼Ñ‹ ÐµÑ‘ ÑƒÐ±Ð¸Ñ€Ð°ÐµÐ¼ Ð¸ Ð´ÐµÐ»Ð°ÐµÐ¼ Ð²Ñ‹Ð²Ð¾Ð´ Ð¿Ñ€Ð¸Ð²ÐµÑ‚ÑÑ‚Ð²Ð¸Ñ Ð´Ð»Ñ Alice Ñ‡ÐµÑ€ÐµÐ·
Ñ„ÑƒÐ½ÐºÑ†Ð¸ÑŽ sayHello('Alice') Ð½Ð¸Ð¶Ðµ

    const greet = function(name) {
        console.log(`Hello, ${name}!`);
    };
    greet('Alice');
*/

const sayHello = name => console.log(`Hello, ${name}!`);

sayHello('Alice');
sayHello('Bob');