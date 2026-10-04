import { mount } from 'svelte';
import App from './app/view.svelte';
import './shared/styles/global.css';

mount(App, { target: document.getElementById('app')! });
