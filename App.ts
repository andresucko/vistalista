import { Application } from '@nativescript/core';
import { App } from './App.native';

Application.run({ create: () => new App() });