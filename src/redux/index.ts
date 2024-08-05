import { configureStore, Reducer } from '@reduxjs/toolkit';
import gameReducer, { IGame } from './game-reducer';

const LOCAL_STORAGE_KEY = 'reduxState';

const loadState = (): Partial<Reducer<IGame>> => {
    try {
        const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedState === null) {
            return {};
        }
        return JSON.parse(serializedState);
    } catch {
        return {};
    }
};

const saveState = (state: { game: IGame }) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
    } catch (err) {
        console.log('Error when save in local storage:', err);
    }
};

export const store = configureStore({
    reducer: {
        game: gameReducer,
    },
    preloadedState: loadState(),
});

store.subscribe(() => {
    saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
