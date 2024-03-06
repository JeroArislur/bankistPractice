'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2024-03-01T23:36:17.929Z',
    '2024-03-04T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const StartLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const seg = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${seg}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    time--;
  };
  let time = 10;

  tick();

  const timer = setInterval(tick, 1000);

  return timer;
};

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date1 - date2) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = Math.abs(
    acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0)
  );
  labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// Fake allways Logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Current date
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const minutes = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minutes}`;

    const date = new Date();
    const options = {
      hours: 'numeric',
      minutes: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // const language = navigator.language;
    // console.log(language);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(date);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);

    timer = StartLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    clearInterval(timer);
    timer = StartLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.ceil(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    setTimeout(function () {
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      clearInterval(timer);
      timer = StartLogOutTimer();
    }, 3000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
  labelWelcome.textContent = 'Log in to get started';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

let arr = ['a', 'b', 'c', 'd', 'e'];

// SLICE --- DON'T MUTATE THE ORIGINAL ARRAY
console.log(arr.slice(2));
console.log(arr.slice(2, 4));
console.log(arr.slice(-2));
console.log(arr.slice(-1));
console.log(arr.slice(1, -2));
console.log(arr.slice());
console.log([...arr]);

// SPLICE --- MUTATE THE ORIGINAL ARRAY
console.log(arr.splice(2));
console.log(arr);

// REVERSE --- MUTATE THE ORIGINAL ARRAY
arr = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse());
console.log(arr2);

// CONCAT --- DON'T MUTATE THE ORIGINAL ARRAY
const letters = arr.concat(arr2);
console.log(letters);
console.log([...arr, ...arr2]);

// JOIN
console.log(letters.join(' - '));

const arr3 = [23, 11, 64];
// GETTING ARRAY ELEMENTS
console.log(arr3[0]);
console.log(arr3.at(0));
console.log(arr3[arr3.length - 1]);
console.log(arr3.slice(-1)[0]);
console.log(arr3.at(-1));

console.log('jonas'.at(0));
console.log('jonas'.at(-1));

const movementsA = [200, 450, -400, 3000, -650, -130, 70, 1300];

for (const [index, movement] of movementsA.entries()) {
  movement > 0
    ? console.log(`Movement ${index}: You deposited ${movement}`)
    : console.log(`Movement ${index}: You withdrew ${Math.abs(movement)}`);
}
console.log('---- FOREACH ----');
//CAN'T USE BREAK OUT---THE BREAK STATEMENT DON'T WORK
movementsA.forEach(function (movement, index, array) {
  movement > 0
    ? console.log(`Movement ${index}: You deposited ${movement}`)
    : console.log(`Movement ${index}: You withdrew ${Math.abs(movement)}`);
});

// FOREACH MAPS
const currencies = new Map([
  ['USD', 'United States Dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound Sterling'],
]);

currencies.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`, map);
});

