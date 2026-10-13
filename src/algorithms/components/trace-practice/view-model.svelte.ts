import { shellTrace, quickTrace, predictionOptions } from './model.ts';
export function createViewModel(props) {
  const states = $derived(
    props().id === 'shell' ? shellTrace([11, 4, 9, 2, 8, 6, 3]) : quickTrace([6, 12, 3, 9, 5, 10, 2]),
  );
  let index = $state(0);
  let choice = $state<number | null>(null);
  let checked = $state(false);
  const current = $derived(states[index]);
  const next = $derived(states[index + 1]);
  const shift = $derived(index % 3);
  const raw = $derived(next ? predictionOptions(current, next) : []);
  const options = $derived(raw.map((_, i) => raw[(i + shift) % raw.length]));
  const correct = $derived(choice !== null && options[choice] === raw[0]);
  return {
    get states() {
      return states;
    },
    get current() {
      return current;
    },
    get next() {
      return next;
    },
    get index() {
      return index;
    },
    get options() {
      return options;
    },
    get choice() {
      return choice;
    },
    get checked() {
      return checked;
    },
    get correct() {
      return correct;
    },
    choose(value) {
      choice = value;
      checked = false;
    },
    check() {
      if (choice !== null) checked = true;
    },
    advance() {
      if (next && checked && correct) {
        index++;
        choice = null;
        checked = false;
      }
    },
    restart() {
      index = 0;
      choice = null;
      checked = false;
    },
  };
}
