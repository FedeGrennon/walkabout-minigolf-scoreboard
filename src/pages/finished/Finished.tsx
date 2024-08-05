import React from 'react';
import './Finished.css';
import { useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux';
import { useDispatch } from 'react-redux';
import { clearGame, IPlayer } from '../../redux/game-reducer';

export const Finished = () => {
    const dispatch: AppDispatch = useDispatch();
    const game = useSelector((state: RootState) => state.game);

    const finishGame = () => {
        dispatch(clearGame());
    };

    const getTitle = () => {
        const winners = game.players.reduce((prev, curr) => {
            if (prev.length === 0 || curr.total === prev[0].total) {
                prev.push(curr);
            } else if (curr.total < prev[0].total) {
                prev = [];
                prev.push(curr);
            }

            return prev;
        }, [] as IPlayer[]);

        if (winners.length === 1)
            return `Congratulations, ${winners[0].name}! 🏆`;

        return 'What a thrilling tie! 🤝';
    };

    const getPlayerScoreText = (player: IPlayer) => {
        const score = player.score.reduce(
            (prev, curr) => prev + (curr.value ?? 0),
            0
        );
        return `${score > 0 ? '+' : ''}${score === 0 ? 'E' : score} (${player.total})`;
    };

    return (
        <div className="container">
            <div className="row">
                <div className="column">
                    <h2>{getTitle()}</h2>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <table className="final-table u-full-width">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...game.players]
                                .sort((a, b) => a.total - b.total)
                                .map((player) => (
                                    <tr key={player.name}>
                                        <td>{player.name}</td>
                                        <td>{getPlayerScoreText(player)}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <button onClick={finishGame} className="u-full-width">
                        PLAY AGAIN
                    </button>
                </div>
            </div>
        </div>
    );
};
