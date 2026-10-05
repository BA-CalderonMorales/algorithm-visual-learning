import { languages, languageFor } from '../../../shared/ui/code-view/languages.ts';
import { approaches, implementations, implementationHref } from './model.ts';
export function createViewModel(props) {
  const definition = $derived(implementations[props().id]);
  const language = $derived(languageFor(props().language));
  const strategy = $derived(definition.strategies[props().approach]);
  const strategyTabs = $derived(
    approaches.map((entry) => ({ ...entry, href: implementationHref(props().id, entry.id, language.id) })),
  );
  const languageTabs = $derived(
    languages.map((entry) => ({ ...entry, href: implementationHref(props().id, props().approach, entry.id) })),
  );
  return {
    get definition() {
      return definition;
    },
    get language() {
      return language;
    },
    get strategy() {
      return strategy;
    },
    get strategyTabs() {
      return strategyTabs;
    },
    get languageTabs() {
      return languageTabs;
    },
  };
}
