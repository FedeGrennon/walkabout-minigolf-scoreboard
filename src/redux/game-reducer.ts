import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum OrderMode {
    LAST_FIRST = 'last-first',
    BEST_SCORE = 'best-score',
}

export interface IDifficult {
    value: 'easy' | 'hard';
    label: string;
}

export interface IPlayerScore {
    value: number | null;
    isEditing: boolean;
}

export interface IPlayer {
    id: number;
    name: string;
    score: IPlayerScore[];
    total: number;
}

export interface IHole {
    number: number;
    par: number;
}

export interface IGame {
    currentHoleIndex: number;
    playersPlayedCount: number;
    players: IPlayer[];
    courseName: string;
    holes: IHole[];
    difficulty?: IDifficult;
    ended: boolean;
    started: boolean;
    orderMode: OrderMode;
    orderInCurrentHole: number[];
}

const initialState: IGame = {
    currentHoleIndex: 0,
    playersPlayedCount: 0,
    players: [],
    courseName: '',
    holes: [],
    difficulty: undefined,
    ended: false,
    started: false,
    orderMode: OrderMode.LAST_FIRST,
    orderInCurrentHole: [],
};

const game = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setGame: (state, action: PayloadAction<Partial<IGame>>) => {
            return {
                ...state,
                ...action.payload,
            };
        },
        clearGame: (state) => {
            return {
                ...state,
                ...initialState,
            };
        },
    },
});

export const { setGame, clearGame } = game.actions;
export default game.reducer;