// FOREACH SETS
const currenciesUnique = new Set(['UDS', 'GBP', 'UDS', 'EUR', 'EUR']);
console.log(currenciesUnique);
currenciesUnique.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`, map);
}); // The key is the same that the value because in a set don't have key, index, etc...the second parameter in the function is throwaway variable.
*/
/* Coding Challenge #1
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners
about their dog's age, and stored the data into an array (one array for each). For
now, they are just interested in knowing whether a dog is an adult or a puppy.
A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years
old.
Your tasks:
Create a function 'checkDogs', which accepts 2 arrays of dog's ages
('dogsJulia' and 'dogsKate'), and does the following things:
1. Julia found out that the owners of the first and the last two dogs actually have
cats, not dogs! So create a shallow copy of Julia's array, and remove the cat
ages from that copied array (because it's a bad practice to mutate function
parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1
is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy
🐶
")
4. Run the function for both test datasets
Test data:
§ Data 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
§ Data 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]
Hints: Use tools from all lectures in this section so far 😉
GOOD LUCK 😀


const checkDogs = function (dogsJulia, dogsKate) {
  const copyDogsJulia = dogsJulia.slice(1, -2);
  const allDogs = copyDogsJulia.concat(dogsKate);
  console.log(copyDogsJulia);
  allDogs.forEach(function (age, i) {
    const typeDog =
      age >= 3
        ? `an adult, and is ${age} years old`
        : `still a puppy
    🐶`;
    console.log(`Dog number ${i + 1} is ${typeDog}`);
  });
};

checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
console.log('----------------');
checkDogs([9, 16, 6, 8, 3], [10, 5, 6, 1, 4]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const eurToUsd = 1.1;

const movementsUSD = movements.map(mov => mov * eurToUsd);
console.log(movementsUSD);

const movementsDescription = movements.map(
  (mov, i) =>
    `Movement ${i + 1}: You ${mov > 0 ? 'deposit' : 'withdrew'} ${Math.abs(
      mov
    )}`
);
console.log(movementsDescription);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const deposits = movements.filter(mov => mov > 0);
console.log(deposits);
const withdrawals = movements.filter(mov => mov < 0);
console.log(withdrawals);

// ACCUMULATOR -> SNOWBALL
const balance = movements.reduce((acc, cur) => acc + cur, 0);
console.log(balance);

const max = movements.reduce(
  (acc, cur) => (acc > cur ? acc : (acc = cur)),
  movements[0]
);
console.log(max);
*/

/*Coding Challenge #2
Let's go back to Julia and Kate's study about dogs. This time, they want to convert
dog ages to human ages and calculate the average age of the dogs in their study.
Your tasks:
Create a function 'calcAverageHumanAge', which accepts an arrays of dog's
ages ('ages'), and does the following things in order:
1. Calculate the dog age in human years using the following formula: if the dog is
<= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old,
humanAge = 16 + dogAge * 4
2. Exclude all dogs that are less than 18 human years old (which is the same as
keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know
from other challenges how we calculate averages 😉)
4. Run the function for both test datasets
Test data:
§ Data 1: [5, 2, 4, 1, 15, 8, 3]
§ Data 2: [16, 6, 10, 5, 6, 1, 4]
GOOD LUCK 😀

const calcAverageHumanAge = arr =>
  arr
    .map(age => (age <= 2 ? age * 2 : 16 + age * 4))
    .filter((age, i, arr) => age >= 18)
    .reduce(
      (accumulater, current, i, arr2) => accumulater + current / arr2.length,
      0
    );
console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));
console.log(calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]));

const firstWithdrawal = account1.movements.find(mov => mov < 0);
console.log(firstWithdrawal);

const account = accounts.find(account => account.owner === 'Jessica Davis');
console.log(account);

for (const account of accounts) {
  console.log(account.owner === 'Jessica Davis' ? account : '');
}

// EQUALITY => true or false
console.log(account1.movements.includes(-130));

// SOME: CONDITION => true or false
console.log(account1.movements.some(mov => mov > 0));

// EVERY => true or false
console.log(account1.movements.every(mov => mov > 0));

// SEPARATE CALLBACK => DRY CODE
const deposits = mov => mov > 0;
console.log(account1.movements.some(deposits));
console.log(account1.movements.every(deposits));
console.log(account1.movements.filter(deposits));

//FLAT (levels deep)
const arr = [[1, 2, 3], [4, 5, 5], 7, 8];
console.log(arr.flat());

const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
console.log(arrDeep.flat(2));

const overalBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov);
console.log(overalBalance);

//FLATMAP => one level deep
const overalBalanceFM = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov);
console.log(overalBalanceFM);


//SORT--Strings
const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
console.log(owners.sort());
console.log(owners);

//SORT--Numbers
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
console.log(movements);

// return < 0, A, B (keep order)
//return > 0, B, A (switch order)

//Ascending
// movements.sort((a, b) => {
//   if (a > b) return 1;
//   if (a < b) return -1;
// });
//OR
movements.sort((a, b) => a - b);
console.log(movements);

//Descending
// movements.sort((a, b) => {
//   if (a > b) return -1;
//   if (a < b) return 1;
// });
//OR
movements.sort((a, b) => b - a);
console.log(movements);


const arr = [1, 2, 3, 4, 5, 6, 7];
console.log(new Array(1, 2, 3, 4, 5, 6, 7), arr);

// Empty arrays + fill method
const x = new Array(7);
console.log(x);
// console.log(x.map(() => 5));
x.fill(1, 3, 5);
x.fill(1);
console.log(x);

arr.fill(23, 2, 6);
console.log(arr);

// Array.from
const y = Array.from({ length: 7 }, () => 1);
console.log(y);

const z = Array.from({ length: 7 }, (_, i) => i + 1);
console.log(z);

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => Number(el.textContent.replace('€', ''))
  );
  console.log(movementsUI);

  const movementsUI2 = [...document.querySelectorAll('.movements__value')];
});


// Array practice methods
// 1.
const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov >= 0)
  .reduce((sum, cur) => sum + cur, 0);
console.log(bankDepositSum);

//2.
// const numDeposit1000 = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov >= 1000).length;
// console.log(numDeposit1000);

const numDeposit1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);
console.log(numDeposit1000);

// Prefixied ++ operator
let a = 10;
console.log(a++);
console.log(a);
console.log(++a);

// 3.
const { deposits, withdrawals } = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
      sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );
console.log(deposits, withdrawals);

// 4.
// this is a nice title -> This Is a Nice Title

const convertTitleCase = function (title) {
  const capitalization = str => str[0].toUpperCase() + str.slice(1);
  const exception = ['a', 'an', 'and', 'the', 'but', 'or', 'on', 'in', 'with'];
  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exception.includes(word) ? word : capitalization(word)))
    .join(' ');
  return capitalization(titleCase);
};

console.log(convertTitleCase('this is a nice title'));
console.log(convertTitleCase('this is a LONG title but not too long'));
console.log(convertTitleCase('and here is another title with an EXAMPLE'));
*/

/*Coding Challenge #4
Julia and Kate are still studying dogs, and this time they are studying if dogs are
eating too much or too little.
Eating too much means the dog's current food portion is larger than the
recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10%
above and 10% below the recommended portion (see hint).
Your tasks:
1. Loop over the 'dogs' array containing dog objects, and for each dog, calculate
the recommended food portion and add it to the object as a new property. Do
not create a new array, simply loop over the array. Forumla:
recommendedFood = weight ** 0.75 * 28. (The result is in grams of
food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too
little. Hint: Some dogs have multiple owners, so you first need to find Sarah in
the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much
('ownersEatTooMuch') and an array with all owners of dogs who eat too little
('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and
Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat
too little!"
5. Log to the console whether there is any dog eating exactly the amount of food
that is recommended (just true or false)
6. Log to the console whether there is any dog eating an okay amount of food
(just true or false)
7. Create an array containing the dogs that are eating an okay amount of food (try
to reuse the condition used in 6.)
8. Create a shallow copy of the 'dogs' array and sort it by recommended food
portion in an ascending order (keep in mind that the portions are inside the
array's objects 😉)
The Complete JavaScript Course 26
Hints:
§ Use many different tools to solve these challenges, you can use the summary
lecture to choose between them 😉
§ Being within a range 10% above and below the recommended portion means:
current > (recommended * 0.90) && current < (recommended *
1.10). Basically, the current portion should be between 90% and 110% of the
recommended portion.


const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];
dogs.forEach(
  dog => (dog.recommendedFood = Math.trunc(dog.weight ** 0.75 * 28))
);
console.log(dogs);

const foodEatOk = dog =>
  dog.curFood > dog.recommendedFood * 0.9 &&
  dog.curFood < dog.recommendedFood * 1.1;

const findDog = function (name) {
  dogs.forEach(function (dog) {
    if (dog.owners.includes(name)) {
      if (foodEatOk) {
        console.log(`It is ok ${dog.curFood} ${dog.recommendedFood}`);
      } else if (dog.curFood < dog.recommendedFood * 0.9) {
        console.log(
          `It is eating too little ${dog.curFood} ${dog.recommendedFood}`
        );
      } else if (dog.curFood > dog.recommendedFood * 1.1) {
        console.log(
          `It is eating too much ${dog.curFood} ${dog.recommendedFood}`
        );
      }
    }
  });
};
findDog('Sarah');

const ownersEatTooMuch = [];
const ownersEatTooLittle = [];

const ownerEatToo = function (dogs) {
  dogs.forEach(function (dog) {
    if (dog.curFood < dog.recommendedFood * 0.9) {
      ownersEatTooLittle.push(dog.owners);
      console.log(`${dog.owners.join(' and ')}'s dogs eat too little `);
    } else if (dog.curFood > dog.recommendedFood * 1.1) {
      ownersEatTooMuch.push(dog.owners);
      console.log(`${dog.owners.join(' and ')}'s dogs eat too much`);
    }
  });
};

