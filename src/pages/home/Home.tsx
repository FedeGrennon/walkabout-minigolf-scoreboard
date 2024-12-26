import { useState } from 'react';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux';
import { OrderMode, setGame } from '../../redux/game-reducer';
import {
    faArrowDown,
    faArrowUp,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';

const HOLES_QUANTITY = 18;

export const Home = () => {
    const dispatch: AppDispatch = useDispatch();
    const [pars, setPars] = useState<(number | string)[]>(
        Array(HOLES_QUANTITY).fill('')
    );
    const [playerName, setPlayerName] = useState('');
    const [players, setPlayers] = useState<string[]>([]);
    const [orderMode, setOrderMode] = useState<OrderMode>(OrderMode.LAST_FIRST);

    const showError = (message: string) => {
        toast(message, {
            type: 'error',
            theme: 'colored',
            autoClose: 3000,
            position: 'bottom-right',
        });
    };

    const addPlayer = () => {
        if (!playerName) return showError("The name can't be empty");

        const playerExist = players.some(
            (name) => name.toLowerCase() === playerName.toLowerCase()
        );

        if (playerExist) return showError('The name already exists');

        setPlayers((prevPlayers) => [...prevPlayers, playerName]);
        setPlayerName('');
    };

    const movePlayer = (index: number, direction: 'up' | 'down') => {
        const items = Array.from(players);

        let nextIndex = direction === 'up' ? index - 1 : index + 1;
        if (nextIndex < 0) nextIndex = players.length - 1;
        if (nextIndex === players.length) nextIndex = 0;

        items.splice(index, 1);
        items.splice(nextIndex, 0, players[index]);

        setPlayers(items);
    };

    const removePlayer = (index: number) => {
        const items = Array.from(players);
        items.splice(index, 1);
        setPlayers(items);
    };

    const changePar = (index: number, value: string) => {
        const items = Array.from(pars);
        const par = parseInt(value);
        items[index] = isNaN(par) ? '' : par;

        setPars(items);
    };

    const clearAllPars = () => {
        setPars(Array(HOLES_QUANTITY).fill(''));
    };

    const startGame = () => {
        if (players.length === 0)
            return showError('You need to add at least 1 player');
        if (pars.length < HOLES_QUANTITY)
            return showError('There must be 18 exact pars');
        if (pars.some((par) => typeof par === 'string'))
            return showError('There must be 18 exact pars');
        if (pars.some((par) => !par))
            return showError('All pars must be integers and greater than 0');
        if (pars.some((par) => typeof par === 'number' && par > 99))
            return showError('All pars must be less than 100');

        const playersMapped = players.map((playerName, i) => ({
            id: i,
            name: playerName,
            score: Array(HOLES_QUANTITY)
                .fill(undefined)
                .map(() => ({
                    value: null,
                    isEditing: false,
                })),
            total: 0,
        }));

        const holesMapped = pars.map((par, index) => ({
            number: index + 1,
            par: par as number,
        }));

        dispatch(
            setGame({
                currentHoleIndex: 0,
                playersPlayedCount: 0,
                players: playersMapped,
                courseName: 'Default course',
                holes: holesMapped,
                difficulty: {
                    value: 'easy',
                    label: 'Easy',
                },
                ended: false,
                started: true,
                orderInCurrentHole: playersMapped.map((_, i) => i),
                orderMode: orderMode,
            })
        );
    };

    const nextInput = (index: number) => {
        if (!pars[index]) return;

        const input =
            document.getElementById(`par-${index + 1}`) ??
            document.getElementById('playerInput');

        if (!input) return;

        input.focus();
    };

    const prevInput = (index: number) => {
        const input = document.getElementById(`par-${index - 1}`);

        if (!input) return;

        input.focus();
    };

    return (
        <div className="container">
            <h1 className="u-center">Walkabout Mini Golf Scoreboard</h1>

            <div className="row">
                <div className="column">
                    <label>Hole Pars</label>

                    <div className="par-grid">
                        {pars.map((_, index) => (
                            <div key={`hole-${index}`}>
                                <span>Hole {index + 1}</span>

                                <input
                                    type="number"
                                    inputMode="numeric"
                                    id={`par-${index}`}
                                    placeholder={`#${index + 1}`}
                                    maxLength={2}
                                    min={1}
                                    value={pars[index] ?? ''}
                                    onKeyDown={(e) => {
                                        if (e.code === 'Enter') {
                                            e.preventDefault();
                                            nextInput(index);
                                        } else if (e.code === 'Backspace') {
                                            if (pars[index]) return;
                                            e.preventDefault();
                                            prevInput(index);
                                        }
                                    }}
                                    onChange={(e) =>
                                        changePar(index, e.target.value)
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    <button className="u-full-width" onClick={clearAllPars}>
                        CLEAR ALL PARS
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <label>Order mode</label>

                    <select
                        className="u-full-width"
                        value={orderMode}
                        onChange={(e) =>
                            setOrderMode(e.target.value as OrderMode)
                        }
                    >
                        <option value={OrderMode.LAST_FIRST}>
                            Last is first
                        </option>
                        <option value={OrderMode.BEST_SCORE}>
                            By best score
                        </option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <label>Players</label>

                    <div className="enter-player-container">
                        <input
                            maxLength={12}
                            id="playerInput"
                            type="text"
                            placeholder="player name"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addPlayer();
                            }}
                        />
                        <button onClick={addPlayer}>ADD</button>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <ul className="player-list">
                        {players.length > 0 ? (
                            players.map((name, index) => {
                                return (
                                    <li key={name}>
                                        <p>
                                            {index + 1}. {name}
                                        </p>
                                        <div className="buttons">
                                            <FontAwesomeIcon
                                                icon={faArrowUp}
                                                onClick={() =>
                                                    movePlayer(index, 'up')
                                                }
                                            />
                                            <FontAwesomeIcon
                                                icon={faArrowDown}
                                                onClick={() =>
                                                    movePlayer(index, 'down')
                                                }
                                            />
                                            <FontAwesomeIcon
                                                icon={faXmark}
                                                onClick={() =>
                                                    removePlayer(index)
                                                }
                                            />
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <p className="player-empty">Add players</p>
                        )}
                    </ul>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <button
                        className="u-full-width"
                        onClick={() => startGame()}
                    >
                        START
                    </button>
                </div>
            </div>
        </div>
    );
};
