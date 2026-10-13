import { exercises } from './model.ts';
export function createViewModel(props) {
  const questions = $derived(exercises[props().topic] ?? []);
  let index = $state(0);
  let choice = $state<number | null>(null);
  let checked = $state(false);
  const current = $derived(questions[index]);
  const shift = $derived(index % 3);
  const options = $derived(current?.options.map((_, i) => current.options[(i + shift) % 3]) ?? []);
  const correct = $derived(choice !== null && (choice + shift) % 3 === current?.answer);
  return {
    get questions() {
      return questions;
    },
    get index() {
      return index;
    },
    get current() {
      return current;
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
    next() {
      index = (index + 1) % questions.length;
      choice = null;
      checked = false;
    },
    retry() {
      choice = null;
      checked = false;
    },
  };
}
