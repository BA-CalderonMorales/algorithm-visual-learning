import { languages, languageFor } from '../../../shared/ui/code-view/languages.ts';
import { implementationNote } from '../../implementations/model.ts';
export function createViewModel(props) {
  const language = $derived(languageFor(props().language));
  const tabs = $derived(
    languages.map((entry) => ({ ...entry, href: `#/algorithms/${props().algorithm.id}/${entry.path}` })),
  );
  const note = $derived(implementationNote(props().algorithm.id, language.id));
  return {
    get language() {
      return language;
    },
    get tabs() {
      return tabs;
    },
    get note() {
      return note;
    },
  };
}
