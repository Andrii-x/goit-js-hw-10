import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const input = document.querySelector('#datetime-picker');
const startButton = document.querySelector('[data-start]');
const daysValue = document.querySelector('[data-days]');
const hoursValue = document.querySelector('[data-hours]');
const minutesValue = document.querySelector('[data-minutes]');
const secondsValue = document.querySelector('[data-seconds]');

let userSelectedDate = null;
let timerId = null;

function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

function updateTimerInterface(time) {
  const { days, hours, minutes, seconds } = convertMs(time);

  daysValue.textContent = addLeadingZero(days);
  hoursValue.textContent = addLeadingZero(hours);
  minutesValue.textContent = addLeadingZero(minutes);
  secondsValue.textContent = addLeadingZero(seconds);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
  input.disabled = false;
  startButton.disabled = true;
  userSelectedDate = null;
}

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    const selectedDate = selectedDates[0];

    if (!selectedDate) {
      userSelectedDate = null;
      startButton.disabled = true;
      return;
    }

    if (selectedDate <= Date.now()) {
      userSelectedDate = null;
      startButton.disabled = true;
      iziToast.error({
        title: 'Error',
        message: 'Please choose a date in the future',
        position: 'topRight',
        timeout: 3000,
      });
      return;
    }

    userSelectedDate = selectedDate;
    startButton.disabled = false;
  },
};

flatpickr(input, options);
updateTimerInterface(0);

startButton.addEventListener('click', () => {
  if (!userSelectedDate) {
    return;
  }

  clearInterval(timerId);
  startButton.disabled = true;
  input.disabled = true;

  const tick = () => {
    const remainingTime = userSelectedDate.getTime() - Date.now();

    if (remainingTime <= 0) {
      updateTimerInterface(0);
      stopTimer();
      return;
    }

    updateTimerInterface(remainingTime);
  };

  tick();
  timerId = setInterval(tick, 1000);
});