ownerEatToo(dogs);
console.log(ownersEatTooLittle, ownersEatTooMuch);

const ownersEatTooMuchA = dogs
  .filter(dog => dog.curFood > dog.recommendedFood * 1.1)
  .flatMap(dog => dog.owners);
const ownersEatTooLittleA = dogs
  .filter(dog => dog.curFood < dog.recommendedFood * 0.9)
  .flatMap(dog => dog.owners);

console.log(ownersEatTooMuchA, ownersEatTooLittleA);
console.log(`${ownersEatTooMuchA.join(' and ')}'s dogs eat too much`);
console.log(`${ownersEatTooLittleA.join(' and ')}'s dogs eat too little`);

const cursFoodOkName = [];

const ownerEatTooOK = function (dogs) {
  const cursFoodSame = [];
  const cursFoodOk = [];

  dogs.forEach(function (dog) {
    cursFoodSame.push(dog.curFood === dog.recommendedFood);
    cursFoodOk.push(foodEatOk);
    if (foodEatOk) {
      cursFoodOkName.push(`${dog.owners}'s dog`);
    }
  });
  console.log(
    `there is any dog eating exactly the amount of food that is recommended: ${cursFoodSame.some(
      elem => elem === true
    )}`
  );
  console.log(
    `there is any dog eating an okay the amount of food that is recommended: ${cursFoodOk.some(
      elem => elem === true
    )}`
  );
};
ownerEatTooOK(dogs);

