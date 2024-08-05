import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux';
import { Home } from '../pages/home/Home';
import { Game } from '../pages/game/Game';
import { Finished } from '../pages/finished/Finished';

export const Router = () => {
    const game = useSelector((state: RootState) => state.game);

    return (
        <>
            {game.started && game.ended ? (
                <Finished />
            ) : game.started ? (
                <Game />
            ) : (
                <Home />
            )}
        </>
    );
};