console.log(cursFoodOkName);

const dogsSorted = dogs
  .slice()
  .sort((a, b) => a.recommendedFood - b.recommendedFood);
console.log(dogsSorted);
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
console.log(23 === 23.0);

//Diference between base 10 (0 to 9) and binary, base 2, (0 and 1)
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

//Conversion
console.log(Number('23'));
console.log(+'23');

//Parsing
console.log(Number.parseInt('30px', 10)); // this works only if the number goes first and allways we have to define the number type
console.log(Number.parseInt('px30', 10));

console.log(Number.parseInt('  2.5rem  ')); // stop in the decimal point
console.log(Number.parseFloat('  2.5rem   ')); // the white space not affect the result

//Checking if the value is NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN('20x'));
console.log(Number.isNaN(20 / 0));
console.log(20 / 0);

//Checkinf if a value is a number
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite('20x'));
console.log(Number.isFinite(20 / 0));

console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(5, 18, 23, 2, 11));
console.log(Math.max(5, 18, '23', 2, 11)); //It works with coercion
console.log(Math.max(5, 18, '23px', 2, 11)); // It doesn't work with parsing

console.log(Math.min(5, 18, 23, 2, 11));

console.log(Math.PI * Number.parseFloat('10px') ** 2);

console.log(Math.trunc(Math.random() * 6) + 1);

const ramdomInt = (min, max) => Math.floor(Math.random() * (max - min) + min);
//Math.ramdom=0...1->*(max-min)->0...(max-min)->+min->0+min...max-min+min->min...max
console.log(ramdomInt(1, 6));

//Rounding integers
console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3));
console.log(Math.floor(23.9));

console.log(Math.trunc(23.3));
console.log(Math.floor(23.9));

console.log(Math.trunc(-23.3));
console.log(Math.floor(-23.3));

//Rounding decimal
console.log((2.3).toFixed(0));
console.log((2.3).toFixed(3));
console.log((2.345).toFixed(2));
console.log(+(2.345).toFixed(2));

//Remainder
console.log(5 % 2);
console.log(5 / 2); // = 2 * 2 + 1

console.log(8 % 3);
console.log(8 / 3); // = 3 * 2 + 2

console.log(6 % 2);
console.log(6 / 2); // = 3 * 2

console.log(7 % 2);
console.log(7 / 2); // = 3 * 2 + 1

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(15));
console.log(isEven(514));

//Create a date
const now = new Date();
console.log(now);

console.log(new Date('Aug 05 2023 17:51:02'));
console.log(new Date('December 24, 2021'));
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2024, 2, 19, 12, 30, 14, 500));
console.log(new Date(2024, 3, 34));

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));

const future = new Date(2027, 10, 19, 15, 23, 5);
console.log(future);

console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(1826648585000));

console.log(Date.now());

future.setFullYear(2024);
console.log(future);
*/
//Timers --> Set time out
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here ir your pizza with ${ing1} and ${ing2} 🍕`),
  4000,
  ...ingredients
);
console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

//Timers --> Set interval
setInterval(() => {
  const now = new Date();
  console.log(
    Intl.DateTimeFormat(account1.locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).format(now)
  );
}, 1000);
